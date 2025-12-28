# 📚 Từ Điển Tra Cứu MRVU

> **Professional Dictionary Application** - Ứng dụng tra cứu từ điển chuyên nghiệp sử dụng **SQLite + Next.js + React**

![Status](https://img.shields.io/badge/status-active-green)
![Next.js](https://img.shields.io/badge/Next.js-16-blue)
![React](https://img.shields.io/badge/React-19-blue)
![SQLite](https://img.shields.io/badge/SQLite-3-blue)
![TypeScript](https://img.shields.io/badge/TypeScript-5-blue)

---

## ✨ Tính Năng Chính

### 🔍 Tra Cứu Từ Nhanh

- Tìm kiếm real-time với SQLite
- Không phân biệt hoa/thường
- Hỗ trợ tìm kiếm bắt đầu bằng

### 📤 Import File Excel

- Hỗ trợ: `.xlsx`, `.xls`, `.csv`
- 2 chế độ: Cập nhật hoặc Thay thế
- Báo cáo chi tiết (thêm/cập nhật)

### 🎨 Giao Diện Đẹp

- React + Tailwind CSS
- Responsive (mobile/tablet/desktop)

### 📊 Thông Tin Chi Tiết

- Định nghĩa
- Phát âm
- Loại từ (noun, verb, adj...)
- Ví dụ sử dụng
- Từ đồng nghĩa
- Từ trái nghĩa

### ⚡ Hiệu Suất Cao

- Database SQLite (local)
- Không cần kết nối internet
- Tìm kiếm trong vài ms

### 🔒 An Toàn

- TypeScript type-safe
- API RESTful chuẩn
- Validate file input

---

## 🚀 Bắt Đầu Nhanh

### 1. Cài Đặt

\`\`\`bash
npm install
\`\`\`

### 2. Khởi Động

\`\`\`bash
npm run dev
\`\`\`

### 3. Truy Cập

- **Trang chủ tra từ:** http://localhost:3000
- **Admin import:** http://localhost:3000/admin/import

### 4. Upload Từ Điển

Upload file \`tudien.xlsx\` tại \`/admin/import\`

---

## 📋 Yêu Cầu Hệ Thống

- **Node.js:** >= 20.9.0 (hoặc >= 18.0.0)
- **npm:** >= 9.0.0
- **OS:** macOS, Linux, Windows

---

## 🏗️ Cấu Trúc Dự Án

\`\`\`
dictionary-mrvu/
├── app/
│ ├── page.tsx # Trang chủ
│ ├── layout.tsx # Layout chính
│ ├── components/
│ │ └── SearchForm.tsx # Component tìm kiếm
│ ├── api/dictionary/
│ │ ├── search/route.ts # GET /api/dictionary/search?q=...
│ │ ├── import/route.ts # POST /api/dictionary/import
│ │ └── stats/route.ts # GET /api/dictionary/stats
│ └── admin/import/
│ └── page.tsx # Trang upload Excel
├── lib/
│ ├── config.ts # Cấu hình
│ └── db/
│ ├── init.ts # Khởi tạo database
│ └── operations.ts # CRUD operations
├── data/
│ └── dictionary.db # SQLite (auto-created)
└── tudien.xlsx # File từ điển của bạn
\`\`\`

---

## 🎯 API Endpoints

### Tìm Kiếm Từ

\`\`\`bash
GET /api/dictionary/search?q=hello&limit=20
\`\`\`

### Import File Excel

\`\`\`bash
POST /api/dictionary/import
\`\`\`
FormData: file + replace mode

### Thống Kê

\`\`\`bash
GET /api/dictionary/stats
\`\`\`

---

## 💾 Database Schema

Sử dụng SQLite với bảng \`words\` có các trường:

- word (unique, indexed)
- definition
- pronunciation
- example
- part_of_speech
- synonyms
- antonyms
- created_at, updated_at

---

## 📝 Định Dạng File Excel

File Excel cần có ít nhất cột **word**. Các cột khác tùy chọn:

| word  | definition | pronunciation | example             | part_of_speech | synonyms | antonyms |
| ----- | ---------- | ------------- | ------------------- | -------------- | -------- | -------- |
| hello | xin chào   | həˈloʊ        | Hello, how are you? | noun           | hi, hey  | goodbye  |

---

## 🛠️ Công Nghệ

- **Frontend:** React 19 + Tailwind CSS
- **Backend:** Next.js 16
- **Database:** SQLite 3
- **Language:** TypeScript 5
- **Excel:** XLSX library

---

## 🚀 Scripts

\`\`\`bash
npm run dev # Development
npm run build # Build production
npm start # Start production
npm run lint # Lint code
\`\`\`

---

## 📚 Hướng Dẫn Chi Tiết

Xem [QUICK_START.md](./QUICK_START.md) để có hướng dẫn đầy đủ.

---

## 🎉 Bắt Đầu!

\`\`\`bash
npm install
npm run dev

# Truy cập: http://localhost:3000

\`\`\`

**Happy Searching! 📖**
pass: admin123

# Note bug:

không truy cập api dc
rm -rf .next

set nvm default
nvm use 20
nvm alias default 20

api trên host error fix
sshpass -p "\_GHKpxi#Gmp4E8elT34o" ssh -p 24700 root@103.56.162.100 "chown -R 1001:1001 /root/dictionary-mrvu/data && ls -la /root/dictionary-mrvu/data"
