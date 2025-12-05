-- SQL Examples for Dictionary MRVU
-- Sử dụng với SQLite 3

-- ============================================
-- 1. SEARCH EXAMPLES
-- ============================================

-- Tìm từ bắt đầu bằng "hel"
SELECT * FROM words 
WHERE lower(word) LIKE 'hel%'
LIMIT 20;

-- Tìm từ chứa "test"
SELECT * FROM words 
WHERE lower(word) LIKE '%test%'
LIMIT 20;

-- Tìm từ chính xác "hello"
SELECT * FROM words 
WHERE lower(word) = 'hello';

-- Tìm từ khác null
SELECT * FROM words 
WHERE definition IS NOT NULL
LIMIT 10;

-- ============================================
-- 2. STATISTICS EXAMPLES
-- ============================================

-- Tổng số từ
SELECT COUNT(*) as total_words FROM words;

-- Từ đầu tiên (theo thời gian)
SELECT word FROM words 
ORDER BY created_at ASC 
LIMIT 1;

-- Từ cuối cùng (theo thời gian)
SELECT word FROM words 
ORDER BY created_at DESC 
LIMIT 1;

-- Từ được update gần đây nhất
SELECT * FROM words 
ORDER BY updated_at DESC 
LIMIT 5;

-- ============================================
-- 3. INSERT EXAMPLES
-- ============================================

-- Thêm một từ mới
INSERT INTO words (word, definition, pronunciation, example, part_of_speech)
VALUES ('amazing', 'rất tuyệt vời', 'əˈmeɪzɪŋ', 'This is an amazing day!', 'adjective');

-- Thêm nhiều từ
INSERT INTO words (word, definition, part_of_speech)
VALUES 
  ('apple', 'quả táo', 'noun'),
  ('book', 'quyển sách', 'noun'),
  ('cat', 'con mèo', 'noun');

-- ============================================
-- 4. UPDATE EXAMPLES
-- ============================================

-- Cập nhật định nghĩa
UPDATE words 
SET definition = 'xin chào, lời chào' 
WHERE word = 'hello';

-- Cập nhật với thời gian
UPDATE words 
SET definition = 'định nghĩa mới', updated_at = CURRENT_TIMESTAMP 
WHERE id = 1;

-- Cập nhật tất cả từ có part_of_speech NULL
UPDATE words 
SET part_of_speech = 'unknown' 
WHERE part_of_speech IS NULL;

-- ============================================
-- 5. DELETE EXAMPLES
-- ============================================

-- Xóa một từ
DELETE FROM words 
WHERE word = 'test';

-- Xóa từ có định nghĩa trống
DELETE FROM words 
WHERE definition IS NULL OR definition = '';

-- Xóa tất cả từ (cẩn thận!)
DELETE FROM words;

-- ============================================
-- 6. ADVANCED QUERIES
-- ============================================

-- Những từ chưa có phát âm
SELECT word, definition 
FROM words 
WHERE pronunciation IS NULL OR pronunciation = ''
LIMIT 20;

-- Những từ chưa có ví dụ
SELECT word, definition 
FROM words 
WHERE example IS NULL OR example = ''
LIMIT 20;

-- Từ được thêm hôm nay
SELECT word, created_at 
FROM words 
WHERE DATE(created_at) = DATE('now')
ORDER BY created_at DESC;

-- Từ được cập nhật trong 7 ngày qua
SELECT word, updated_at 
FROM words 
WHERE DATE(updated_at) > DATE('now', '-7 days')
ORDER BY updated_at DESC;

-- ============================================
-- 7. AGGREGATE EXAMPLES
-- ============================================

-- Đếm từ theo loại từ
SELECT part_of_speech, COUNT(*) as count 
FROM words 
WHERE part_of_speech IS NOT NULL
GROUP BY part_of_speech
ORDER BY count DESC;

-- Những loại từ không có từ nào
SELECT DISTINCT part_of_speech 
FROM words 
WHERE part_of_speech IS NOT NULL;

