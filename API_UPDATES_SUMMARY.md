# API Updates Summary - Excel Column Mapping

## Overview

Updated all API routes and components to match the specific Excel file structure of `tudien.xlsx`:

- **Column B** → `original` (English words)
- **Column C** → `ndict` (Vietnamese translation)
- **Column E** → `phat_hc` (Pronunciation)

## Files Updated

### 1. **app/api/dictionary/import/route.ts** ✅

**Changes:**

- Updated column mapping logic to extract from Excel columns B, C, E
- Maps Excel data to Word interface: `original`, `ndict`, `phat_hc`, `full_data`
- Stores complete row data in `full_data` as JSON for future reference

**Key Code:**

```typescript
const words: Word[] = rawData
  .map((row: any) => ({
    original: row.original?.toString().trim() || '',
    ndict: row.ndict?.toString().trim() || '',
    phat_hc: row.phat_hc?.toString().trim() || '',
    full_data: JSON.stringify(row), // Store full row data
  }))
  .filter((w) => w.original); // Filter out empty words
```

**Import Endpoint:**

- `POST /api/dictionary/import` - Upload and import Excel file
- Parameters: `file` (Form Data), `replace` (boolean for replace mode)
- Returns: `{success, message, stats: {added, updated, total}}`

### 2. **app/api/dictionary/search/route.ts** ✅

**Status:** Already compatible - no changes needed

- Uses `searchWords(query, limit)` which searches the `original` column
- Returns Word objects with all fields: `original`, `ndict`, `phat_hc`, `full_data`

**Search Endpoint:**

- `GET /api/dictionary/search?q=<query>&limit=<number>`
- Case-insensitive search on `original` column
- Default limit: 20, max: 100

### 3. **app/api/dictionary/stats/route.ts** ✅

**Status:** Already compatible - no changes needed

- Returns database statistics via `getStats()` method

**Stats Endpoint:**

- `GET /api/dictionary/stats`
- Returns: `{success, data: {totalWords, firstWord, lastWord, lastUpdated}}`

### 4. **app/components/SearchForm.tsx** ✅

**Changes:**

- Updated result display to show `original` (main word) and `phat_hc` (pronunciation)
- Displays `ndict` (Vietnamese translation) as "Nghĩa" (meaning)
- Removed unused fields: `word`, `pronunciation`, `definition`, `part_of_speech`, `example`, `synonyms`, `antonyms`

**Display Format:**

```
[original] /phat_hc/
Nghĩa: [ndict]
```

## Database Schema

```sql
CREATE TABLE words (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  original TEXT NOT NULL UNIQUE,      -- Column B
  ndict TEXT,                          -- Column C
  phat_hc TEXT,                        -- Column E
  full_data TEXT,                      -- All row data as JSON
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

## Indexes

- `idx_original` on `original` column
- `idx_original_lower` on `lower(original)` for case-insensitive search

## Build Status

✅ **Build Successful** - All TypeScript files compile without errors
✅ **No Compilation Errors** - Type safety verified
✅ **All Routes Configured** - API endpoints ready

## Testing Steps

### 1. Import Excel File

```bash
curl -X POST http://localhost:3000/api/dictionary/import \
  -F "file=@tudien.xlsx" \
  -F "replace=true"
```

Expected Response:

```json
{
  "success": true,
  "message": "Import successful. Added: X, Updated: Y",
  "stats": {
    "added": X,
    "updated": Y,
    "total": X + Y
  }
}
```

### 2. Search for Words

```bash
curl "http://localhost:3000/api/dictionary/search?q=hello&limit=10"
```

Expected Response:

```json
{
  "success": true,
  "query": "hello",
  "count": 2,
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

### 3. Get Statistics

```bash
curl http://localhost:3000/api/dictionary/stats
```

Expected Response:

```json
{
  "success": true,
  "data": {
    "totalWords": 1000,
    "firstWord": "a",
    "lastWord": "zoo",
    "lastUpdated": "2024-01-01T00:00:00.000Z"
  }
}
```

## Notes

- **Replace Mode**: When `replace=true`, existing words are updated; when `false`, duplicates are skipped
- **Case Sensitivity**: Search is case-insensitive on the `original` column
- **Full Data Storage**: Complete Excel row is stored as JSON in `full_data` for future reference if needed
- **Column Mapping**: Flexible - if your Excel uses different headers, update the mapping logic in `import/route.ts`

## Next Steps

1. Test import with your `tudien.xlsx` file
2. Verify search functionality on imported data
3. Create admin interface for file upload (consider dual-tab UI as planned)
