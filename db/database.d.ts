export declare class DatabaseManager {
    private db;
    constructor(dbPath?: string);
    private initTables;  
    logJob(jobData: any): Promise<string>;
    updateJobStatus(jobId: string, status: string, progress?: number): Promise<void>;
    getJobHistory(limit?: number): Promise<any[]>;
    logClassification(data: any): Promise<void>;
    getClassifications(limit?: number): Promise<any[]>;
    saveSetting(key: string, value: any): Promise<void>;
    getSetting(key: string): Promise<any>;
    getAllSettings(): Promise<Record<string, any>>;
    logAnalyticsEvent(eventType: string, eventData: any): Promise<void>;
    close(): Promise<void>;
}
//# sourceMappingURL=database.d.ts.map