-- ============================================
-- 8. INDEX EXAMPLES
-- ============================================

-- Tạo index để tìm kiếm nhanh
CREATE INDEX IF NOT EXISTS idx_word ON words(word);

-- Tạo index lowercase cho tìm kiếm case-insensitive
CREATE INDEX IF NOT EXISTS idx_word_lower ON words(lower(word));

-- Tạo index cho definition (full-text search)
CREATE INDEX IF NOT EXISTS idx_definition ON words(definition);

-- Kiểm tra indexes đã tồn tại
PRAGMA index_list(words);

-- ============================================
-- 9. PERFORMANCE TIPS
-- ============================================

-- Query nhanh (có index)
SELECT * FROM words WHERE lower(word) LIKE 'a%' LIMIT 20;

-- Explain query plan
EXPLAIN QUERY PLAN 
SELECT * FROM words 
WHERE lower(word) LIKE 'a%' 
LIMIT 20;

-- ============================================
-- 10. BATCH OPERATIONS
-- ============================================

-- Begin transaction cho tốc độ
BEGIN TRANSACTION;

INSERT INTO words (word, definition) VALUES ('word1', 'def1');
INSERT INTO words (word, definition) VALUES ('word2', 'def2');
INSERT INTO words (word, definition) VALUES ('word3', 'def3');

COMMIT;

-- Rollback nếu có lỗi
ROLLBACK;

-- ============================================
-- 11. EXPORT EXAMPLES
-- ============================================

-- Export to CSV
.mode csv
.output export.csv
SELECT * FROM words;
.output stdout

-- Export to JSON (requires extension)
-- SELECT json_group_array(json_object('word', word, 'definition', definition))
-- FROM words;

-- ============================================
-- 12. DATABASE MAINTENANCE
-- ============================================

-- Check database integrity
PRAGMA integrity_check;

-- Vacuum database (optimize)
VACUUM;

-- Analyze untuk cải thiện query performance
ANALYZE;

-- WAL mode (Write-Ahead Logging) cho performance
PRAGMA journal_mode = WAL;

-- ============================================
-- 13. USEFUL VIEWS
-- ============================================

-- Tạo view cho những từ đầy đủ thông tin
CREATE VIEW IF NOT EXISTS complete_words AS
SELECT * FROM words 
WHERE definition IS NOT NULL 
  AND pronunciation IS NOT NULL 
  AND example IS NOT NULL
  AND part_of_speech IS NOT NULL;

-- Sử dụng view
SELECT word, definition FROM complete_words LIMIT 10;

-- ============================================
-- 14. TESTING DATA
-- ============================================

-- Thêm dữ liệu test
INSERT INTO words (word, definition, pronunciation, example, part_of_speech, synonyms, antonyms)
VALUES 
  ('hello', 'xin chào', 'həˈloʊ', 'Hello, how are you?', 'noun', 'hi, hey', 'goodbye'),
  ('goodbye', 'tạm biệt', 'ɡʊdˈbaɪ', 'Goodbye, see you later!', 'noun', 'bye, farewell', 'hello'),
  ('apple', 'quả táo', 'ˈæpəl', 'An apple a day keeps the doctor away', 'noun', 'fruit', ''),
  ('beautiful', 'xinh đẹp', 'ˈbjuːtɪfl', 'She is very beautiful', 'adjective', 'pretty, gorgeous', 'ugly'),
  ('run', 'chạy', 'rʌn', 'I run every morning', 'verb', 'sprint, jog', 'walk');

-- Verify dữ liệu
SELECT COUNT(*) FROM words;
SELECT * FROM words LIMIT 5;

-- ============================================
-- 15. CLEANUP
-- ============================================

-- Xóa tất cả test data
DELETE FROM words;

-- Drop view nếu không dùng
DROP VIEW IF EXISTS complete_words;

-- Drop index
DROP INDEX IF EXISTS idx_word_lower;
