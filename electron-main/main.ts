import { app, BrowserWindow, ipcMain, dialog, Menu } from 'electron';
import * as path from 'path';
import * as http from 'http';
import * as net from 'net';
import { FileSystemManager } from './filesystem';
import { DuplicateGroup } from '../shared/types';
import { DatabaseManager } from '../db/database';
import { AutoSortIPC } from './autosort-ipc';

const isDev = process.env.NODE_ENV === 'development';

const WINDOW_WIDTH = 1440;
const WINDOW_HEIGHT = 900;
const WINDOW_MIN_WIDTH = 1200;
const WINDOW_MIN_HEIGHT = 800;

class AutoSortApp {
  private mainWindow: BrowserWindow | null = null;
  private fsManager: FileSystemManager;
  private dbManager: DatabaseManager;

  constructor() {
    this.fsManager = new FileSystemManager();
    this.dbManager = new DatabaseManager();
    this.setupIPC();
    // Initialize AutoSort IPC handlers
    try {
      new AutoSortIPC();
    } catch (e) {
      console.warn('Failed to initialize AutoSortIPC', e);
    }
    this.createWindow();
    this.setupMenu();
  }

  private createWindow(): void {
    this.mainWindow = new BrowserWindow({
      width: WINDOW_WIDTH,
      height: WINDOW_HEIGHT,
      minWidth: WINDOW_MIN_WIDTH,
      minHeight: WINDOW_MIN_HEIGHT,
      webPreferences: {
        nodeIntegration: false,
        contextIsolation: true,
        preload: path.join(__dirname, './preload.js')
      },
      icon: path.join(__dirname, '../assets/icon.png')
    });

    const isDevelopment = isDev;

    if (isDevelopment) {
      // Try to load from dev server with HTTP probe + retry logic
      const probeUrl = (url: string, timeout = 1200): Promise<boolean> => {
        return new Promise((resolve) => {
          try {
            const req = http.request(url, { method: 'HEAD', timeout }, (res) => {
              resolve(Boolean(res.statusCode && res.statusCode < 400));
            });
            req.on('error', () => resolve(false));
            req.on('timeout', () => { req.destroy(); resolve(false); });
            req.end();
          } catch (e) {
            resolve(false);
          }
        });
      };

      const probeTCP = (host: string, port: number, timeout = 800): Promise<boolean> => {
        return new Promise((resolve) => {
          const socket = new net.Socket();
          let settled = false;
          socket.setTimeout(timeout);
          socket.once('connect', () => { settled = true; socket.destroy(); resolve(true); });
          socket.once('error', () => { if (!settled) { settled = true; resolve(false); } });
          socket.once('timeout', () => { if (!settled) { settled = true; socket.destroy(); resolve(false); } });
          socket.connect(port, host);
        });
      };

      const loadDevServer = async () => {
        const ports = [3000, 3001, 3002, 3003, 3004, 3005, 3006];
        let loaded = false;

        for (const port of ports) {
          const url = `http://127.0.0.1:${port}`;
          console.log(`Probing dev server at ${url}...`);
          // quick probe: try TCP first (fast), then HTTP HEAD as a secondary check
          const host = '127.0.0.1';
          const tcpOk = await probeTCP(host, port, 600);
          if (!tcpOk) {
            const ok = await probeUrl(url, 1000);
            if (!ok) {
              console.log(`${url} not responding (tcp/http), trying next port...`);
              continue;
            }
          }

          try {
            await this.mainWindow?.loadURL(url);
            console.log(`✅ Successfully loaded from ${url}`);
            loaded = true;
            break;
          } catch (err) {
            console.log(`Load ${url} error: ${err}, trying next...`);
          }
        }

        if (!loaded) {
          console.warn('All probed ports failed, attempting file-based fallback...');
          try {
            const fallbackPath = path.join(__dirname, '../../renderer/dist/index.html');
            await this.mainWindow?.loadFile(fallbackPath);
          } catch (err) {
            console.error('Fallback also failed:', err);
          }
        }
      };

      setTimeout(loadDevServer, 1000);

      // Open dev tools after a slight delay
      setTimeout(() => {
        this.mainWindow?.webContents.openDevTools();
      }, 2500);
    } else {
      // Load from built version
      // When running from dist/electron-main/main.js, __dirname is dist/electron-main
      // We need to go up to dist level, then into renderer/dist
      const indexPath = path.join(__dirname, '../../renderer/dist/index.html');
      console.log('Loading from production build:', indexPath);
      this.mainWindow.loadFile(indexPath);
    }

    this.mainWindow.webContents.on('did-finish-load', () => {
      console.log('✅ AutoSort app loaded');
    });

    this.mainWindow.webContents.on('did-fail-load', (event, errorCode, errorDescription) => {
      console.error(`❌ Failed to load app (Code: ${errorCode}): ${errorDescription}`);
      // Try loading from built version as fallback
      const fallbackPath = path.join(__dirname, '../../renderer/dist/index.html');
      console.log('Attempting fallback load from:', fallbackPath);
      this.mainWindow?.loadFile(fallbackPath).catch((err) => {
        console.error('Failed to load fallback:', err);
      });
    });

    this.mainWindow.on('closed', () => {
      this.mainWindow = null;
    });
  }

