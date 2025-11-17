const sqlite3 = require('sqlite3').verbose();
const path = require('path');

(async () => {
  try {
    const dbPath = path.join(process.cwd(), 'autosort.db');
    console.log('Using DB:', dbPath);
    const db = new sqlite3.Database(dbPath);

    const sample = [
      { file_path: 'sample/docs/doc1.pdf', original_category: 'other', predicted_category: 'documents', confidence: 0.92, model_used: 'mock' },
      { file_path: 'sample/docs/doc2.docx', original_category: 'other', predicted_category: 'documents', confidence: 0.88, model_used: 'mock' },
      { file_path: 'sample/img/img1.jpg', original_category: 'other', predicted_category: 'images', confidence: 0.95, model_used: 'mock' },
      { file_path: 'sample/audio/song1.mp3', original_category: 'other', predicted_category: 'audio', confidence: 0.8, model_used: 'mock' },
      { file_path: 'sample/video/clip1.mp4', original_category: 'other', predicted_category: 'video', confidence: 0.86, model_used: 'mock' }
    ];

    await new Promise((resolve, reject) => {
      db.serialize(() => {
        db.run(`CREATE TABLE IF NOT EXISTS file_classifications (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          file_path TEXT UNIQUE NOT NULL,
          original_category TEXT,
          predicted_category TEXT,
          confidence REAL,
          model_used TEXT,
          features TEXT,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )`);

        const stmt = db.prepare(`INSERT OR REPLACE INTO file_classifications (file_path, original_category, predicted_category, confidence, model_used, features) VALUES (?, ?, ?, ?, ?, ?)`);
        for (const r of sample) {
          stmt.run(r.file_path, r.original_category, r.predicted_category, r.confidence, r.model_used, JSON.stringify({ seeded: true }));
        }
        stmt.finalize(err => {
          if (err) reject(err);
          else resolve();
        });
      });
    });

    // Compute average
    await new Promise((resolve, reject) => {
      db.get(`SELECT AVG(confidence) as avgConf, COUNT(*) as cnt FROM file_classifications`, (err, row) => {
        if (err) reject(err);
        else {
          console.log('Inserted sample classifications. Count:', row.cnt, 'Average confidence:', row.avgConf);
          resolve();
        }
      });
    });

    db.close();
    console.log('Done');
  } catch (err) {
    console.error('Seeding failed:', err);
    process.exit(1);
  }
})();
