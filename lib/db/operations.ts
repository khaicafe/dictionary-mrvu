import Database from 'better-sqlite3';
import {getDatabase} from './init';

export interface Word {
  id?: number;
  original: string;
  ndict?: string;
  tdict?: string;
  phat_hc?: string;
  full_data?: string;
  created_at?: string;
  updated_at?: string;
}

export class DictionaryOperations {
  private db: Database.Database;

  constructor(db?: Database.Database) {
    this.db = db || getDatabase();
  }

  // Tìm kiếm từ từ cột original
  searchWords(query: string, limit: number = 20): Word[] {
    const searchTerm = `${query}%`;
    const stmt = this.db.prepare(`
      SELECT * FROM words 
      WHERE lower(original) LIKE lower(?)
      ORDER BY original ASC
      LIMIT ?
    `);
    return stmt.all(searchTerm, limit) as Word[];
  }

  // Lấy từ theo ID
  getWordById(id: number): Word | null {
    const stmt = this.db.prepare('SELECT * FROM words WHERE id = ?');
    return (stmt.get(id) as Word) || null;
  }

  // Lấy từ theo từ khóa chính xác
  getWordByOriginal(original: string): Word | null {
    const stmt = this.db.prepare(
      'SELECT * FROM words WHERE lower(original) = lower(?)',
    );
    return (stmt.get(original) as Word) || null;
  }

  // Thêm từ
  addWord(word: Word): number {
    const stmt = this.db.prepare(`
      INSERT INTO words (original, ndict, tdict, phat_hc, full_data)
      VALUES (?, ?, ?, ?, ?)
    `);
    const result = stmt.run(
      word.original,
      word.ndict || null,
      word.tdict || null,
      word.phat_hc || null,
      word.full_data || null,
    );
    return result.lastInsertRowid as number;
  }

  // Cập nhật từ
  updateWord(id: number, word: Partial<Word>): boolean {
    const updates: string[] = [];
    const values: any[] = [];

    if (word.original) {
      updates.push('original = ?');
      values.push(word.original);
    }
    if (word.ndict !== undefined) {
      updates.push('ndict = ?');
      values.push(word.ndict);
    }
    if (word.phat_hc !== undefined) {
      updates.push('phat_hc = ?');
      values.push(word.phat_hc);
    }
    if (word.full_data !== undefined) {
      updates.push('full_data = ?');
      values.push(word.full_data);
    }

    if (updates.length === 0) return false;

    updates.push('updated_at = CURRENT_TIMESTAMP');
    values.push(id);

    const stmt = this.db.prepare(`
      UPDATE words SET ${updates.join(', ')} WHERE id = ?
    `);
    const result = stmt.run(...values);
    return (result.changes as number) > 0;
  }

  // Xóa từ
  deleteWord(id: number): boolean {
    const stmt = this.db.prepare('DELETE FROM words WHERE id = ?');
    const result = stmt.run(id);
    return (result.changes as number) > 0;
  }

  // Xóa tất cả từ
  deleteAllWords(): number {
    const stmt = this.db.prepare('DELETE FROM words');
    const result = stmt.run();
    return result.changes as number;
  }

  // Lấy thống kê
  getStats() {
    const countStmt = this.db.prepare('SELECT COUNT(*) as count FROM words');
    const count = (countStmt.get() as {count: number}).count;

    const firstStmt = this.db.prepare(
      'SELECT original FROM words ORDER BY created_at ASC LIMIT 1',
    );
    const firstWord = (firstStmt.get() as any)?.original || null;

    const lastStmt = this.db.prepare(
      'SELECT original FROM words ORDER BY created_at DESC LIMIT 1',
    );
    const lastWord = (lastStmt.get() as any)?.original || null;

    return {
      totalWords: count,
      firstWord,
      lastWord,
      lastUpdated: new Date().toISOString(),
    };
  }

  // Import từ mảng
  importWords(
    words: Word[],
    replace: boolean = false,
  ): {added: number; updated: number} {
    const transaction = this.db.transaction(() => {
      let added = 0;
      let updated = 0;

      if (replace) {
        this.deleteAllWords();
      }

      // Remove duplicates from input array (keep first occurrence)
      const seen = new Set<string>();
      const uniqueWords = words.filter((word) => {
        const key = word.original.toLowerCase().trim();
        if (seen.has(key)) {
          console.warn(`⚠️ Skipped duplicate in file: "${word.original}"`);
          return false;
        }
        seen.add(key);
        return true;
      });

      console.log(
        `📊 Processing ${uniqueWords.length} unique words (removed ${
          words.length - uniqueWords.length
        } duplicates)`,
      );

      for (const word of uniqueWords) {
        try {
          const existing = this.getWordByOriginal(word.original);
          if (existing && !replace) {
            // Update if exists
            this.updateWord(existing.id!, word);
            updated++;
          } else {
            // Add new
            this.addWord(word);
            added++;
          }
        } catch (error) {
          // Skip duplicate entries
          console.error(`❌ Error importing word "${word.original}":`, error);
        }
      }

      return {added, updated};
    });

    return transaction();
  }

  // Kiểm tra từ tồn tại
  wordExists(original: string): boolean {
    const stmt = this.db.prepare(
      'SELECT 1 FROM words WHERE lower(original) = lower(?) LIMIT 1',
    );
    return stmt.get(original) !== undefined;
  }
}

// Export singleton instance
let instance: DictionaryOperations | null = null;

export function getDictionaryOperations(): DictionaryOperations {
  if (!instance) {
    instance = new DictionaryOperations();
  }
  return instance;
}
