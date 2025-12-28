import Database from 'better-sqlite3';
import {DB_PATH} from '../config';
import fs from 'fs';
import path from 'path';

export function initDatabase(): Database.Database {
  // Tạo thư mục data nếu chưa tồn tại
  const dataDir = path.dirname(DB_PATH);
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, {recursive: true});
  }

  const db = new Database(DB_PATH);

  // Enable foreign keys
  db.pragma('journal_mode = WAL');
  db.pragma('foreign_keys = ON');

  // Tạo table words nếu chưa tồn tại
  db.exec(`
    CREATE TABLE IF NOT EXISTS words (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      original TEXT NOT NULL UNIQUE,
      ndict TEXT,
      tdict TEXT,
      phat_hc TEXT,
      full_data TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE INDEX IF NOT EXISTS idx_original ON words(original);
    CREATE INDEX IF NOT EXISTS idx_original_lower ON words(lower(original));

    -- Bảng nhiếp
    CREATE TABLE IF NOT EXISTS nhiep (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      phap TEXT NOT NULL UNIQUE,
      tang TEXT,
      tanh_tuong TEXT,
      phan_loai TEXT,
      full_data TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE INDEX IF NOT EXISTS idx_nhiep_phap_lower ON nhiep(lower(phap));
    CREATE INDEX IF NOT EXISTS idx_nhiep_tang_lower ON nhiep(lower(tang));
  `);

  return db;
}

export function getDatabase(): Database.Database {
  return initDatabase();
}
