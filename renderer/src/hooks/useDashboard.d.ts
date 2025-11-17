export declare const useDashboard: () => {
    stats: any;
    systemUsage: {
        cpu: number;
        memory: number;
        disk: number;
        activeProcesses: number;
        timestamp: Date;
    };
    isLoading: boolean;
};
