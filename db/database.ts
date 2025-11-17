import sqlite3 from 'sqlite3';
import { promisify } from 'util';
import { randomBytes } from 'crypto';
import * as path from 'path';
import * as fs from 'fs/promises';

export class DatabaseManager {
  private db: sqlite3.Database;

  constructor(dbPath?: string) {
    const finalPath = dbPath || path.join(process.cwd(), 'autosort.db');
    this.db = new sqlite3.Database(finalPath);
    this.initTables();
  }

  private initTables(): void {
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

  async logJob(jobData: any): Promise<string> {
    return new Promise((resolve, reject) => {
      // Generate a robust unique id to avoid UNIQUE constraint collisions
      const uuidFromData = jobData.id;
      const uuid = uuidFromData || (typeof (global as any).crypto?.randomUUID === 'function'
        ? (global as any).crypto.randomUUID()
        : `job_${Date.now()}_${randomBytes(6).toString('hex')}`);
      this.db.run(
        `INSERT INTO jobs (uuid, type, status, files_processed, total_files, metadata)
         VALUES (?, ?, ?, ?, ?, ?)`,
        [
          uuid,
          jobData.type,
          jobData.status,
          jobData.filesProcessed || 0,
          jobData.totalFiles || 0,
          JSON.stringify(jobData.metadata || {})
        ],
        function (err) {
          if (err) reject(err);
          else resolve(uuid);
        }
      );
    });
  }

  async updateJobStatus(jobId: string, status: string, progress: number = 0): Promise<void> {
    return new Promise((resolve, reject) => {
      this.db.run(
        `UPDATE jobs SET status = ?, files_processed = ? WHERE uuid = ?`,
        [status, progress, jobId],
        function (err) {
          if (err) reject(err);
          else resolve();
        }
      );
    });
  }

  async getJobHistory(limit: number = 100): Promise<any[]> {
    return new Promise((resolve, reject) => {
      this.db.all(
        `SELECT * FROM jobs ORDER BY start_time DESC LIMIT ?`,
        [limit],
        (err, rows) => {
          if (err) reject(err);
          else resolve(rows || []);
        }
      );
    });
  }

  async logClassification(data: any): Promise<void> {
    return new Promise((resolve, reject) => {
      this.db.run(
        `INSERT OR REPLACE INTO file_classifications
         (file_path, original_category, predicted_category, confidence, model_used, features)
         VALUES (?, ?, ?, ?, ?, ?)`,
        [
          data.filePath,
          data.originalCategory || null,
          data.predictedCategory,
          data.confidence,
          data.modelUsed,
          JSON.stringify(data.features)
        ],
        function (err) {
          if (err) reject(err);
          else resolve();
        }
      );
    });
  }

  async getClassifications(limit: number = 100): Promise<any[]> {
    return new Promise((resolve, reject) => {
      this.db.all(
        `SELECT * FROM file_classifications ORDER BY created_at DESC LIMIT ?`,
        [limit],
        (err, rows) => {
          if (err) reject(err);
          else resolve(rows || []);
        }
      );
    });
  }

  async saveSetting(key: string, value: any): Promise<void> {
    return new Promise((resolve, reject) => {
      this.db.run(
        `INSERT OR REPLACE INTO settings (key, value, updated_at)
         VALUES (?, ?, CURRENT_TIMESTAMP)`,
        [key, JSON.stringify(value)],
        function (err) {
          if (err) reject(err);
          else resolve();
        }
      );
    });
  }

  async getSetting(key: string): Promise<any> {
    return new Promise((resolve, reject) => {
      this.db.get(
        `SELECT value FROM settings WHERE key = ?`,
        [key],
        (err, row: any) => {
          if (err) reject(err);
          else resolve(row ? JSON.parse(row.value) : null);
        }
      );
    });
  }

  async getAllSettings(): Promise<Record<string, any>> {
    return new Promise((resolve, reject) => {
      this.db.all(
        `SELECT key, value FROM settings`,
        (err, rows: any[]) => {
          if (err) reject(err);
          else {
            const settings: Record<string, any> = {};
            (rows || []).forEach(row => {
              settings[row.key] = JSON.parse(row.value);
            });
            resolve(settings);
          }
        }
      );
    });
  }

  async logAnalyticsEvent(eventType: string, eventData: any): Promise<void> {
    return new Promise((resolve, reject) => {
      this.db.run(
        `INSERT INTO analytics (event_type, event_data) VALUES (?, ?)`,
        [eventType, JSON.stringify(eventData)],
        function (err) {
          if (err) reject(err);
          else resolve();
        }
      );
    });
  }

  close(): Promise<void> {
    return new Promise((resolve, reject) => {
      this.db.close((err) => {
        if (err) reject(err);
        else resolve();
      });
    });
  }
}
