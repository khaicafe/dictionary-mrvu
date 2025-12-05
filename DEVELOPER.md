# 📖 Hướng Dẫn Phát Triển - Dictionary MRVU

## 🎯 Mục Tiêu Dự Án

Tạo một ứng dụng tra cứu từ điển chuyên nghiệp với:

- ✅ Cơ sở dữ liệu SQLite (nhanh, local)
- ✅ Import/cập nhật từ file Excel
- ✅ Giao diện đẹp responsive
- ✅ API RESTful đầy đủ
- ✅ TypeScript type-safe

---

## 🏗️ Kiến Trúc

### Frontend (React)

- `app/page.tsx` - Trang chủ tra từ
- `app/admin/import/page.tsx` - Trang upload Excel
- `app/components/SearchForm.tsx` - Component tìm kiếm

### Backend (Next.js API Routes)

- `app/api/dictionary/search/route.ts` - Tìm kiếm từ
- `app/api/dictionary/import/route.ts` - Import Excel
- `app/api/dictionary/stats/route.ts` - Thống kê

### Database (SQLite)

- `lib/db/init.ts` - Khởi tạo & schema
- `lib/db/operations.ts` - CRUD operations

---

## 🛠️ Stack Công Nghệ

| Lớp           | Công Nghệ           | Lý Do                 |
| ------------- | ------------------- | --------------------- |
| **UI**        | React 19 + Tailwind | Hiện đại, responsive  |
| **Framework** | Next.js 16          | Full-stack, SSR-ready |
| **DB**        | SQLite 3            | Nhẹ, nhanh, no setup  |
| **Language**  | TypeScript          | Type-safe             |
| **Excel**     | XLSX                | Hỗ trợ nhiều format   |

---

## 📋 Quy Trình Import

```
User upload file (.xlsx)
        ↓
Validate file (size, format)
        ↓
Parse Excel with XLSX
        ↓
Map columns to Word interface
        ↓
Filter empty words
        ↓
BEGIN TRANSACTION
        ↓
Xóa dữ liệu cũ (nếu replace mode)
        ↓
Insert/Update từng từ
        ↓
COMMIT
        ↓
Response: { added, updated, total }
```

---

## 🔍 Quy Trình Search

```
User type "hel"
        ↓
Real-time fetch /api/dictionary/search?q=hel
        ↓
SQLite query: SELECT * WHERE word LIKE 'hel%'
        ↓
Use index idx_word_lower for speed
        ↓
Return top 20 results
        ↓
Display in real-time
```

---

## 💾 Data Flow

### Import File

```
Excel File → XLSX.parse() → Word[] → DB.import() → SQLite
```

### Search Word

```
User Input → /api/search → SQLite.query() → Results → UI
```

### Get Stats

```
/api/stats → SQLite.count() → { total, firstWord, lastWord }
```

---

## 🚀 Setup Bước-Bước

### 1. Clone Repository

```bash
git clone <repo>
cd dictionary-mrvu
```

### 2. Cài Dependencies

```bash
npm install
```

### 3. Cấu Hình .env (tùy chọn)

```bash
cp .env.example .env.local
```

### 4. Khởi Tạo Database

Database sẽ tự tạo khi server start

### 5. Khởi Động

```bash
npm run dev
```

### 6. Upload Từ Điển

- Truy cập: http://localhost:3000/admin/import
- Upload file Excel
- Chọn chế độ import

---

## 📝 File Quan Trọng

### `lib/db/operations.ts`

```typescript
// Main CRUD operations
-searchWords(query, limit) -
  addWord(word) -
  updateWord(id, word) -
  deleteWord(id) -
  importWords(words, replace) -
  getStats();
```

### `app/api/dictionary/import/route.ts`

```typescript
// POST /api/dictionary/import
// Xử lý upload, parse Excel, validate, import
```

### `app/components/SearchForm.tsx`

```typescript
// Real-time search component
// Hiển thị kết quả + statistics
```

---

## 🧪 Testing

### Manual Test Search

```bash
curl "http://localhost:3000/api/dictionary/search?q=hello"
```

### Manual Test Import

```bash
curl -X POST \
  -F "file=@tudien.xlsx" \
  -F "replace=false" \
  http://localhost:3000/api/dictionary/import
```

### Manual Test Stats

```bash
curl http://localhost:3000/api/dictionary/stats
```

---

## 🐛 Debug Tips

### 1. Check Server Logs

```bash
# Terminal chạy npm run dev
# Xem các errors/warnings
```

### 2. Check Browser Console

