import path from 'path';

export const DB_PATH = path.join(process.cwd(), 'data', 'dictionary.db');
export const EXCEL_UPLOAD_DIR = path.join(process.cwd(), 'data', 'uploads');
export const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
