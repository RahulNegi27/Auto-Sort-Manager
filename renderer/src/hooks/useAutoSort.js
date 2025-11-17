import { useState, useCallback } from 'react';
export const useAutoSort = () => {
    const [isSorting, setIsSorting] = useState(false);
    const [progress, setProgress] = useState(0);
    const [currentJob, setCurrentJob] = useState(null);
    const startSorting = useCallback(async (sourcePath, options = {}) => {
        setIsSorting(true);
        setProgress(0);
        try {
            const result = await window.electronAPI.startAutoSort(sourcePath, options);
            if (result.success) {
                setCurrentJob(result.data);
                // Simulate progress updates (in real app, this would come from IPC events)
                const interval = setInterval(() => {
                    setProgress(prev => {
                        if (prev >= 100) {
                            clearInterval(interval);
                            setIsSorting(false);
                            return 100;
                        }
                        return prev + 10;
                    });
                }, 500);
            }
            else {
                throw new Error(result.error);
            }
        }
        catch (error) {
            console.error('AutoSort failed:', error);
            setIsSorting(false);
        }
    }, []);
    const stopSorting = useCallback(async () => {
        await window.electronAPI.stopAutoSort();
        setIsSorting(false);
        setProgress(0);
    }, []);
    const getPreview = useCallback(async (sourcePath) => {
        const result = await window.electronAPI.getAutoSortPreview(sourcePath);
        return result.data;
    }, []);
    const [statistics, setStatistics] = useState({
        totalFilesOrganized: 0,
        spaceSaved: '0 GB',
        accuracy: '0%',
        timeSaved: '0h 0m'
    });
    const updateStatistics = useCallback(async () => {
        try {
            // Call the preload-exposed method `getAutoSortStatistics` (ipc 'autosort:statistics')
            const raw = await window.electronAPI.getAutoSortStatistics?.();
            // raw may be undefined in some environments; guard accordingly
            if (!raw)
                return;
            // The main process returns:
            // {
            //   totalFilesOrganized: number,
            //   spaceSaved: number (bytes),
            //   averageAccuracy: number (0-1),
            //   timeSaved: number (seconds),
            //   mostCommonCategories: string[]
            // }
            const formatted = {
                totalFilesOrganized: raw.totalFilesOrganized || 0,
                spaceSaved: (() => {
                    const bytes = raw.spaceSaved || 0;
                    if (bytes <= 0)
                        return '0 GB';
                    const units = ['B', 'KB', 'MB', 'GB', 'TB'];
                    let i = 0;
                    let n = bytes;
                    while (n >= 1024 && i < units.length - 1) {
                        n = n / 1024;
                        i++;
                    }
                    return `${Number(n.toFixed((i === 0) ? 0 : 2))} ${units[i]}`;
                })(),
                accuracy: (() => {
                    // Prefer a human-friendly string from the main process when available
                    if (raw.accuracyRate && typeof raw.accuracyRate === 'string')
                        return raw.accuracyRate;
                    const a = typeof raw.averageAccuracy === 'number' ? raw.averageAccuracy : (raw.accuracy || 0);
                    const pct = Math.round((a * 100));
                    return `${pct}%`;
                })(),
                timeSaved: (() => {
                    const secs = raw.timeSaved || 0;
                    const hours = Math.floor(secs / 3600);
                    const mins = Math.floor((secs % 3600) / 60);
                    return `${hours}h ${mins}m`;
                })()
            };
            setStatistics(formatted);
        }
        catch (error) {
            console.warn('Failed to load statistics:', error);
        }
    }, []);
    return {
        startSorting,
        stopSorting,
        getPreview,
        isSorting,
        progress,
        currentJob,
        statistics,
        updateStatistics
    };
};
//# sourceMappingURL=useAutoSort.js.map