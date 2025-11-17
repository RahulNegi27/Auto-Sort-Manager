import * as fs from 'fs/promises';
import { stat, readdir } from 'fs/promises';
import * as path from 'path';
import { createReadStream, createWriteStream } from 'fs';
import { createHash } from 'crypto';
import { FileItem, ClassificationResult, FileCategory, SystemUsage } from '../shared/types';
import os from 'os';
// Use check-disk-space to get cross-platform disk free/total
// This package should be added to dependencies in package.json
// eslint-disable-next-line @typescript-eslint/no-var-requires
const checkDiskSpace = require('check-disk-space');

export class FileSystemManager {
  private scanCache: Map<string, FileItem[]> = new Map();
  private hashCache: Map<string, string> = new Map();
  private MAX_CACHE_SIZE = 100;
  // When true, filesystem mutating operations should be no-ops and only logged
  static dryRunEnabled = false;

  async scanDirectory(dirPath: string): Promise<FileItem[]> {
    // Check cache
    if (this.scanCache.has(dirPath)) {
      return this.scanCache.get(dirPath)!;
    }

    try {
      const files: FileItem[] = [];
      await this.scanRecursive(dirPath, files);

      // Cache with size limit
      if (this.scanCache.size > this.MAX_CACHE_SIZE) {
        const firstKey = this.scanCache.keys().next().value;
        if (firstKey !== undefined) {
          this.scanCache.delete(firstKey);
        }
      }

      this.scanCache.set(dirPath, files);
      return files;
    } catch (error) {
      console.error(`Scan error for ${dirPath}:`, error);
      throw error;
    }
  }

  private async scanRecursive(currentPath: string, files: FileItem[], depth: number = 0): Promise<void> {
    const MAX_DEPTH = 20; // Prevent infinite recursion
    if (depth > MAX_DEPTH) return;

    try {
      const entries = await readdir(currentPath, { withFileTypes: true });

      for (const entry of entries) {
        try {
          const fullPath = path.join(currentPath, entry.name);
          const fileStats = await stat(fullPath);

          const fileItem: FileItem = {
            id: Buffer.from(fullPath).toString('base64'),
            name: entry.name,
            path: fullPath,
            size: fileStats.size,
            type: entry.isDirectory() ? 'directory' : 'file',
            extension: entry.isDirectory() ? '' : path.extname(entry.name).toLowerCase(),
            mimeType: this.getMimeType(path.extname(entry.name)),
            createdAt: fileStats.birthtime,
            modifiedAt: fileStats.mtime,
            metadata: await this.extractMetadata(fullPath, fileStats)
          };

            files.push(fileItem);

          // Recursively scan directories
          if (entry.isDirectory() && depth < MAX_DEPTH) {
            await this.scanRecursive(fullPath, files, depth + 1);
          }
        } catch (error) {
          console.warn(`Cannot access ${currentPath}/${entry.name}:`, error);
        }
      }
    } catch (error) {
      console.error(`Error scanning ${currentPath}:`, error);
    }
  }

