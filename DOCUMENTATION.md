# 📚 བོད་ཀྱི་ཚིག་དཔེ་ - Tibetan-Vietnamese Dictionary

## Overview

A professional **Tibetan-Vietnamese Dictionary Application** with the following features:

### ✨ Core Features

#### 1. **Wylie Input → Uchen Display**

- Users type in **Wylie romanization** (Latin alphabet)
- Automatically converts to **Uchen Script** (དུ་ཆེན་ - official Tibetan script)
- Example: `kho` → `ཁོ` (he/him)

#### 2. **Bilingual Interface**

- Switch between **བོད།** (Tibetan) and **VIE** (Vietnamese) with one click
- Full UI translation support
- Maintains search context across language switches

#### 3. **Split-Panel Layout**

```
┌─────────────────────────────────────────────────────┐
│  Search Bar (Wylie Input → Uchen Display)           │
├──────────────────────┬───────────────────────────────┤
│  Left Panel          │  Right Panel                  │
│  Search Results      │  Selected Word Definition      │
│                      │                               │
│  Word 1 ཀ་          │  ཀ་                          │
│  Word 2 ཁ་          │  Pronunciation: ka            │
│  Word 3 ག་          │                               │
│  ...                 │  📖 Ndict:                    │
│                      │  [Definition text]            │
│                      │                               │
│                      │  ✍️ Tdict:                    │
│                      │  [Translation specialized]    │
│                      │                               │
│                      │  🏛️ Drepung:                 │
│                      │  [Alternative source]        │
└──────────────────────┴───────────────────────────────┘
```

#### 4. **Multiple Dictionary Sources**

Each word displays definitions from:

- **📖 Ndict** - General, comprehensive definitions
- **✍️ Tdict** - Translation specialist dictionary
- **🏛️ Drepung** - Alternative source (if available)

### 🔧 Technical Stack

**Frontend:**

- Next.js 16 (React Server Components)
- React 19 with Hooks
- TypeScript 5.x
- Tailwind CSS 4 (custom styling)
- Noto Sans Tibetan font (Google Fonts)

**Backend:**

- Node.js 20.19.5
- SQLite 3 (better-sqlite3 v9.2.2)
- Express-style API routes (Next.js API)

**Data:**

- 53,343+ Tibetan words
- Excel import/export (.xlsx)
- Column mapping: B→original | C→ndict | E→phat_hc

### 📁 Project Structure

```
dictionary-mrvu/
├── app/
│   ├── page.tsx                    # Homepage
│   ├── layout.tsx                  # Root layout
│   ├── globals.css                 # Global styles + Tibetan fonts
│   ├── components/
│   │   ├── DictionarySearch.tsx    # Main search component (split-panel)
│   │   └── SearchForm.tsx          # Legacy search component
│   ├── admin/
│   │   └── import/
│   │       └── page.tsx            # Dual-tab admin panel (Upload/Search)
│   └── api/
│       └── dictionary/
│           ├── import/
│           │   └── route.ts        # Excel import endpoint
│           ├── search/
│           │   └── route.ts        # Search endpoint
│           └── stats/
│               └── route.ts        # Database stats endpoint
├── lib/
│   ├── db/
│   │   ├── init.ts                 # Database initialization
│   │   └── operations.ts           # CRUD operations + Word interface
│   └── wylie-converter.ts          # Wylie → Uchen conversion utility
├── data/
│   └── dictionary.db               # SQLite database
├── package.json
├── tsconfig.json
├── next.config.ts
└── tailwind.config.ts
```

### 🔄 Key Components

#### **DictionarySearch.tsx** (New Main Component)

- **Language mode toggle**: Tibet ↔ Vietnamese
- **Wylie input** with auto-conversion display
- **Split-panel layout**: Results (left) + Definition (right)
- **Auto-select first result** on search
- **Dictionary source parsing**: Ndict | Tdict | Drepung
- **Real-time stats**: Total words count
- **Vietnamese and Tibetan labels** throughout

#### **wylie-converter.ts** (New Utility)

Functions:

- `wylieToUchen(wylie)` - Convert Wylie to Uchen script
- `isUchen(text)` - Detect if text is already Uchen
- `autoConvert(input)` - Auto-detect and convert
- `getDisplayAndSearch(input)` - Return display + search forms

Supported mappings:

- Basic consonants: ka→ཀ, kha→ཁ, ga→ག, etc.
- Vowels: i→ི, u→ུ, e→ེ, o→ོ
- Consonant clusters: kyo→ཀྱོ, blo→བ་ལོ, etc.
- Particles and suffixes

### 📊 Database Schema

