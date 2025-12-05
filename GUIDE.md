# 🎯 GUIDE.md - Hướng Dẫn Đầy Đủ

Hướng dẫn chi tiết sử dụng ứng dụng **Dictionary MRVU**

---

## 📋 Table of Contents

1. [Installation](#installation)
2. [Usage](#usage)
3. [File Format](#file-format)
4. [API Reference](#api-reference)
5. [Troubleshooting](#troubleshooting)
6. [Advanced](#advanced)

---

## Installation

### 1. Cài Đặt Node.js

- Truy cập: https://nodejs.org
- Download: LTS version (>= 18.0.0)
- Cài đặt và verify:
  ```bash
  node --version  # v18.x.x hoặc cao hơn
  npm --version   # 9.x.x hoặc cao hơn
  ```

### 2. Clone / Navigate to Project

```bash
cd /Users/khaicafe/Develop/dictionary-mrvu
```

### 3. Cài Dependencies

```bash
npm install
```

Hoặc sử dụng setup script:

```bash
bash setup.sh
```

### 4. Khởi Động

```bash
npm run dev
```

Server sẽ chạy tại: **http://localhost:3000**

---

## Usage

### 🏠 Trang Chủ (Home Page)

**URL:** http://localhost:3000

1. **Nhập từ cần tìm** trong ô search
2. **Kết quả hiển thị ngay lập tức**
3. **Xem chi tiết từ:**
   - Từ tiếng Anh
   - Phát âm (IPA)
   - Loại từ (noun, verb, adj...)
   - Định nghĩa Tiếng Việt
   - Ví dụ sử dụng
   - Từ đồng nghĩa
   - Từ trái nghĩa
4. **Thống kê hiển thị:**
   - Tổng số từ trong database
   - Từ đầu tiên
   - Từ cuối cùng

### 📤 Admin Import Page

**URL:** http://localhost:3000/admin/import

#### Step 1: Chọn File

- Click vào vùng upload
- Chọn file Excel (.xlsx, .xls, hoặc .csv)
- File được chọn sẽ hiển thị ngay

#### Step 2: Chọn Chế Độ Import

**A. Chế độ CẬP NHẬT (Update)**

- Thêm những từ mới không tồn tại
- Cập nhật những từ đã tồn tại
- Giữ lại những từ không có trong file
- **Khuyến nghị:** Sử dụng lần đầu

**B. Chế độ THAY THẾ (Replace)**

- ⚠️ Xóa tất cả dữ liệu cũ
- Import dữ liệu từ file
- Không có từ cũ nào còn lại
- **Cảnh báo:** Sử dụng khi chắc chắn

#### Step 3: Import

- Nhấn nút **"📤 Import Ngay"**
- Chờ kết quả (có spinner loading)
- Xem kết quả:
  - ✅ Thành công: Hiển thị số từ thêm/cập nhật
  - ❌ Lỗi: Hiển thị thông báo lỗi chi tiết

---

## File Format

### Định Dạng Excel (.xlsx)

**Header (Row 1) phải chứa các cột:**

```
word | definition | pronunciation | example | part_of_speech | synonyms | antonyms
```

**Yêu cầu:**

- ✅ Cột **word** là BẮT BUỘC
- ⚠️ Các cột khác là TÙYCHỌN
- ⚠️ Không được để trống cột word
- ⚠️ File size < 10MB

**Ví dụ dữ liệu:**

| word      | definition | pronunciation | example             | part_of_speech | synonyms | antonyms |
| --------- | ---------- | ------------- | ------------------- | -------------- | -------- | -------- |
| hello     | xin chào   | həˈloʊ        | Hello, how are you? | noun           | hi, hey  | goodbye  |
| apple     | quả táo    | ˈæpəl         | An apple a day...   | noun           | -        | -        |
| beautiful | xinh đẹp   | ˈbjuːtɪfl     | She is beautiful    | adj            | pretty   | ugly     |
| run       | chạy       | rʌn           | I run daily         | verb           | sprint   | walk     |

### Định Dạng CSV (.csv)

Tương tự Excel, nhưng dùng dấu phẩy (,) để phân tách:

```csv
word,definition,pronunciation,example,part_of_speech,synonyms,antonyms
hello,xin chào,həˈloʊ,Hello how are you?,noun,hi;hey,goodbye
apple,quả táo,ˈæpəl,An apple a day...,noun,,
```

### Tips Chuẩn Bị File

1. **Mở Excel → Tạo Sheet mới**
2. **Row 1: Viết header** (word, definition, ...)
3. **Row 2+: Nhập dữ liệu từ**
4. **Save as: .xlsx format**
5. **Kiểm tra:**
   - Cột word không trống
   - Không có khoảng trắng thừa
   - Không có ký tự lạ

---

## API Reference

### 1. Search Words

**Endpoint:** `GET /api/dictionary/search`

**Parameters:**

- `q` (required): Từ cần tìm (ít nhất 1 ký tự)
- `limit` (optional): Số kết quả (1-100, mặc định 20)

**Example:**

```bash
curl "http://localhost:3000/api/dictionary/search?q=hello&limit=20"
```

**Response:**

```json
{
  "success": true,
  "query": "hello",
  "count": 1,
  "results": [
    {
      "id": 1,
      "word": "hello",
      "definition": "xin chào",
      "pronunciation": "həˈloʊ",
      "example": "Hello, how are you?",
      "part_of_speech": "noun",
      "synonyms": "hi, hey",
      "antonyms": "goodbye",
      "created_at": "2025-12-04T12:00:00Z",
      "updated_at": "2025-12-04T12:00:00Z"
    }
  ]
}
```

---

### 2. Import File

**Endpoint:** `POST /api/dictionary/import`

**Request (FormData):**

```
file: <File>          # Excel file
replace: "true"|"false"  # Import mode
```

**Example (cURL):**

```bash
curl -X POST \
  -F "file=@tudien.xlsx" \
  -F "replace=false" \
  http://localhost:3000/api/dictionary/import
```

**Example (JavaScript):**

```javascript
const formData = new FormData();
formData.append('file', fileInput.files[0]);
formData.append('replace', 'false');

const response = await fetch('/api/dictionary/import', {
  method: 'POST',
  body: formData,
});

const data = await response.json();
console.log(data);
```

**Response (Success):**

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

**Response (Error):**

```json
{
  "success": false,
  "error": "Only .xlsx, .xls, or .csv files are allowed"
}
```

---

### 3. Get Statistics

**Endpoint:** `GET /api/dictionary/stats`

**Parameters:** None

**Example:**

```bash
curl http://localhost:3000/api/dictionary/stats
```

**Response:**

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

## Troubleshooting

### ❌ Port 3000 Đang Sử Dụng

**Lỗi:** `Address already in use`

**Giải pháp:**

```bash
# Chạy trên port khác
npm run dev -- -p 3001

# Hoặc tìm & kill process
lsof -i :3000
kill -9 <PID>
```

---

### ❌ better-sqlite3 Lỗi

**Lỗi:** `Cannot find module 'better-sqlite3'`

**Giải pháp:**

```bash
npm rebuild better-sqlite3
```

---

### ❌ Database Bị Lock

**Lỗi:** `database is locked`

**Giải pháp:**

```bash
# Xóa WAL files
rm data/dictionary.db-shm
rm data/dictionary.db-wal

# Hoặc xóa toàn bộ database
rm data/dictionary.db
```

---

### ❌ Import File Bị Lỗi

**Lỗi:** `No valid words found in Excel file`

**Kiểm tra:**

1. ✅ File có cột "word" không?
2. ✅ Cột word có từ không?
3. ✅ File size < 10MB không?
4. ✅ Format là .xlsx, .xls, hoặc .csv không?

---

### ❌ Search Không Có Kết Quả

**Nguyên nhân:** Database trống hoặc từ không tồn tại

**Giải pháp:**

1. Kiểm tra xem đã import file Excel chưa
2. Truy cập: http://localhost:3000/admin/import
3. Upload file tudien.xlsx
4. Thử search lại

---

### ❌ Node Version Mismatch

**Lỗi:** `Node.js version ">=20.9.0" is required`

**Giải pháp:**

- Upgrade Node.js từ https://nodejs.org
- Hoặc bỏ qua warning (vẫn chạy được)

---

## Advanced

### 🔧 Cấu Hình Tùy Chỉnh

**File:** `lib/config.ts`

```typescript
// Thay đổi đường dẫn database
export const DB_PATH = path.join(process.cwd(), 'data', 'dictionary.db');

// Thay đổi kích thước file max
export const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
```

---

### 🧪 Testing API với Postman

1. **Import Postman Collection:**

   - Tạo request mới
   - Method: GET
   - URL: `http://localhost:3000/api/dictionary/search?q=hello`
   - Send

2. **Import File:**
   - Method: POST
   - URL: `http://localhost:3000/api/dictionary/import`
   - Body → form-data
     - Key: file (type: File)
     - Value: Select tudien.xlsx
     - Key: replace (type: text)
     - Value: false
   - Send

---

### 📊 SQL Queries

**Lấy 10 từ ngẫu nhiên:**

```sql
SELECT * FROM words ORDER BY RANDOM() LIMIT 10;
```

**Tìm những từ chưa có phát âm:**

```sql
SELECT word FROM words WHERE pronunciation IS NULL LIMIT 10;
```

**Thống kê theo loại từ:**

```sql
SELECT part_of_speech, COUNT(*) FROM words GROUP BY part_of_speech;
```

**Xem tất cả SQL examples:**

- File: `SQL_EXAMPLES.sql`

---

### 🚀 Deploy

#### Vercel (Recommended)

```bash
vercel deploy
```

#### Docker

```bash
docker build -t dictionary .
docker run -p 3000:3000 dictionary
```

#### Self-Hosted

```bash
npm run build
npm start
```

---

## 📞 Support

- Xem README.md - Tổng quan
- Xem QUICK_START.md - Bắt đầu nhanh
- Xem DEVELOPER.md - Architecture
- Xem SQL_EXAMPLES.sql - SQL queries

---

## 🎉 Thành Công!

Chúc mừng! Bạn đã:
✅ Cài đặt ứng dụng
✅ Upload từ điển
✅ Tra cứu từ

**Tiếp theo:**

- Tùy chỉnh giao diện
- Thêm tính năng mới
- Deploy to production

Happy Coding! 🚀
