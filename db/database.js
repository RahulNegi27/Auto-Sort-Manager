"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.DatabaseManager = void 0;
const sqlite3_1 = __importDefault(require("sqlite3"));
const path = __importStar(require("path"));
class DatabaseManager {
    constructor(dbPath) {
        const finalPath = dbPath || path.join(process.cwd(), 'autosort.db');
        this.db = new sqlite3_1.default.Database(finalPath);
        this.initTables();
    }
    initTables() {
        // Jobs table for compression and organization tasks
        this.db.run(`
      CREATE TABLE IF NOT EXISTS jobs (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        uuid TEXT UNIQUE NOT NULL,
        type TEXT NOT NULL,
        status TEXT NOT NULL,
        start_time DATETIME DEFAULT CURRENT_TIMESTAMP,
        end_time DATETIME,
        files_processed INTEGER DEFAULT 0,
        total_files INTEGER DEFAULT 0,
        error_message TEXT,
        metadata TEXT
      )
    `);
        // File classifications table
        this.db.run(`
      CREATE TABLE IF NOT EXISTS file_classifications (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        file_path TEXT UNIQUE NOT NULL,
        original_category TEXT,
        predicted_category TEXT,
        confidence REAL,
        model_used TEXT,
        features TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);
        // System logs table
        this.db.run(`
      CREATE TABLE IF NOT EXISTS system_logs (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        level TEXT NOT NULL,
        message TEXT NOT NULL,
        component TEXT,
        timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);
        // Settings table
        this.db.run(`
      CREATE TABLE IF NOT EXISTS settings (
        key TEXT PRIMARY KEY,
        value TEXT NOT NULL,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);
        // Analytics table
        this.db.run(`
      CREATE TABLE IF NOT EXISTS analytics (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        event_type TEXT NOT NULL,
        event_data TEXT,
        timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);
    }
    async logJob(jobData) {
        return new Promise((resolve, reject) => {
            const uuid = jobData.id || `job_${Date.now()}`;
            this.db.run(`INSERT INTO jobs (uuid, type, status, files_processed, total_files, metadata)
         VALUES (?, ?, ?, ?, ?, ?)`, [
                uuid,
                jobData.type,
                jobData.status,
                jobData.filesProcessed || 0,
                jobData.totalFiles || 0,
                JSON.stringify(jobData.metadata || {})
            ], function (err) {
                if (err)
                    reject(err);
                else
                    resolve(uuid);
            });
        });
    }
    async updateJobStatus(jobId, status, progress = 0) {
        return new Promise((resolve, reject) => {
            this.db.run(`UPDATE jobs SET status = ?, files_processed = ? WHERE uuid = ?`, [status, progress, jobId], function (err) {
                if (err)
                    reject(err);
                else
                    resolve();
            });
        });
    }
    async getJobHistory(limit = 100) {
        return new Promise((resolve, reject) => {
            this.db.all(`SELECT * FROM jobs ORDER BY start_time DESC LIMIT ?`, [limit], (err, rows) => {
                if (err)
                    reject(err);
                else
                    resolve(rows || []);
            });
        });
    }
    async logClassification(data) {
        return new Promise((resolve, reject) => {
            this.db.run(`INSERT OR REPLACE INTO file_classifications
         (file_path, original_category, predicted_category, confidence, model_used, features)
         VALUES (?, ?, ?, ?, ?, ?)`, [
                data.filePath,
                data.originalCategory || null,
                data.predictedCategory,
                data.confidence,
                data.modelUsed,
                JSON.stringify(data.features)
            ], function (err) {
                if (err)
                    reject(err);
                else
                    resolve();
            });
        });
    }
    async getClassifications(limit = 100) {
        return new Promise((resolve, reject) => {
            this.db.all(`SELECT * FROM file_classifications ORDER BY created_at DESC LIMIT ?`, [limit], (err, rows) => {
                if (err)
                    reject(err);
                else
                    resolve(rows || []);
            });
        });
    }
    async saveSetting(key, value) {
        return new Promise((resolve, reject) => {
            this.db.run(`INSERT OR REPLACE INTO settings (key, value, updated_at)
         VALUES (?, ?, CURRENT_TIMESTAMP)`, [key, JSON.stringify(value)], function (err) {
                if (err)
                    reject(err);
                else
                    resolve();
            });
        });
    }
    async getSetting(key) {
        return new Promise((resolve, reject) => {
            this.db.get(`SELECT value FROM settings WHERE key = ?`, [key], (err, row) => {
                if (err)
                    reject(err);
                else
                    resolve(row ? JSON.parse(row.value) : null);
            });
        });
    }
    async getAllSettings() {
        return new Promise((resolve, reject) => {
            this.db.all(`SELECT key, value FROM settings`, (err, rows) => {
                if (err)
                    reject(err);
                else {
                    const settings = {};
                    (rows || []).forEach(row => {
                        settings[row.key] = JSON.parse(row.value);
                    });
                    resolve(settings);
                }
            });
        });
    }
    async logAnalyticsEvent(eventType, eventData) {
        return new Promise((resolve, reject) => {
            this.db.run(`INSERT INTO analytics (event_type, event_data) VALUES (?, ?)`, [eventType, JSON.stringify(eventData)], function (err) {
                if (err)
                    reject(err);
                else
                    resolve();
            });
        });
    }
    close() {
        return new Promise((resolve, reject) => {
            this.db.close((err) => {
                if (err)
                    reject(err);
                else
                    resolve();
            });
        });
    }
}
exports.DatabaseManager = DatabaseManager;
//# sourceMappingURL=database.js.map