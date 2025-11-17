export declare const useFileSystem: () => {
    files: any[];
    currentPath: string;
    isLoading: boolean;
    scanDirectory: (path: string) => Promise<any[]>;
    getFileStats: (path: string) => Promise<{
        size: number;
        modified: Date;
    }>;
};
