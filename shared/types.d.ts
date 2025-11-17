export interface FileItem {
    id: string;
    name: string;
    path: string;
    size: number;
    type: 'file' | 'directory';
    extension: string;
    mimeType: string;
    createdAt: Date;
    modifiedAt: Date;
    metadata?: Record<string, any>;
}
export interface ClassificationResult {
    category: FileCategory;
    confidence: number;
    suggestedPath: string;
    model: string;
    features: Record<string, any>;
}
export type FileCategory = 'documents' | 'images' | 'music' | 'audio' | 'video' | 'archives' | 'code' | 'executable' | 'spreadsheets' | 'presentations' | 'ebooks' | 'other';
export interface ScanStats {
    totalFiles: number;
    totalSize: number;
    organizedCount: number;
    organizedSize: number;
    byCategory: Record<FileCategory, number>;
    startTime: Date;
    endTime?: Date;
    duration?: number;
}
export interface SystemUsage {
    cpu: number;
    memory: number;
    disk: number;
    activeProcesses: number;
    timestamp: Date;
}
export interface CompressionJob {
    id: string;
    name: string;
    type: 'zip' | 'tar' | 'gzip' | '7z';
    status: 'queued' | 'running' | 'completed' | 'error';
    progress: number;
    originalSize: number;
    compressedSize: number;
    ratio: number;
    files: number;
    startTime?: Date;
    endTime?: Date;
    errorMessage?: string;
}
export interface DuplicateGroup {
    id: string;
    files: DuplicateFile[];
    totalSize: number;
    hash: string;
    type: 'exact' | 'similar';
}
export interface DuplicateFile {
    id: string;
    path: string;
    name: string;
    size: number;
    modified: Date;
    preview?: string;
    selected: boolean;
    isOriginal: boolean;
}
export interface IpcChannels {
    'fs:select-folder': () => Promise<string | null>;
    'fs:scan-directory': (path: string) => Promise<FileItem[]>;
    'fs:get-stats': (path: string) => Promise<ClassificationResult>;
    'fs:move-file': (oldPath: string, newPath: string) => Promise<void>;
    'fs:delete-file': (path: string) => Promise<void>;
    'fs:compress-files': (files: string[], outputPath: string, format: string) => Promise<void>;
    'fs:move-to-quarantine': (filePath: string) => Promise<string>;
    'ml:classify-file': (filePath: string) => Promise<ClassificationResult>;
    'ml:batch-classify': (files: string[]) => Promise<ClassificationResult[]>;
    'autosort:start': (sourcePath: string, options?: any) => Promise<any>;
    'autosort:preview': (sourcePath: string) => Promise<any>;
    'autosort:stop': () => Promise<void>;
    'autosort:status': () => Promise<any>;
    'autosort:statistics': () => Promise<any>;
    'system:get-usage': () => Promise<SystemUsage>;
    'db:get-job-history': () => Promise<CompressionJob[]>;
    'db:get-settings': () => Promise<Record<string, any>>;
    'db:save-settings': (settings: Record<string, any>) => Promise<void>;
    'duplicates:find': (path: string, options?: any) => Promise<DuplicateGroup[]>;
}
export interface ElectronAPI {
    selectFolder: () => Promise<string | null>;
    scanDirectory: (path: string) => Promise<FileItem[]>;
    getFileStats: (path: string) => Promise<ClassificationResult>;
    moveFile: (oldPath: string, newPath: string) => Promise<void>;
    deleteFile: (path: string) => Promise<void>;
    createFile: (filePath: string, content?: string) => Promise<any>;
    createDirectory: (dirPath: string) => Promise<any>;
    readFile: (filePath: string) => Promise<any>;
    readFileMetadata: (filePath: string) => Promise<any>;
    updateFile: (filePath: string, content: string) => Promise<any>;
    appendFile: (filePath: string, content: string) => Promise<any>;
    classifyFile: (filePath: string) => Promise<ClassificationResult>;
    batchClassify: (files: string[]) => Promise<ClassificationResult[]>;
    getSystemUsage: () => Promise<SystemUsage>;
    getJobHistory: () => Promise<CompressionJob[]>;
    getSettings: () => Promise<Record<string, any>>;
    saveSettings: (settings: Record<string, any>) => Promise<void>;
    findDuplicates: (path: string, options?: any) => Promise<DuplicateGroup[]>;
    compressFiles: (files: string[], outputPath: string, format?: 'zip' | 'tar' | 'gzip' | '7z') => Promise<void>;
    moveToQuarantine: (filePath: string) => Promise<string>;
    startAutoSort: (sourcePath: string, options?: any) => Promise<any>;
    getAutoSortPreview: (sourcePath: string) => Promise<any>;
    stopAutoSort: () => Promise<void>;
    getAutoSortStatus: () => Promise<any>;
    getAutoSortStatistics: () => Promise<any>;
}
