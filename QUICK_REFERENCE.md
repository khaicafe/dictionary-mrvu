# 🎯 QUICK REFERENCE - Updated API

## ✨ What Changed (TL;DR)

Your dictionary app now uses your Excel column structure:

- **Column B** → `original` (English)
- **Column C** → `ndict` (Vietnamese)
- **Column E** → `phat_hc` (Pronunciation)

---

## 🚀 Import Your File

```bash
# Start server first
npm run dev

# Then import (in another terminal)
curl -X POST http://localhost:3000/api/dictionary/import \
  -F "file=@tudien.xlsx" \
  -F "replace=true"
```

✅ Response: `{"success": true, "stats": {"added": 500, "updated": 0}}`

---

## 🔍 Search

### Web UI (Easy)

```
Open: http://localhost:3000
Type: word in search box
See: Results with original, phat_hc, ndict
```

### API Command

```bash
curl "http://localhost:3000/api/dictionary/search?q=hello&limit=10"
```

### Result Format

```
hello
/hə'ləʊ/
Nghĩa: xin chào
```

---

## 📊 Check Stats

```bash
curl http://localhost:3000/api/dictionary/stats
```

Shows: Total words, first/last word, last update

---

## 🗺️ Column Mapping

| Excel | Database | Example  |
| ----- | -------- | -------- |
| B     | original | hello    |
| C     | ndict    | xin chào |
| E     | phat_hc  | hə'ləʊ   |

---

## 📋 Excel Requirements

✅ Columns: `original`, `ndict`, `phat_hc`
✅ Formats: .xlsx, .xls, .csv
✅ Data: At least one row

---

## 🛠️ If Something's Wrong

| Problem            | Fix                                                  |
| ------------------ | ---------------------------------------------------- |
| Import fails       | Check Excel headers match (original, ndict, phat_hc) |
| Search empty       | Verify import worked with stats endpoint             |
| Server won't start | Update Node.js to 20.9+                              |
| Wrong columns      | Edit `app/api/dictionary/import/route.ts` line 40    |

---

## 📁 Key Files

```
app/api/dictionary/import/route.ts    ← Column mapping
app/api/dictionary/search/route.ts    ← Search logic
app/components/SearchForm.tsx         ← UI display
lib/db/operations.ts                  ← Database
data/dictionary.db                    ← Your data
```

---

## 🎓 Full Documentation

- **FINAL_REPORT.md** - Everything you need to know
- **API_UPDATES_SUMMARY.md** - API technical details
- **VISUAL_GUIDE.md** - Diagrams and flows
- **DETAILED_CHANGES.md** - Code before/after

---

## ✅ Status

- ✅ Build: Success (0 errors)
- ✅ Routes: All 7 ready
- ✅ Database: Ready
- ✅ API: Ready
- ✅ UI: Ready

---

## 🎉 You're All Set!

1. Run: `npm run dev`
2. Import: `curl -X POST ... -F "file=@tudien.xlsx"`
3. Search: Open http://localhost:3000
4. Enjoy! 🚀