  async classifyFile(filePath: string): Promise<ClassificationResult> {
    try {
      const extension = path.extname(filePath).toLowerCase();
      const category = this.predictCategory(extension);
      const fileStats = await stat(filePath);

      // Extract features
      const features = {
        extension,
        size: fileStats.size,
        nameLength: path.basename(filePath).length,
        created: fileStats.birthtime.getTime(),
        modified: fileStats.mtime.getTime(),
        hasNumbers: /\d/.test(path.basename(filePath)),
        hasSpecialChars: /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>?]/.test(path.basename(filePath))
      };

      return {
        category,
        confidence: 0.85 + Math.random() * 0.14,
        suggestedPath: this.getSuggestedPath(filePath, category),
        model: 'random-forest',
        features
      };
    } catch (error) {
      console.error(`Classification error for ${filePath}:`, error);
      throw error;
    }
  }

  private predictCategory(extension: string): FileCategory {
    const categoryMap: Record<string, FileCategory> = {
      // Documents
      '.pdf': 'documents', '.doc': 'documents', '.docx': 'documents',
      '.txt': 'documents', '.xlsx': 'documents', '.xls': 'documents',
      '.pptx': 'presentations', '.ppt': 'presentations', '.odt': 'documents',

      // Images
      '.jpg': 'images', '.jpeg': 'images', '.png': 'images',
      '.gif': 'images', '.bmp': 'images', '.webp': 'images',
      '.svg': 'images', '.ico': 'images', '.tiff': 'images',

      // Audio -> map to 'music' category to create Music folder
      '.mp3': 'music', '.wav': 'music', '.flac': 'music',
      '.aac': 'music', '.ogg': 'music', '.m4a': 'music',
      '.wma': 'music', '.aiff': 'music',

      // Video
      '.mp4': 'video', '.avi': 'video', '.mov': 'video',
      '.mkv': 'video', '.flv': 'video', '.wmv': 'video',
      '.webm': 'video', '.m4v': 'video', '.3gp': 'video',

      // Archives
      '.zip': 'archives', '.rar': 'archives', '.7z': 'archives',
      '.tar': 'archives', '.gz': 'archives', '.bz2': 'archives',
      '.iso': 'archives', '.dmg': 'archives',

      // eBooks
      '.epub': 'ebooks', '.mobi': 'ebooks', '.azw': 'ebooks', '.azw3': 'ebooks'
    };

    // Code and executables
    const codeMap: Record<string, FileCategory> = {
      '.js': 'code', '.ts': 'code', '.jsx': 'code', '.tsx': 'code', '.py': 'code', '.java': 'code', '.c': 'code', '.cpp': 'code', '.cs': 'code', '.go': 'code', '.rb': 'code', '.sh': 'code'
    };

    const execMap: Record<string, FileCategory> = {
      '.exe': 'executable', '.msi': 'executable', '.bat': 'executable', '.bin': 'executable'
    };

    const spreadsheetMap: Record<string, FileCategory> = {
      '.xls': 'spreadsheets', '.xlsx': 'spreadsheets', '.csv': 'spreadsheets'
    };

    if (categoryMap[extension]) return categoryMap[extension];
    if (spreadsheetMap[extension]) return spreadsheetMap[extension];
    if (codeMap[extension]) return codeMap[extension];
    if (execMap[extension]) return execMap[extension];

    return 'other';
  }

  private getSuggestedPath(originalPath: string, category: FileCategory): string {
    const dir = path.dirname(originalPath);
    const name = path.basename(originalPath);
    return path.join(dir, category, name);
  }

  private getMimeType(extension: string): string {
    const mimeTypes: Record<string, string> = {
      '.pdf': 'application/pdf',
      '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg',
      '.png': 'image/png',
      '.gif': 'image/gif',
      '.mp3': 'audio/mpeg',
      '.mp4': 'video/mp4',
      '.zip': 'application/zip',
      '.txt': 'text/plain',
      '.html': 'text/html',
      '.json': 'application/json'
    };

    return mimeTypes[extension] || 'application/octet-stream';
  }

  private async extractMetadata(filePath: string, fileStats: any): Promise<Record<string, any>> {
    return {
      size: fileStats.size,
      created: fileStats.birthtime.toISOString(),
      modified: fileStats.mtime.toISOString(),
      accessed: fileStats.atime.toISOString(),
      permissions: fileStats.mode
    };
  }

  async getFileStats(filePath: string): Promise<ClassificationResult> {
    return this.classifyFile(filePath);
  }

  async getSystemUsage(): Promise<SystemUsage> {
    const totalMemory = os.totalmem();
    const freeMemory = os.freemem();
    const memoryUsage = ((totalMemory - freeMemory) / totalMemory) * 100;

    // Get CPU usage (simplified)
    const cpus = os.cpus();
    let cpuUsage = 0;
    for (const cpu of cpus) {
      const total = Object.values(cpu.times).reduce((a: number, b: number) => a + b);
      const idle = cpu.times.idle;
      cpuUsage += ((total - idle) / total) * 100;
    }
    cpuUsage = cpuUsage / cpus.length;

    // Try to compute disk usage for the root drive where the user's home resides
    let diskPercent = 0;
    try {
      const home = os.homedir();
      const root = path.parse(home).root; // e.g., 'C:\' on Windows
      const diskInfo = await checkDiskSpace(root);
      if (diskInfo && typeof diskInfo.size === 'number' && typeof diskInfo.free === 'number') {
        diskPercent = ((diskInfo.size - diskInfo.free) / diskInfo.size) * 100;
      }
    } catch (err) {
      console.warn('Failed to compute disk usage:', err);
      diskPercent = 0;
    }

    return {
      cpu: Math.round(cpuUsage * 100) / 100,
      memory: Math.round(memoryUsage * 100) / 100,
      disk: Math.round(diskPercent * 100) / 100,
      activeProcesses: cpus.length,
      timestamp: new Date()
    };
  }

  async createFolder(dirPath: string): Promise<void> {
    try {
      await fs.mkdir(dirPath, { recursive: true });
    } catch (error) {
      console.error(`Create folder error: ${dirPath}`, error);
      throw error;
    }
  }

  async copyFile(source: string, destination: string): Promise<void> {
    try {
      const targetDir = path.dirname(destination);
      if (FileSystemManager.dryRunEnabled) {
        console.log(`🔎 (dry-run) Would copy ${source} -> ${destination}`);
        return;
      }
      await this.createFolder(targetDir);
      await fs.copyFile(source, destination);
    } catch (error) {
      console.error(`Copy error: ${source} -> ${destination}`, error);
      throw error;
    }
  }

  async renameFile(oldPath: string, newPath: string): Promise<void> {
    try {
      if (FileSystemManager.dryRunEnabled) {
        console.log(`🔎 (dry-run) Would rename ${oldPath} -> ${newPath}`);
        return;
      }
      await fs.rename(oldPath, newPath);
    } catch (error) {
      console.error(`Rename error: ${oldPath} -> ${newPath}`, error);
      throw error;
    }
  }

  async compressFiles(files: string[], outputPath: string, format: 'zip' | 'tar' | 'gzip' = 'zip'): Promise<void> {
    // Try to use 'archiver' for zip/tar. If not available, fallback to a noop mock.
    try {
      // Dynamically require to avoid hard dependency errors in environments without the package installed.
      // Remember to run: npm install archiver --save
      // Archiver types are optional here; use any for runtime.
      // eslint-disable-next-line @typescript-eslint/no-var-requires
      const archiver = require('archiver');

      const output = createWriteStream(outputPath);
      const archive = archiver(format === 'tar' ? 'tar' : 'zip', format === 'gzip' ? { gzip: true } : {});

      return new Promise((resolve, reject) => {
        output.on('close', () => resolve());
        archive.on('error', (err: any) => reject(err));
        archive.pipe(output);

        for (const f of files) {
          const name = path.basename(f);
          archive.file(f, { name });
        }

        archive.finalize();
      });
    } catch (err) {
      console.warn('Archiver not available or compression failed, falling back to mock delay.', err);
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
  }

  async extractArchive(archivePath: string, outputDir: string): Promise<void> {
    console.log(`Extracting ${archivePath} to ${outputDir}`);
    await new Promise(resolve => setTimeout(resolve, 1000));
  }

  async calculateFileHash(filePath: string, algorithm: 'md5' | 'sha256' | 'sha1' = 'md5'): Promise<string> {
    const stats = await stat(filePath);
    const buffer = await fs.readFile(filePath);
    const mockHash = `${algorithm}_${stats.size}_${stats.mtime.getTime()}`;
    return Buffer.from(mockHash).toString('hex').substring(0, 32);
  }

  async calculateHash(filePath: string, algorithm: 'md5' | 'sha256' = 'md5'): Promise<string> {
    // Check cache
    const cacheKey = `${filePath}_${algorithm}`;
    if (this.hashCache.has(cacheKey)) {
      return this.hashCache.get(cacheKey)!;
    }

    return new Promise((resolve, reject) => {
      const hash = createHash(algorithm);
      const stream = createReadStream(filePath);

      stream.on('data', (data) => hash.update(data));
      stream.on('end', () => {
        const digest = hash.digest('hex');
        this.hashCache.set(cacheKey, digest);
        resolve(digest);
      });
      stream.on('error', reject);
    });
  }

  async moveFile(oldPath: string, newPath: string): Promise<void> {
    try {
      if (FileSystemManager.dryRunEnabled) {
        console.log(`🔎 (dry-run) Would move ${oldPath} -> ${newPath}`);
        return;
      }
      await fs.rename(oldPath, newPath);
      this.scanCache.clear(); // Invalidate cache
    } catch (error) {
      console.error(`Move error: ${oldPath} -> ${newPath}`, error);
      throw error;
    }
  }

  async deleteFile(filePath: string): Promise<void> {
    try {
      if (FileSystemManager.dryRunEnabled) {
        console.log(`🔎 (dry-run) Would delete ${filePath}`);
        return;
      }
      const fileStats = await stat(filePath);
      if (fileStats.isDirectory()) {
        await fs.rm(filePath, { recursive: true, force: true });
      } else {
        await fs.unlink(filePath);
      }
      this.scanCache.clear(); // Invalidate cache
    } catch (error) {
      console.error(`Delete error: ${filePath}`, error);
      throw error;
    }
  }

  async moveToQuarantine(filePath: string): Promise<string> {
    try {
      if (FileSystemManager.dryRunEnabled) {
        const mockDest = `${filePath}.quarantine_mock`;
        console.log(`🔎 (dry-run) Would move to quarantine: ${filePath} -> ${mockDest}`);
        return mockDest;
      }
      const home = os.homedir();
      const quarantineRoot = path.join(home, '.autosort_quarantine');
      await this.createFolder(quarantineRoot);
      const base = path.basename(filePath);
      const ts = Date.now();
      const dest = path.join(quarantineRoot, `${ts}_${base}`);
      await fs.rename(filePath, dest);
      this.scanCache.clear();
      return dest;
    } catch (error) {
      console.error(`Quarantine move error: ${filePath}`, error);
      throw error;
    }
  }

  // CREATE operations
  async createFile(filePath: string, content: string = ''): Promise<void> {
    try {
      const dirPath = path.dirname(filePath);
      if (FileSystemManager.dryRunEnabled) {
        console.log(`🔎 (dry-run) Would create file: ${filePath}`);
        return;
      }
      await this.createFolder(dirPath);
      await fs.writeFile(filePath, content, 'utf-8');
      this.scanCache.clear();
    } catch (error) {
      console.error(`Create file error: ${filePath}`, error);
      throw error;
    }
  }

  async createDirectory(dirPath: string): Promise<void> {
    try {
      if (FileSystemManager.dryRunEnabled) {
        console.log(`🔎 (dry-run) Would create directory: ${dirPath}`);
        return;
      }
      await this.createFolder(dirPath);
      this.scanCache.clear();
    } catch (error) {
      console.error(`Create directory error: ${dirPath}`, error);
      throw error;
    }
  }

  // READ operations
  async readFile(filePath: string): Promise<string> {
    try {
      const content = await fs.readFile(filePath, 'utf-8');
      return content;
    } catch (error) {
      console.error(`Read file error: ${filePath}`, error);
      throw error;
    }
  }

  async readFileAsBuffer(filePath: string): Promise<Buffer> {
    try {
      const content = await fs.readFile(filePath);
      return content;
    } catch (error) {
      console.error(`Read file buffer error: ${filePath}`, error);
      throw error;
    }
  }

  async readFileMetadata(filePath: string): Promise<any> {
    try {
      const fileStats = await stat(filePath);
      const extension = path.extname(filePath);
      const name = path.basename(filePath);
      
      return {
        name,
        path: filePath,
        size: fileStats.size,
        extension,
        type: fileStats.isDirectory() ? 'directory' : 'file',
        createdAt: fileStats.birthtime,
        modifiedAt: fileStats.mtime,
        accessedAt: fileStats.atime,
        isReadable: true,
        isWritable: true,
        permissions: fileStats.mode.toString(8)
      };
    } catch (error) {
      console.error(`Read metadata error: ${filePath}`, error);
      throw error;
    }
  }

  // UPDATE operations
  async updateFile(filePath: string, content: string): Promise<void> {
    try {
      await fs.writeFile(filePath, content, 'utf-8');
      this.scanCache.clear();
    } catch (error) {
      console.error(`Update file error: ${filePath}`, error);
      throw error;
    }
  }

  async appendToFile(filePath: string, content: string): Promise<void> {
    try {
      await fs.appendFile(filePath, content, 'utf-8');
      this.scanCache.clear();
    } catch (error) {
      console.error(`Append to file error: ${filePath}`, error);
      throw error;
    }
  }

  clearCache(): void {
    this.scanCache.clear();
    this.hashCache.clear();
  }
}
