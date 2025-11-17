import { contextBridge, ipcRenderer } from 'electron';
import type { ElectronAPI } from '../shared/types';

const api: ElectronAPI = {
  // File system operations
  selectFolder: () => ipcRenderer.invoke('fs:select-folder'),
  scanDirectory: (path: string) => ipcRenderer.invoke('fs:scan-directory', path),
  getFileStats: (path: string) => ipcRenderer.invoke('fs:get-stats', path),
  moveFile: (oldPath: string, newPath: string) =>
    ipcRenderer.invoke('fs:move-file', oldPath, newPath),
  deleteFile: (path: string) =>
    ipcRenderer.invoke('fs:delete-file', path),

  // CRUD operations
  createFile: (filePath: string, content?: string) =>
    ipcRenderer.invoke('fs:create-file', filePath, content),
  createDirectory: (dirPath: string) =>
    ipcRenderer.invoke('fs:create-directory', dirPath),
  readFile: (filePath: string) =>
    ipcRenderer.invoke('fs:read-file', filePath),
  readFileMetadata: (filePath: string) =>
    ipcRenderer.invoke('fs:read-file-metadata', filePath),
  updateFile: (filePath: string, content: string) =>
    ipcRenderer.invoke('fs:update-file', filePath, content),
  appendFile: (filePath: string, content: string) =>
    ipcRenderer.invoke('fs:append-file', filePath, content),

  // ML operations
  classifyFile: (filePath: string) =>
    ipcRenderer.invoke('ml:classify-file', filePath),
  batchClassify: (files: string[]) =>
    ipcRenderer.invoke('ml:batch-classify', files),

  // System operations
  getSystemUsage: () =>
    ipcRenderer.invoke('system:get-usage'),

  // Database operations
  getJobHistory: () =>
    ipcRenderer.invoke('db:get-job-history'),
  saveSettings: (settings: Record<string, any>) =>
    ipcRenderer.invoke('db:save-settings', settings)
  ,
  getSettings: () => ipcRenderer.invoke('db:get-settings'),
  // Compression
  compressFiles: (files: string[], outputPath: string, format?: 'zip'|'tar'|'gzip'|'7z') => ipcRenderer.invoke('fs:compress-files', files, outputPath, format),
  moveToQuarantine: (filePath: string) => ipcRenderer.invoke('fs:move-to-quarantine', filePath),
  // Duplicate finder
  findDuplicates: (path: string, options?: any) =>
    ipcRenderer.invoke('duplicates:find', path, options),
  // AutoSort methods
  startAutoSort: (sourcePath: string, options: any) =>
    ipcRenderer.invoke('autosort:start', sourcePath, options),
  getAutoSortPreview: (sourcePath: string) =>
    ipcRenderer.invoke('autosort:preview', sourcePath),
  stopAutoSort: () => ipcRenderer.invoke('autosort:stop'),
  getAutoSortStatus: () => ipcRenderer.invoke('autosort:status'),
  getAutoSortStatistics: () => ipcRenderer.invoke('autosort:statistics')
};

contextBridge.exposeInMainWorld('electronAPI', api);

declare global {
  interface Window {
    electronAPI: ElectronAPI;
  }
}
