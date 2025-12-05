# 📚 Hướng Dẫn Sử Dụng Từ Điển MRVU

## 🚀 Bắt Đầu Nhanh (3 Bước)

### 1. Cài Đặt Dependencies

```bash
npm install
```

### 2. Khởi Động Server

```bash
npm run dev
```

Server sẽ chạy tại: **http://localhost:3000**

### 3. Upload File Từ Điển

- Mở: http://localhost:3000/admin/import
- Chọn file Excel (từ file `tudien.xlsx` của bạn)
- Chọn chế độ: **Cập nhật** (thêm/sửa) hoặc **Thay thế** (xóa toàn bộ)
- Nhấn **Import Ngay**

---

## 📋 Định Dạng File Excel

File Excel của bạn cần có các cột (ít nhất cột `word`):

| word  | definition | pronunciation | example             | part_of_speech | synonyms | antonyms |
| ----- | ---------- | ------------- | ------------------- | -------------- | -------- | -------- |
| hello | xin chào   | /həˈloʊ/      | Hello, how are you? | noun           | hi, hey  | goodbye  |

**Cần thiết:** `word` (từ khóa)
**Tùy chọn:** tất cả các cột khác

---

## 🔍 Tra Cứu Từ Điển

1. Mở: http://localhost:3000
2. Nhập từ cần tìm trong ô search
3. Kết quả hiển thị ngay lập tức

### Thông Tin Hiển Thị:

- ✅ Từ tiếng Anh
- ✅ Phát âm (nếu có)
- ✅ Loại từ (noun, verb, adj...)
- ✅ Định nghĩa
- ✅ Ví dụ sử dụng
- ✅ Từ đồng nghĩa
- ✅ Từ trái nghĩa

---

## 🎯 API Endpoints

### 1. Tra Cứu Từ

```
GET /api/dictionary/search?q=hello&limit=20
```

Response:

```json
{
  "success": true,
  "query": "hello",
  "count": 5,
  "results": [
    {
      "id": 1,
      "word": "hello",
      "definition": "xin chào",
      ...
    }
  ]
}
```

### 2. Import File Excel

```
POST /api/dictionary/import
```

FormData:

- `file`: File Excel
- `replace`: "true" (xóa tất cả) hoặc "false" (cập nhật)

Response:

```json
{
  "success": true,
  "message": "Import successful. Added: 100, Updated: 50",
  "stats": {
    "added": 100,
    "updated": 50,
    "total": 150
  }
}
```

### 3. Thống Kê

```
GET /api/dictionary/stats
```

Response:

```json
{
  "success": true,
  "data": {
    "totalWords": 1000,
    "firstWord": "apple",
    "lastWord": "zebra",
    "lastUpdated": "2025-12-04T12:00:00Z"
  }
}
```

---

## 📁 Cấu Trúc Dự Án

```
dictionary-mrvu/
├── app/
│   ├── page.tsx              ← Trang chủ tra từ
│   ├── layout.tsx
│   ├── components/
│   │   └── SearchForm.tsx    ← Component tìm kiếm
│   ├── api/dictionary/
│   │   ├── search/route.ts   ← API tìm kiếm
│   │   ├── import/route.ts   ← API import Excel
│   │   └── stats/route.ts    ← API thống kê
│   └── admin/
│       └── import/page.tsx   ← Trang upload Excel
├── lib/
│   ├── config.ts             ← Cấu hình
│   └── db/
│       ├── init.ts           ← Khởi tạo database
│       └── operations.ts     ← CRUD operations
├── data/
│   └── dictionary.db         ← SQLite database (auto-created)
├── package.json
└── tsconfig.json
```

---

## 🔧 Công Nghệ Sử Dụng

- **Frontend:** React 19 + Tailwind CSS
- **Backend:** Next.js 16 App Router
- **Database:** SQLite 3 (better-sqlite3)
- **Excel:** XLSX library
- **Language:** TypeScript
- **API:** RESTful

---

## 💾 Database Schema

```sql
CREATE TABLE words (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  word TEXT NOT NULL UNIQUE,
  definition TEXT,
  pronunciation TEXT,
  example TEXT,
  part_of_speech TEXT,
  synonyms TEXT,
  antonyms TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_word ON words(word);
CREATE INDEX idx_word_lower ON words(lower(word));
```

---

## ⚙️ Tùy Chỉnh

### Thay Đổi Chế Độ Import Mặc Định

File: `lib/config.ts`

```typescript
export const DEFAULT_IMPORT_MODE = 'replace'; // hoặc 'update'
```

### Thay Đổi Giới Hạn Kết Quả Search

File: `app/components/SearchForm.tsx`

```typescript
const results = await fetch(
  `/api/dictionary/search?q=${query}&limit=50`, // Thay 50 bằng số khác
);
```

---

## 🐛 Troubleshooting

### Lỗi: "better-sqlite3" không cài được

```bash
npm rebuild better-sqlite3
```

### Database bị lock

Xóa file: `data/dictionary.db-shm` và `data/dictionary.db-wal`

### Import bị lỗi

- Kiểm tra file Excel có cột `word` không
- Kiểm tra file size < 10MB
- Kiểm tra định dạng: .xlsx, .xls, hoặc .csv

---

## 📞 Support

Nếu gặp vấn đề:

1. Kiểm tra console browser (F12)
2. Kiểm tra server log (terminal)
3. Kiểm tra file tudien.xlsx format

---

## 🎉 Hoàn Tất!

Bây giờ bạn có một ứng dụng tra từ điển chuyên nghiệp với:

- ✅ Tìm kiếm nhanh (SQLite)
- ✅ Import/cập nhật file Excel
- ✅ Giao diện đẹp (React + Tailwind)
- ✅ API RESTful đầy đủ
- ✅ TypeScript type-safe

**Happy Searching! 📖**