  private setupMenu(): void {
    const template: any[] = [
      {
        label: 'File',
        submenu: [
          {
            label: 'Exit',
            accelerator: 'CmdOrCtrl+Q',
            click: () => {
              app.quit();
            }
          }
        ]
      },
      {
        label: 'Edit',
        submenu: [
          { role: 'undo' },
          { role: 'redo' },
          { type: 'separator' },
          { role: 'cut' },
          { role: 'copy' },
          { role: 'paste' }
        ]
      },
      {
        label: 'View',
        submenu: [
          { role: 'reload' },
          { role: 'forceReload' },
          { role: 'toggleDevTools' }
        ]
      }
    ];

    const menu = Menu.buildFromTemplate(template);
    Menu.setApplicationMenu(menu);
  }

  private setupIPC(): void {
    // File system operations
    ipcMain.handle('fs:select-folder', async () => {
      if (!this.mainWindow) return null;

      const result = await dialog.showOpenDialog(this.mainWindow, {
        properties: ['openDirectory'],
        title: 'Select Folder to Organize'
      });

      return result.filePaths[0] || null;
    });

    ipcMain.handle('fs:scan-directory', async (_, dirPath: string) => {
      let jobId: string | null = null;
      try {
        jobId = await this.dbManager.logJob({ type: 'scan', status: 'started', metadata: { path: dirPath } });
        const result = await this.fsManager.scanDirectory(dirPath);
        try { await this.dbManager.updateJobStatus(jobId, 'completed', Array.isArray(result) ? result.length : 0); } catch (e) { console.warn('Failed to update job status for scan:', e); }
        return result;
      } catch (error) {
        console.error('Scan error:', error);
        if (jobId) {
          try { await this.dbManager.updateJobStatus(jobId, 'failed', 0); } catch (e) { console.warn('Failed to update failed job status for scan:', e); }
        }
        throw error;
      }
    });

    ipcMain.handle('fs:get-stats', async (_, filePath: string) => {
      try {
        return await this.fsManager.getFileStats(filePath);
      } catch (error) {
        console.error('Stats error:', error);
        throw error;
      }
    });

    ipcMain.handle('fs:move-file', async (_, oldPath: string, newPath: string) => {
      let jobId: string | null = null;
      try {
        jobId = await this.dbManager.logJob({ type: 'move', status: 'started', metadata: { from: oldPath, to: newPath } });
        const result = await this.fsManager.moveFile(oldPath, newPath);
        try { await this.dbManager.updateJobStatus(jobId, 'completed', 1); } catch (e) { console.warn('Failed to update job status for move:', e); }
        return result;
      } catch (error) {
        console.error('Move error:', error);
        if (jobId) {
          try { await this.dbManager.updateJobStatus(jobId, 'failed', 0); } catch (e) { console.warn('Failed to update failed job status for move:', e); }
        }
        throw error;
      }
    });

    ipcMain.handle('fs:delete-file', async (_, filePath: string) => {
      let jobId: string | null = null;
      try {
        jobId = await this.dbManager.logJob({ type: 'delete', status: 'started', metadata: { path: filePath } });
        const result = await this.fsManager.deleteFile(filePath);
        try { await this.dbManager.updateJobStatus(jobId, 'completed', 1); } catch (e) { console.warn('Failed to update job status for delete:', e); }
        return result;
      } catch (error) {
        console.error('Delete error:', error);
        if (jobId) {
          try { await this.dbManager.updateJobStatus(jobId, 'failed', 0); } catch (e) { console.warn('Failed to update failed job status for delete:', e); }
        }
        throw error;
      }
    });

    ipcMain.handle('fs:compress-files', async (_, files: string[], outputPath: string, format: string) => {
      let jobId: string | null = null;
      try {
        jobId = await this.dbManager.logJob({ type: 'compress', status: 'started', metadata: { filesCount: files.length, output: outputPath, format } });
        const result = await this.fsManager.compressFiles(files, outputPath, format as any);
        try { await this.dbManager.updateJobStatus(jobId, 'completed', files.length); } catch (e) { console.warn('Failed to update job status for compress:', e); }
        return result;
      } catch (error) {
        console.error('Compress error:', error);
        if (jobId) {
          try { await this.dbManager.updateJobStatus(jobId, 'failed', 0); } catch (e) { console.warn('Failed to update failed job status for compress:', e); }
        }
        throw error;
      }
    });

    ipcMain.handle('fs:move-to-quarantine', async (_, filePath: string) => {
      let jobId: string | null = null;
      try {
        jobId = await this.dbManager.logJob({ type: 'quarantine', status: 'started', metadata: { path: filePath } });
        const result = await this.fsManager.moveToQuarantine(filePath);
        try { await this.dbManager.updateJobStatus(jobId, 'completed', 1); } catch (e) { console.warn('Failed to update job status for quarantine:', e); }
        return result;
      } catch (error) {
        console.error('Quarantine error:', error);
        if (jobId) {
          try { await this.dbManager.updateJobStatus(jobId, 'failed', 0); } catch (e) { console.warn('Failed to update failed job status for quarantine:', e); }
        }
        throw error;
      }
    });

    // CRUD operations
    ipcMain.handle('fs:create-file', async (_, filePath: string, content: string = '') => {
      let jobId: string | null = null;
      try {
        jobId = await this.dbManager.logJob({ type: 'create', status: 'started', metadata: { path: filePath } });
        await this.fsManager.createFile(filePath, content);
        try { await this.dbManager.updateJobStatus(jobId, 'completed', 1); } catch (e) { console.warn('Failed to update job status for create:', e); }
        return { success: true, message: `File created: ${filePath}` };
      } catch (error) {
        console.error('Create file error:', error);
        if (jobId) {
          try { await this.dbManager.updateJobStatus(jobId, 'failed', 0); } catch (e) { console.warn('Failed to update failed job status for create:', e); }
        }
        throw error;
      }
    });

    ipcMain.handle('fs:create-directory', async (_, dirPath: string) => {
      let jobId: string | null = null;
      try {
        jobId = await this.dbManager.logJob({ type: 'mkdir', status: 'started', metadata: { path: dirPath } });
        await this.fsManager.createDirectory(dirPath);
        try { await this.dbManager.updateJobStatus(jobId, 'completed', 1); } catch (e) { console.warn('Failed to update job status for mkdir:', e); }
        return { success: true, message: `Directory created: ${dirPath}` };
      } catch (error) {
        console.error('Create directory error:', error);
        if (jobId) {
          try { await this.dbManager.updateJobStatus(jobId, 'failed', 0); } catch (e) { console.warn('Failed to update failed job status for mkdir:', e); }
        }
        throw error;
      }
    });

    ipcMain.handle('fs:read-file', async (_, filePath: string) => {
      try {
        const content = await this.fsManager.readFile(filePath);
        return { success: true, content };
      } catch (error) {
        console.error('Read file error:', error);
        throw error;
      }
    });

    ipcMain.handle('fs:read-file-metadata', async (_, filePath: string) => {
      try {
        const metadata = await this.fsManager.readFileMetadata(filePath);
        return { success: true, metadata };
      } catch (error) {
        console.error('Read metadata error:', error);
        throw error;
      }
    });

    ipcMain.handle('fs:update-file', async (_, filePath: string, content: string) => {
      let jobId: string | null = null;
      try {
        jobId = await this.dbManager.logJob({ type: 'update', status: 'started', metadata: { path: filePath } });
        await this.fsManager.updateFile(filePath, content);
        try { await this.dbManager.updateJobStatus(jobId, 'completed', 1); } catch (e) { console.warn('Failed to update job status for update:', e); }
        return { success: true, message: `File updated: ${filePath}` };
      } catch (error) {
        console.error('Update file error:', error);
        if (jobId) {
          try { await this.dbManager.updateJobStatus(jobId, 'failed', 0); } catch (e) { console.warn('Failed to update failed job status for update:', e); }
        }
        throw error;
      }
    });

    ipcMain.handle('fs:append-file', async (_, filePath: string, content: string) => {
      let jobId: string | null = null;
      try {
        jobId = await this.dbManager.logJob({ type: 'append', status: 'started', metadata: { path: filePath } });
        await this.fsManager.appendToFile(filePath, content);
        try { await this.dbManager.updateJobStatus(jobId, 'completed', 1); } catch (e) { console.warn('Failed to update job status for append:', e); }
        return { success: true, message: `Content appended to: ${filePath}` };
      } catch (error) {
        console.error('Append file error:', error);
        if (jobId) {
          try { await this.dbManager.updateJobStatus(jobId, 'failed', 0); } catch (e) { console.warn('Failed to update failed job status for append:', e); }
        }
        throw error;
      }
    });

    // ML operations
    ipcMain.handle('ml:classify-file', async (_, filePath: string) => {
      try {
        const result = await this.fsManager.classifyFile(filePath);
        await this.dbManager.logClassification(result);
        return result;
      } catch (error) {
        console.error('Classification error:', error);
        throw error;
      }
    });

    ipcMain.handle('ml:batch-classify', async (_, files: string[]) => {
      try {
        const results = await Promise.all(
          files.map(file => this.fsManager.classifyFile(file))
        );
        return results;
      } catch (error) {
        console.error('Batch classification error:', error);
        throw error;
      }
    });

    // System operations
    ipcMain.handle('system:get-usage', async () => {
      try {
        return await this.fsManager.getSystemUsage();
      } catch (error) {
        console.error('System usage error:', error);
        throw error;
      }
    });

    // Database operations
    ipcMain.handle('db:get-job-history', async () => {
      try {
        return await this.dbManager.getJobHistory();
      } catch (error) {
        console.error('DB error:', error);
        throw error;
      }
    });

    ipcMain.handle('db:save-settings', async (_, settings: Record<string, any>) => {
      try {
        for (const [key, value] of Object.entries(settings)) {
          await this.dbManager.saveSetting(key, value);
        }
      } catch (error) {
        console.error('Settings error:', error);
        throw error;
      }
    });

    ipcMain.handle('db:get-settings', async () => {
      try {
        return await this.dbManager.getAllSettings();
      } catch (error) {
        console.error('Get settings error:', error);
        throw error;
      }
    });

    // Duplicate finder
    ipcMain.handle('duplicates:find', async (_, dirPath: string, options?: any) => {
      let jobId: string | null = null;
      try {
        jobId = await this.dbManager.logJob({ type: 'duplicates', status: 'started', metadata: { path: dirPath, options } });
        const minSize = options?.minSize || 1; // bytes
        const files = await this.fsManager.scanDirectory(dirPath);
        const fileFiles = files.filter(f => f.type === 'file' && f.size >= minSize);

        // Calculate hashes in parallel (be cautious on huge directories)
        const hashPromises = fileFiles.map(async (f) => {
          try {
            const hash = await this.fsManager.calculateHash(f.path, 'md5');
            return { file: f, hash };
          } catch (e) {
            return { file: f, hash: null };
          }
        });

        const hashed = await Promise.all(hashPromises);

        // Group by hash
        const groupsMap = new Map<string, { files: typeof fileFiles; totalSize: number }>();
        for (const h of hashed) {
          if (!h.hash) continue;
          const arr = groupsMap.get(h.hash);
          if (!arr) {
            groupsMap.set(h.hash, { files: [h.file], totalSize: h.file.size });
          } else {
            arr.files.push(h.file);
            arr.totalSize += h.file.size;
          }
        }

        const result: DuplicateGroup[] = [];
        for (const [hash, val] of groupsMap.entries()) {
          if (val.files.length < 2) continue;
          const dupGroup: DuplicateGroup = {
            id: hash,
            files: val.files.map(f => ({
              id: f.id,
              path: f.path,
              name: f.name,
              size: f.size,
              modified: f.modifiedAt,
              preview: undefined,
              selected: false,
              isOriginal: false
            })),
            totalSize: val.totalSize,
            hash,
            type: 'exact'
          };
          result.push(dupGroup);
        }

        // --- Additional: detect "similar" duplicates ---
        // Heuristic: files with the same size and similar filenames (levenshtein similarity)
        const inExact = new Set<string>();
        for (const g of result) for (const f of g.files) inExact.add(f.path);

        // Collect remaining files not already grouped
        const remaining = fileFiles.filter(f => !inExact.has(f.path));

        // Group by size as a cheap prefilter
        const sizeMap = new Map<number, any[]>();
        for (const f of remaining) {
          let bucket = sizeMap.get(f.size);
          if (!bucket) {
            bucket = [];
            sizeMap.set(f.size, bucket);
          }
          bucket.push(f);
        }

        // Simple levenshtein distance for name similarity
        const levenshtein = (a: string, b: string): number => {
          const as = a || '';
          const bs = b || '';
          const m = as.length, n = bs.length;
          if (m === 0) return n;
          if (n === 0) return m;
          const dp = new Array(m + 1).fill(0).map(() => new Array(n + 1).fill(0));
          for (let i = 0; i <= m; i++) dp[i][0] = i;
          for (let j = 0; j <= n; j++) dp[0][j] = j;
          for (let i = 1; i <= m; i++) {
            for (let j = 1; j <= n; j++) {
              const cost = as[i - 1] === bs[j - 1] ? 0 : 1;
              dp[i][j] = Math.min(dp[i - 1][j] + 1, dp[i][j - 1] + 1, dp[i - 1][j - 1] + cost);
            }
          }
          return dp[m][n];
        };

        const normalizeName = (name: string) => name.toLowerCase().replace(/[^a-z0-9]+/g, '');

        for (const [size, arr] of sizeMap.entries()) {
          if (!arr || arr.length < 2) continue;
          // Compare pairwise and cluster together when similarity above threshold
          const clusters: any[] = [];
          const used = new Array(arr.length).fill(false);
          for (let i = 0; i < arr.length; i++) {
            if (used[i]) continue;
            const base = arr[i];
            const cluster = [base];
            used[i] = true;
            const baseNorm = normalizeName(base.name);
            for (let j = i + 1; j < arr.length; j++) {
              if (used[j]) continue;
              const other = arr[j];
              const otherNorm = normalizeName(other.name);
              const maxLen = Math.max(baseNorm.length, otherNorm.length) || 1;
              const dist = levenshtein(baseNorm, otherNorm);
              const similarity = 1 - (dist / maxLen);
              if (similarity >= 0.6) { // threshold
                cluster.push(other);
                used[j] = true;
              }
            }
            if (cluster.length > 1) clusters.push(cluster);
          }

          for (const c of clusters) {
            const id = `similar_${size}_${normalizeName(c[0].name).slice(0,12)}_${c.length}`;
            const dupGroup: DuplicateGroup = {
              id,
              files: c.map((f: any) => ({ id: f.id, path: f.path, name: f.name, size: f.size, modified: f.modifiedAt, preview: undefined, selected: false, isOriginal: false })),
              totalSize: c.reduce((s: number, x: any) => s + x.size, 0),
              hash: id,
              type: 'similar'
            };
            result.push(dupGroup);
          }
        }

        try { await this.dbManager.updateJobStatus(jobId, 'completed', result.length); } catch (e) { console.warn('Failed to update job status for duplicates:', e); }
        return result;
      } catch (error) {
        console.error('Duplicates find error:', error);
        if (jobId) {
          try { await this.dbManager.updateJobStatus(jobId, 'failed', 0); } catch (e) { console.warn('Failed to update failed job status for duplicates:', e); }
        }
        throw error;
      }
    });
  }
}

app.whenReady().then(() => {
  new AutoSortApp();
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    new AutoSortApp();
  }
});
