interface UseAutoSortReturn {
    startSorting: (sourcePath: string, options?: any) => Promise<void>;
    stopSorting: () => void;
    getPreview: (sourcePath: string) => Promise<any>;
    isSorting: boolean;
    progress: number;
    currentJob: any;
    statistics: any;
    updateStatistics: () => Promise<void>;
}
export declare const useAutoSort: () => UseAutoSortReturn;
export {};
