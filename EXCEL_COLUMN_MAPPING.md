# Excel Column Mapping Reference

## 📋 Ánh xạ Cột Excel → Database

Your `tudien.xlsx` file structure:

```
┌──────┬──────────────┬────────┬──────────┬────────┬────────┬─────────────────┐
│ Row# │ Original     │ Ndict  │ Phát hc  │ Tdict  │ ...    │ Other Columns   │
│      │ (Column B)   │ (C)    │ (E)      │ (F)    │        │                 │
├──────┼──────────────┼────────┼──────────┼────────┼────────┼─────────────────┤
│  1   │ hello        │ xin chào│ hə'ləʊ  │ ...    │        │ ...             │
│  2   │ world        │ thế giới│ wɜːld   │ ...    │        │ ...             │
│  3   │ dictionary   │ từ điển │ 'dɪkʃneri│ ...    │        │ ...             │
└──────┴──────────────┴────────┴──────────┴────────┴────────┴─────────────────┘
```

## 🔗 Database Mapping

```typescript
interface Word {
  id?: number; // AUTO GENERATED
  original: string; // ← Column B
  ndict?: string; // ← Column C
  phat_hc?: string; // ← Column E
  full_data?: string; // ← All columns as JSON
  created_at?: string; // ← AUTO GENERATED
  updated_at?: string; // ← AUTO GENERATED
}
```

## 📊 Import Process

### Excel File Reading

```
tudien.xlsx (Input)
    ↓
XLSX.utils.sheet_to_json()
    ↓
Extract: {original, ndict, phat_hc, ...otherColumns}
    ↓
Convert to Word objects:
  - original: row.original?.toString().trim() || ''
  - ndict: row.ndict?.toString().trim() || ''
  - phat_hc: row.phat_hc?.toString().trim() || ''
  - full_data: JSON.stringify(row) // Store all columns
    ↓
Database INSERT/UPDATE
    ↓
words table in SQLite
```

## 🎯 Column Details

| Field          | Column | Type                 | Notes                               |
| -------------- | ------ | -------------------- | ----------------------------------- |
| **original**   | B      | TEXT NOT NULL UNIQUE | English word - Primary search field |
| **ndict**      | C      | TEXT                 | Vietnamese meaning                  |
| **phat_hc**    | E      | TEXT                 | Pronunciation                       |
| **full_data**  | ALL    | TEXT (JSON)          | Entire row stored for reference     |
| **id**         | -      | INTEGER              | Auto-generated Primary Key          |
| **created_at** | -      | DATETIME             | Import timestamp                    |
| **updated_at** | -      | DATETIME             | Last update timestamp               |

## 🔍 Search Behavior

When searching with query "hello":

```sql
SELECT * FROM words
WHERE lower(original) LIKE lower('hello%')
ORDER BY original ASC
LIMIT 20;

Result:
{
  id: 1,
  original: "hello",
  ndict: "xin chào",
  phat_hc: "hə'ləʊ",
  full_data: '{"original":"hello","ndict":"xin chào",...}'
}
```

## ✏️ How to Modify Column Mapping

If your Excel file has different column names, edit `app/api/dictionary/import/route.ts`:

### Current Mapping:

```typescript
const words: Word[] = rawData.map((row: any) => ({
  original: row.original?.toString().trim() || '', // ← Change if column name differs
  ndict: row.ndict?.toString().trim() || '', // ← Change if column name differs
  phat_hc: row.phat_hc?.toString().trim() || '', // ← Change if column name differs
  full_data: JSON.stringify(row),
}));
```

### Example: Different Column Headers

If your file uses "word", "meaning", "pronunciation" instead:

```typescript
const words: Word[] = rawData.map((row: any) => ({
  original: row.word?.toString().trim() || '', // Changed from row.original
  ndict: row.meaning?.toString().trim() || '', // Changed from row.ndict
  phat_hc: row.pronunciation?.toString().trim() || '', // Changed from row.phat_hc
  full_data: JSON.stringify(row),
}));
```

## 📥 Import Example with Different File

```bash
# If tudien.xlsx has headers: "word", "meaning", "pronunciation"
# Update the mapping in import/route.ts first
# Then import:

curl -X POST http://localhost:3000/api/dictionary/import \
  -F "file=@mydictionary.xlsx" \
  -F "replace=true"
```

## 💾 Database Storage Example

After importing, SQLite `words` table will contain:

```
id | original   | ndict      | phat_hc     | full_data                              | created_at              | updated_at
---|------------|------------|-------------|----------------------------------------|-------------------------|------------------------
1  | hello      | xin chào   | hə'ləʊ      | {"original":"hello",...}               | 2024-01-01 10:00:00     | 2024-01-01 10:00:00
2  | world      | thế giới   | wɜːld       | {"original":"world",...}               | 2024-01-01 10:00:05     | 2024-01-01 10:00:05
3  | dictionary | từ điển    | 'dɪkʃneri   | {"original":"dictionary",...}          | 2024-01-01 10:00:10     | 2024-01-01 10:00:10
```

## 🎨 UI Display Format

Search Result Display:

```
┌─────────────────────────────────────┐
│ hello                               │
│ /hə'ləʊ/                            │
│                                     │
│ Nghĩa: xin chào                     │
└─────────────────────────────────────┘
```

From database fields:

- Title: `word.original` (hello)
- Pronunciation: `word.phat_hc` (/hə'ləʊ/)
- Meaning: `word.ndict` (xin chào)

## 🔄 Replace Mode Behavior

### Replace Mode = true

```
Excel has: "hello" → "xin chào"
Database has: "hello" → "chào"

Result:
Database: "hello" → "xin chào"  ← UPDATED
```

### Replace Mode = false

```
Excel has: "hello" → "xin chào"
Database has: "hello" → "chào"

Result:
Database: "hello" → "chào"  ← NO CHANGE (skipped)
```

## 🚀 Quick Reference

**To change which columns are imported:**

1. Edit `app/api/dictionary/import/route.ts` line ~40
2. Change: `row.original`, `row.ndict`, `row.phat_hc`
3. To: `row.yourColumnName`

**To view full row data:**

```bash
# Search and check full_data field
curl "http://localhost:3000/api/dictionary/search?q=hello" | jq '.results[0].full_data'
```

**To export/debug imported data:**

```bash
# The full_data field contains the complete Excel row
# You can use it to troubleshoot or extend functionality
```
