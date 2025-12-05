# Cập nhật API - Hướng dẫn chi tiết

## 📋 Tóm tắt các thay đổi

Tất cả các API routes và components đã được cập nhật để khớp với cấu trúc file Excel `tudien.xlsx` của bạn:

| Cột Excel | Tên Database | Giá trị          |
| --------- | ------------ | ---------------- |
| B         | original     | Từ tiếng Anh     |
| C         | ndict        | Nghĩa tiếng Việt |
| E         | phat_hc      | Phát âm          |

---

## 🔧 Các File Đã Cập Nhật

### 1️⃣ **app/api/dictionary/import/route.ts**

- ✅ Cập nhật logic mapping từ Excel columns B, C, E
- ✅ Ánh xạ dữ liệu Excel vào interface Word
- ✅ Lưu trữ toàn bộ hàng dữ liệu trong `full_data` dưới dạng JSON

**Cách sử dụng:**

```bash
# Upload file Excel
curl -X POST http://localhost:3000/api/dictionary/import \
  -F "file=@tudien.xlsx" \
  -F "replace=true"
```

**Response:**

```json
{
  "success": true,
  "message": "Import successful. Added: 500, Updated: 0",
  "stats": {
    "added": 500,
    "updated": 0,
    "total": 500
  }
}
```

---

### 2️⃣ **app/api/dictionary/search/route.ts**

- ✅ Tìm kiếm từ trong cột `original` (không phân biệt hoa/thường)
- ✅ Trả về kết quả với tất cả các trường: original, ndict, phat_hc, full_data

**Cách sử dụng:**

```bash
# Tìm kiếm từ
curl "http://localhost:3000/api/dictionary/search?q=hello&limit=10"
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
      "original": "hello",
      "ndict": "xin chào",
      "phat_hc": "hə'ləʊ",
      "full_data": "{...}",
      "created_at": "2024-01-01T00:00:00.000Z",
      "updated_at": "2024-01-01T00:00:00.000Z"
    }
  ]
}
```

---

### 3️⃣ **app/components/SearchForm.tsx**

- ✅ Cập nhật hiển thị kết quả tìm kiếm
- ✅ Hiển thị: `original` (từ), `/phat_hc/` (phát âm), `ndict` (nghĩa)

**Giao diện hiển thị:**

```
hello
/hə'ləʊ/
Nghĩa: xin chào
```

---

## ✅ Trạng thái Build

```
✓ Compiled successfully in 5.9s
✓ Finished TypeScript in 3.5s
✓ All routes configured
✓ No compilation errors
```

---

## 🧪 Kiểm tra Chức năng

### Bước 1: Khởi động Server

```bash
npm run dev
```

### Bước 2: Import File Excel

```bash
curl -X POST http://localhost:3000/api/dictionary/import \
  -F "file=@tudien.xlsx" \
  -F "replace=true"
```

### Bước 3: Tìm kiếm Từ

```bash
# Truy cập: http://localhost:3000
# Hoặc API: curl "http://localhost:3000/api/dictionary/search?q=hello"
```

### Bước 4: Kiểm tra Thống kê

```bash
curl http://localhost:3000/api/dictionary/stats
```

---

## 📊 Cấu trúc Database

```sql
CREATE TABLE words (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  original TEXT NOT NULL UNIQUE,      -- Từ tiếng Anh (Column B)
  ndict TEXT,                          -- Nghĩa (Column C)
  phat_hc TEXT,                        -- Phát âm (Column E)
  full_data TEXT,                      -- Toàn bộ dữ liệu hàng (JSON)
  created_at DATETIME,
  updated_at DATETIME
);

-- Indexes for fast search
CREATE INDEX idx_original ON words(original);
CREATE INDEX idx_original_lower ON words(lower(original));
```

---

## 🚀 Tính năng

### ✅ Import Excel

- Đọc file Excel/CSV
- Ánh xạ cột B→original, C→ndict, E→phat_hc
- Thêm mới hoặc cập nhật (tuỳ chọn replace mode)
- Lưu toàn bộ hàng dữ liệu để tương lai mở rộng

### ✅ Tìm kiếm

- Tìm kiếm không phân biệt hoa/thường
- Tìm kiếm theo tiền tố (LIKE '%query%')
- Giới hạn số kết quả (mặc định: 20, tối đa: 100)

### ✅ Thống kê

- Tổng số từ
- Từ đầu tiên và cuối cùng (theo bảng chữ cái)
- Lần cập nhật cuối cùng

---

## 🔄 Mode Replace

**Khi `replace=true`:**

- Nếu từ đã tồn tại → Cập nhật
- Nếu từ mới → Thêm mới

**Khi `replace=false`:**

- Nếu từ đã tồn tại → Bỏ qua
- Nếu từ mới → Thêm mới

---

## 📝 Ghi chú Quan trọng

1. **Column Headers**: File Excel cần có headers: `original`, `ndict`, `phat_hc`

   - Nếu headers khác, cập nhật logic trong `app/api/dictionary/import/route.ts`

2. **Full Data**: Toàn bộ hàng Excel được lưu trong `full_data` dưới dạng JSON

   - Cho phép mở rộng trong tương lai mà không mất dữ liệu

3. **Case Insensitive**: Tìm kiếm không phân biệt hoa/thường

   - "Hello", "hello", "HELLO" → kết quả giống nhau

4. **Unique Constraint**: Cột `original` là UNIQUE
   - Hai từ khác nhau (khác casing) sẽ conflict → xử lý cẩn thận

---

## 🐛 Troubleshooting

### Error: "Query parameter is required"

- Đảm bảo truyền parameter `q` trong URL search: `?q=hello`

### Error: "No file provided"

- Kiểm tra form data có chứa `file` field

### Error: "Only .xlsx, .xls, or .csv files are allowed"

- Chỉ hỗ trợ: Excel (.xlsx, .xls), CSV (.csv)

### Import không hoạt động

- Kiểm tra headers trong Excel: `original`, `ndict`, `phat_hc`
- Xác nhận file không bị hỏng

---

## 🔗 API Endpoints

| Method | Endpoint                                     | Mô tả             |
| ------ | -------------------------------------------- | ----------------- |
| POST   | `/api/dictionary/import`                     | Import Excel file |
| GET    | `/api/dictionary/search?q=<query>&limit=<n>` | Tìm kiếm từ       |
| GET    | `/api/dictionary/stats`                      | Lấy thống kê      |

---

## 📚 Hướng Dẫn Tiếp Theo

1. **Tạo giao diện Upload file**

   - Thêm tab "Upload/Update" trên trang admin
   - Hiển thị tiến trình import

2. **Tạo giao diện Tìm kiếm nâng cao**

   - Bộ lọc theo loại từ
   - Tìm kiếm theo cột cụ thể

3. **Xuất dữ liệu**
   - Cho phép download database dưới dạng Excel

---

## ✨ Hoàn tất!

Hệ thống giờ đã sẵn sàng để:

- ✅ Import file Excel với cấu trúc đúng
- ✅ Tìm kiếm từ hiệu quả
- ✅ Hiển thị kết quả với định dạng đẹp

Hãy test import file `tudien.xlsx` của bạn ngay!
