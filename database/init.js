import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { DatabaseSync } from 'node:sqlite';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.join(__dirname, '..');
const dataDir = path.join(rootDir, 'data');
const dbPath = path.join(dataDir, 'articles.db');

let db;

export function getDb() {
  if (!db) {
    throw new Error('Database not initialized; call initDb() first');
  }
  return db;
}

function rowidToNumber(rid) {
  if (typeof rid === 'bigint') return Number(rid);
  return rid;
}

/** Last insert rowid from `StatementSync.run()` (number or BigInt). */
export function lastInsertRowid(result) {
  return rowidToNumber(result.lastInsertRowid);
}

/** Creates `data/articles.db` and tables per adr.md (T-003). */
export function initDb() {
  fs.mkdirSync(dataDir, { recursive: true });
  db = new DatabaseSync(dbPath, { enableForeignKeyConstraints: true });
  db.exec(`
    PRAGMA journal_mode = WAL;
    PRAGMA synchronous = NORMAL;
  `);
  db.exec(`
    CREATE TABLE IF NOT EXISTS articles (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      content TEXT NOT NULL,
      source TEXT,
      author TEXT,
      published_date DATE,
      tags TEXT,
      summary TEXT,
      sentiment TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS concepts (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL UNIQUE,
      type TEXT DEFAULT 'concept'
    );

    CREATE TABLE IF NOT EXISTS article_concepts (
      article_id INTEGER REFERENCES articles(id) ON DELETE CASCADE,
      concept_id INTEGER REFERENCES concepts(id) ON DELETE CASCADE,
      PRIMARY KEY (article_id, concept_id)
    );
  `);
  return db;
}