```sql
CREATE TABLE IF NOT EXISTS words (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  original TEXT NOT NULL UNIQUE,
  ndict TEXT,
  phat_hc TEXT,
  full_data TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_original ON words(original);
CREATE INDEX idx_original_lower ON words(lower(original));
```

**Columns:**

- `original` - Tibetan word (Uchen script) - UNIQUE, searchable
- `ndict` - Dictionary definitions (may contain multiple sources: Ndict | Tdict | Drepung)
- `phat_hc` - Pronunciation/Phonetics
- `full_data` - Complete Excel row as JSON (backup)

### 🎯 API Endpoints

#### **POST /api/dictionary/import**

Import Excel file with automatic deduplication

```bash
curl -X POST http://localhost:3000/api/dictionary/import \
  -F "file=@tudien.xlsx" \
  -F "replace=true"
```

Response:

```json
{
  "success": true,
  "message": "Import successful. Added: 53343, Updated: 0",
  "stats": {
    "added": 53343,
    "updated": 0,
    "total": 53343
  }
}
```

#### **GET /api/dictionary/search?q=...&limit=20**

Search for words

```bash
curl "http://localhost:3000/api/dictionary/search?q=ཀ&limit=20"
```

Response:

```json
{
  "success": true,
  "query": "ཀ",
  "count": 5,
  "results": [
    {
      "id": 1,
      "original": "ཀ་",
      "phat_hc": "ka",
      "ndict": "[Tibetan-Vietnamese definitions...]",
      "full_data": "{...complete row...}",
      "created_at": "2025-12-04...",
      "updated_at": "2025-12-04..."
    }
  ]
}
```

#### **GET /api/dictionary/stats**

Get database statistics

```bash
curl "http://localhost:3000/api/dictionary/stats"
```

Response:

```json
{
  "success": true,
  "data": {
    "totalWords": 53343,
    "firstWord": "ཀ་",
    "lastWord": "སེང་གེའི་ཁྲི་འཛིན་པ་",
    "lastUpdated": "2025-12-04T16:55:14.393Z"
  }
}
```

### 🚀 Running the Application

**Prerequisites:**

```bash
nvm use 20  # Node.js v20.19.5+
```

**Installation:**

```bash
npm install
```

**Development:**

```bash
npm run dev
# Runs on http://localhost:3000
```

**Production Build:**

```bash
npm run build
npm start
```

### 📝 User Workflow

1. **Visit homepage** → `http://localhost:3000`
2. **Choose language** → Click `བོད། ↔ VIE` button
3. **Enter Wylie** → Type word in Romanized form (e.g., `kho`, `bod`, `tibetan`)
4. **See auto-conversion** → Display shows Uchen script (e.g., `ཁོ`, `བོད`)
5. **Browse results** → Left panel shows matching words
6. **Select word** → Click to see full definition on right panel
7. **View definitions** → See Ndict, Tdict, Drepung sources

### 🎨 UI Features

- ✅ Responsive design (mobile-friendly)
- ✅ Dark/Light mode support
- ✅ Proper Tibetan font rendering
- ✅ Loading states with spinners
- ✅ Error handling and validation
- ✅ Empty state messages in both languages
- ✅ Expandable JSON detail view
- ✅ Smooth tab transitions
- ✅ Vietnamese and Tibetan labels throughout

### 🔐 Data Integrity

- **Duplicate handling**: Automatic deduplication during import (case-insensitive, trimmed)
- **Transaction support**: SQLite transactions for atomic operations
- **Error recovery**: Graceful error handling with detailed logging
- **Validation**: Input validation on all endpoints
- **Index optimization**: Fast lookup via indexed columns

### 📚 Dictionary Sources

The system can handle multiple dictionary sources in the `ndict` field:

```
Format: "[Source1]: definition1 | [Source2]: definition2"
Examples:
- "Ndict: definition here"
- "Ndict: def1 | Tdict: def2 | Drepung: def3"
```

### 🔮 Future Enhancements

1. **Advanced Wylie Converter**

   - Implement full Wylie spec (pyewts-js)
   - Handle tsheg bar (syllable breaks)
   - Support stacked consonants

2. **Export Features**

   - Export search results as PDF/Excel
   - Bookmark favorite words
   - Personal word lists

3. **Admin Features**

   - User authentication
   - Import history/logs
   - Dictionary version management
   - Batch edit interface

4. **Performance**

   - Full-text search indexing
   - Caching layer (Redis)
   - Pagination for large result sets

5. **Mobile App**
   - React Native version
   - Offline mode support
   - Voice input for Wylie

### 📄 License

[Your license here]

### 👥 Contributors

- Development team
- Tibetan language specialists
- Dictionary maintainers

---

**Last Updated:** December 5, 2025  
**Database Version:** 1.0 (53,343 words)  
**Next.js Version:** 16  
**React Version:** 19