```javascript
// F12 → Console
// Xem network requests, errors
```

### 3. Check Database

```bash
# Nếu cài sqlite3 CLI
sqlite3 data/dictionary.db

# SELECT COUNT(*) FROM words;
# SELECT * FROM words LIMIT 5;
```

### 4. Check File Format

```python
# Verify Excel columns
import openpyxl
wb = openpyxl.load_workbook('tudien.xlsx')
ws = wb.active
print([cell.value for cell in ws[1]])  # Print header
```

---

## 🚦 Validation

### Excel File Validation

- ✅ File size < 10MB
- ✅ Format: .xlsx, .xls, .csv
- ✅ Có cột "word"
- ✅ Không empty

### Word Data Validation

- ✅ word: không trống, unique
- ✅ definition: text
- ✅ pronunciation: text
- ✅ example: text
- ✅ part_of_speech: text (noun, verb, adj...)

### API Validation

- ✅ Query string length < 1000
- ✅ Limit parameter 1-100
- ✅ FormData size < 10MB

---

## ⚙️ Configuration

### `lib/config.ts`

```typescript
// Thay đổi đường dẫn database
export const DB_PATH = path.join(process.cwd(), 'data', 'dictionary.db');

// Thay đổi max file size
export const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
```

### Environment Variables

```bash
# .env.local
NEXT_PUBLIC_API_URL=http://localhost:3000
```

---

## 📚 Best Practices

### 1. Error Handling

```typescript
try {
  // Code
} catch (error) {
  console.error('Lỗi:', error);
  return NextResponse.json({error: 'message'}, {status: 500});
}
```

### 2. Transactions

```typescript
const transaction = db.transaction(() => {
  // Multiple operations
  // Rollback on error
});
transaction();
```

### 3. Indexes

```typescript
// Tạo index cho cột thường search
CREATE INDEX idx_word_lower ON words(lower(word));
```

### 4. Type Safety

```typescript
interface Word {
  id?: number;
  word: string;
  definition?: string;
  // ...
}
```

---

## 🔒 Security

### Implemented

- ✅ TypeScript type safety
- ✅ File type validation
- ✅ File size validation
- ✅ SQL injection prevention (parameterized queries)

### TODO

- [ ] Rate limiting
- [ ] Authentication for /admin
- [ ] Input sanitization
- [ ] CORS policy
- [ ] Rate limiting per IP
- [ ] Audit logging

---

## 📈 Performance Tips

### 1. Database Indexes

```sql
CREATE INDEX idx_word ON words(word);
CREATE INDEX idx_word_lower ON words(lower(word));
```

### 2. Limit Results

```typescript
const limit = Math.min(parseInt(limit_param), 100); // Max 100
```

### 3. Caching

```typescript
// Future: Add caching layer
// Cache popular searches for 5 minutes
```

### 4. Pagination

```typescript
// Future: Implement pagination for large result sets
// GET /api/search?q=hello&page=1&limit=20
```

---

## 📦 Deployment

### Vercel (Recommended)

```bash
npm install -g vercel
vercel login
vercel deploy
```

### Docker

```dockerfile
FROM node:20-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build
EXPOSE 3000
CMD ["npm", "start"]
```

### Self-Hosted

```bash
npm run build
npm start
# Server on port 3000
```

---

## 🤝 Contributing

1. Fork repository
2. Create branch: `git checkout -b feature/name`
3. Make changes
4. Commit: `git commit -m "feat: description"`
5. Push: `git push origin feature/name`
6. Pull request

---

## 📚 Resources

- [Next.js Docs](https://nextjs.org/docs)
- [React Docs](https://react.dev)
- [SQLite Docs](https://www.sqlite.org/docs.html)
- [XLSX Library](https://github.com/SheetJS/sheetjs)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)

---

## 🎯 Roadmap

### v1.0 (Current)

- ✅ Search functionality
- ✅ Excel import
- ✅ Basic UI

### v1.1 (Next)

- [ ] Caching layer
- [ ] Pagination
- [ ] Advanced filters
- [ ] Export to Excel

### v2.0 (Future)

- [ ] Multi-language support
- [ ] User authentication
- [ ] Word collections
- [ ] Mobile app
- [ ] Cloud sync

---

## 💡 Ideas

- Audio pronunciation
- Related words algorithm
- Word frequency stats
- Learning flashcards
- History tracking
- User favorites
- Community translations

---

## 📞 Support

Liên hệ cho hỗ trợ:

- GitHub Issues
- Email: support@example.com
- Documentation: ./README.md

---

Happy Coding! 🚀
