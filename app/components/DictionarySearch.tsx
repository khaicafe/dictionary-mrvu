'use client';

import {useState, useCallback, useEffect} from 'react';
import type {Word} from '@/lib/db/operations';
import {autoConvert, isUchen} from '@/lib/wylie-converter';

interface SearchResponse {
  success: boolean;
  query: string;
  count: number;
  results: Word[];
}

interface NhiepEntry {
  id?: number;
  phap: string;
  tang: string;
  tanh_tuong?: string;
  phan_loai?: string;
}

// Helper function to detect and style Tibetan text
function formatTibetanText(text: string | undefined | null) {
  if (!text) return '—';

  // Check if text contains "1." to start numbered list formatting
  const hasNumberedList = /1\.\s/.test(text);

  if (hasNumberedList) {
    // Find the position of "1."
    const match = text.match(/1\.\s/);
    if (match && match.index !== undefined) {
      const beforeList = text.substring(0, match.index);
      const fromList = text.substring(match.index);

      // Split the list part by number patterns but keep content together
      const listItems: {number: string; content: string}[] = [];
      const regex = /(\d+\.\s)/g;
      let lastIndex = 0;
      let match2;

      while ((match2 = regex.exec(fromList)) !== null) {
        if (lastIndex > 0) {
          // Save previous item's content
          const prevContent = fromList.substring(lastIndex, match2.index);
          if (listItems.length > 0) {
            listItems[listItems.length - 1].content = prevContent;
          }
        }
        listItems.push({number: match2[0], content: ''});
        lastIndex = match2.index + match2[0].length;
      }

      // Add content for the last item
      if (listItems.length > 0 && lastIndex < fromList.length) {
        listItems[listItems.length - 1].content = fromList.substring(lastIndex);
      }

      const tibetanRegex = /([\u0F00-\u0FFF]+)/g;

      // Render text with Tibetan on separate line if mixed with Vietnamese
      const renderTextWithTibetan = (txt: string) => {
        const parts = txt.split(tibetanRegex);
        const hasTibetan = parts.some((p) => tibetanRegex.test(p));
        const hasVietnamese = parts.some(
          (p) => !tibetanRegex.test(p) && p.trim().length > 0,
        );

        // If mixed content, separate Vietnamese and Tibetan
        if (hasTibetan && hasVietnamese) {
          const vietnameseParts: string[] = [];
          const tibetanParts: string[] = [];

          parts.forEach((part) => {
            if (tibetanRegex.test(part)) {
              tibetanParts.push(part);
            } else if (part.trim()) {
              vietnameseParts.push(part);
            }
          });

          return (
            <>
              {vietnameseParts.length > 0 && (
                <div className="block">{vietnameseParts.join(' ')}</div>
              )}
              {tibetanParts.length > 0 && (
                <div className="block font-bold text-[1.15em]">
                  {tibetanParts.join(' ')}
                </div>
              )}
            </>
          );
        }

        // No mixing, render inline with highlighting
        return parts.map((part, idx) => {
          if (tibetanRegex.test(part)) {
            return (
              <span key={idx} className="font-bold text-[1.15em]">
                {part}
              </span>
            );
          }
          return <span key={idx}>{part}</span>;
        });
      };

      return (
        <>
          {beforeList && <span>{renderTextWithTibetan(beforeList)}</span>}
          {listItems.map((item, idx) => (
            <div key={idx} className="block mt-2">
              <span className="font-bold text-purple-700">
                {item.number.trim()}{' '}
              </span>
              <span className="inline">
                {renderTextWithTibetan(item.content)}
              </span>
            </div>
          ))}
        </>
      );
    }
  }

  // No numbered list, just format Tibetan text normally
  const tibetanRegex = /([\u0F00-\u0FFF]+)/g;
  const parts = text.split(tibetanRegex);
  const hasTibetan = parts.some((p) => tibetanRegex.test(p));
  const hasVietnamese = parts.some(
    (p) => !tibetanRegex.test(p) && p.trim().length > 0,
  );

  // If mixed content, separate Vietnamese and Tibetan
  if (hasTibetan && hasVietnamese) {
    const vietnameseParts: string[] = [];
    const tibetanParts: string[] = [];

    parts.forEach((part) => {
      if (tibetanRegex.test(part)) {
        tibetanParts.push(part);
      } else if (part.trim()) {
        vietnameseParts.push(part);
      }
    });

    return (
      <>
        {vietnameseParts.length > 0 && (
          <div className="block">{vietnameseParts.join(' ')}</div>
        )}
        {tibetanParts.length > 0 && (
          <div className="block font-bold text-[1.15em]">
            {tibetanParts.join(' ')}
          </div>
        )}
      </>
    );
  }

  // No mixing, render inline with highlighting
  return (
    <>
      {parts.map((part, idx) => {
        if (tibetanRegex.test(part)) {
          return (
            <span key={idx} className="font-bold text-[1.15em]">
              {part}
            </span>
          );
        }
        return <span key={idx}>{part}</span>;
      })}
    </>
  );
}

export default function DictionarySearch() {
  const [activeSource, setActiveSource] = useState<'dictionary' | 'nhiep'>(
    'dictionary',
  );
  // Language mode
  const [langMode, setLangMode] = useState<'tibetan' | 'vietnamese'>('tibetan');

  // Search state
  const [query, setQuery] = useState('');
  const [displayQuery, setDisplayQuery] = useState('');
  const [results, setResults] = useState<Word[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedWord, setSelectedWord] = useState<Word | null>(null);
  const [stats, setStats] = useState<any>(null);
  const [nhiepStats, setNhiepStats] = useState<any>(null);

  const [nhiepResults, setNhiepResults] = useState<NhiepEntry[]>([]);
  const [selectedNhiep, setSelectedNhiep] = useState<NhiepEntry | null>(null);

  // Fetch stats on mount
  useEffect(() => {
    const fetchStats = async () => {
      try {
        const [dictRes, nhiepRes] = await Promise.all([
          fetch('/api/dictionary/stats').then((r) => r.json()),
          fetch('/api/nhiep/import').then((r) => r.json()),
        ]);

        if (dictRes.success) setStats(dictRes.data);
        if (nhiepRes.success) setNhiepStats(nhiepRes.data || nhiepRes.stats);
      } catch (error) {
        console.error('Failed to fetch stats:', error);
      }
    };
    fetchStats();
  }, []);

  // Handle search input
  const handleSearch = useCallback(
    async (searchQuery: string) => {
      setQuery(searchQuery);

      if (activeSource === 'dictionary') {
        // Auto-convert Wylie to Uchen for display
        const display = autoConvert(searchQuery);
        setDisplayQuery(display);

        if (!searchQuery.trim()) {
          setResults([]);
          setSelectedWord(null);
          return;
        }

        setLoading(true);
        try {
          const searchTerm = isUchen(searchQuery) ? searchQuery : display;
          const res = await fetch(
            `/api/dictionary/search?q=${encodeURIComponent(
              searchTerm,
            )}&limit=30`,
          );
          const data: SearchResponse = await res.json();
          if (data.success) {
            setResults(data.results);
            if (data.results.length > 0) {
              setSelectedWord(data.results[0]);
            }
          }
        } catch (error) {
          console.error('Search failed:', error);
          setResults([]);
        } finally {
          setLoading(false);
        }
      } else {
        // Nhiếp search: no auto-convert, search by Pháp or Tạng
        setDisplayQuery('');
        if (!searchQuery.trim()) {
          setNhiepResults([]);
          setSelectedNhiep(null);
          return;
        }

        setLoading(true);
        try {
          const res = await fetch(
            `/api/nhiep/search?q=${encodeURIComponent(searchQuery)}&limit=50`,
          );
          const data = await res.json();
          if (data.success) {
            setNhiepResults(data.results || []);
            if ((data.results || []).length > 0) {
              setSelectedNhiep(data.results[0]);
            }
          }
        } catch (error) {
          console.error('Nhiep search failed:', error);
          setNhiepResults([]);
        } finally {
          setLoading(false);
        }
      }
    },
    [activeSource],
  );

  const toggleLanguage = () => {
    setLangMode(langMode === 'tibetan' ? 'vietnamese' : 'tibetan');
  };

  return (
    <div className="space-y-6">
      {/* Source tabs */}
      <div className="flex gap-2">
        <button
          className={`px-4 py-2 rounded-lg font-semibold transition ${
            activeSource === 'dictionary'
              ? 'bg-blue-600 text-white'
              : 'bg-gray-100 text-gray-700'
          }`}
          onClick={() => {
            setActiveSource('dictionary');
            setNhiepResults([]);
            setSelectedNhiep(null);
          }}>
          📚 Từ điển Tạng
        </button>
        <button
          className={`px-4 py-2 rounded-lg font-semibold transition ${
            activeSource === 'nhiep'
              ? 'bg-purple-600 text-white'
              : 'bg-gray-100 text-gray-700'
          }`}
          onClick={() => {
            setActiveSource('nhiep');
            setResults([]);
            setSelectedWord(null);
          }}>
          📒 Nhiếp (Pháp - Tạng)
        </button>
      </div>

      {/* Header with Language Toggle */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900">
          {langMode === 'tibetan'
            ? '🇧🇹 བོད་ཀྱི་འགྲོ་ཡུལ་'
            : '🇻🇳 Từ Điển Tạng-Việt'}
        </h2>
        <button
          onClick={toggleLanguage}
          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition"
          title="Switch language display">
          {langMode === 'tibetan' ? 'བོད། ➔ VIE' : 'VIE ➔ བོད།'}
        </button>
      </div>

      {/* Search Bar with Wylie Input */}
      <div className="bg-white rounded-lg shadow-md p-4">
        <div className="space-y-3">
          <label className="block text-sm font-medium text-gray-700">
            🔍{' '}
            {activeSource === 'dictionary'
              ? langMode === 'tibetan'
                ? 'ཚིག་ཚོད་འདེགས་པ་'
                : 'Nhập từ khóa (Wylie)'
              : 'Nhập Pháp (cột A) hoặc Tạng (cột B)'}
          </label>
          <div className="relative">
            <input
              type="text"
              placeholder={
                activeSource === 'dictionary'
                  ? langMode === 'tibetan'
                    ? 'wylie ཡིན་ཞེས་འབྲི་...'
                    : 'VD: kho, bod, tibetan...'
                  : 'VD: vô thường, skye mched...'
              }
              value={query}
              onChange={(e) => handleSearch(e.target.value)}
              style={{
                color: '#000000',
                backgroundColor: '#ffffff',
                caretColor: '#000000',
              }}
              className={`w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-base font-semibold placeholder-gray-400 ${
                activeSource === 'dictionary' ? 'font-mono' : ''
              }`}
            />
            {loading && (
              <div className="absolute right-3 top-3">
                <div className="animate-spin h-5 w-5 text-blue-500">⟳</div>
              </div>
            )}
          </div>

          {/* Display converted text */}
          {activeSource === 'dictionary' &&
            displayQuery &&
            displayQuery !== query && (
              <div className="text-sm text-gray-600 font-tibetan">
                <span className="text-gray-500">Uchen:</span> {displayQuery}
              </div>
            )}

          {/* Stats */}
          {activeSource === 'dictionary' && stats && (
            <div className="text-xs text-gray-500">
              {langMode === 'tibetan'
                ? `ཚིག་ཚིག་ ༢༥༣༤༣ གི་ནང་འདེགས་`
                : `Có ${stats.totalWords} từ trong cơ sở dữ liệu`}
            </div>
          )}
          {activeSource === 'nhiep' && nhiepStats && (
            <div className="text-xs text-gray-500">
              Có {nhiepStats.total || 0} mục trong bảng Nhiếp
            </div>
          )}
        </div>
      </div>

      {activeSource === 'dictionary' && query.trim() && (
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 min-h-96">
          {/* Left Panel: Search Results */}
          <div className="lg:col-span-1 bg-white rounded-lg shadow-md overflow-hidden flex flex-col">
            <div className="bg-gray-100 px-4 py-3 border-b border-gray-200">
              <h3 className="font-semibold text-gray-800">
                {langMode === 'tibetan' ? 'ཚིག་དེ་མཚོན་' : 'Kết quả tìm kiếm'}
              </h3>
              <p className="text-xs text-gray-600">
                {results.length} {langMode === 'tibetan' ? 'ཚིག' : 'kết quả'}
              </p>
            </div>

            <div className="flex-1 overflow-y-auto">
              {results.length > 0 ? (
                <div className="divide-y divide-gray-200">
                  {results.map((word, idx) => (
                    <button
                      key={idx}
                      onClick={() => setSelectedWord(word)}
                      className={`w-full text-left px-4 py-3 transition hover:bg-blue-50 ${
                        selectedWord?.id === word.id
                          ? 'bg-blue-100 border-l-4 border-blue-600'
                          : ''
                      }`}>
                      <div className="text-lg font-bold text-gray-900 font-tibetan">
                        {word.original}
                      </div>
                      {word.phat_hc && (
                        <div className="text-xs text-gray-600 mt-1">
                          {langMode === 'tibetan' ? 'ཕྲ་གདའ་: ' : 'Phát âm: '}
                          {word.phat_hc.substring(0, 30)}...
                        </div>
                      )}
                    </button>
                  ))}
                </div>
              ) : (
                <div className="p-4 text-center text-gray-500">
                  {loading
                    ? langMode === 'tibetan'
                      ? 'འཚོལ་ཞིབ་ལ་བརྡ་ཕེ་...'
                      : 'Đang tìm kiếm...'
                    : langMode === 'tibetan'
                    ? 'ཚིག་མེད་'
                    : 'Không tìm thấy'}
                </div>
              )}
            </div>
          </div>

          {/* Right Panel: Selected Word Definition */}
          <div className="lg:col-span-3 bg-white rounded-lg shadow-md p-6 overflow-y-auto">
            {selectedWord ? (
              <div className="space-y-6">
                {/* Header with word */}
                <div className="border-b border-gray-200 pb-4">
                  <div className="text-4xl font-bold font-tibetan text-blue-600 mb-2">
                    {selectedWord.original}
                  </div>
                  {selectedWord.phat_hc && (
                    <div className="text-sm text-gray-600">
                      {langMode === 'tibetan' ? 'ཕྲ་གདའ་: ' : 'Phát âm: '}
                      <span className="font-mono text-gray-700">
                        {selectedWord.phat_hc}
                      </span>
                    </div>
                  )}
                </div>

                {/* Dictionary sections - 2 columns layout */}
                {selectedWord.ndict || selectedWord.tdict ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Ndict section */}
                    {selectedWord.ndict ? (
                      <div>
                        <h4 className="text-sm font-semibold text-gray-700 mb-2">
                          📖{' '}
                          {langMode === 'tibetan'
                            ? 'Ndict (ཕྲ་གདའ་)'
                            : 'Ndict (Phổ thông)'}
                        </h4>
                        <div className="bg-gray-50 p-4 rounded-lg text-gray-800 whitespace-pre-wrap leading-relaxed text-base min-h-48 overflow-y-auto">
                          {selectedWord.ndict}
                        </div>
                      </div>
                    ) : (
                      <div className="bg-gray-50 p-4 rounded-lg text-gray-500 italic text-center min-h-48 flex items-center justify-center">
                        {langMode === 'tibetan'
                          ? 'ཚིག་དོན་མེད་'
                          : 'Chưa có dữ liệu'}
                      </div>
                    )}

                    {/* Tdict section */}
                    {selectedWord.tdict ? (
                      <div>
                        <h4 className="text-sm font-semibold text-gray-700 mb-2">
                          ✍️{' '}
                          {langMode === 'tibetan'
                            ? 'Tdict (དུས་རིས་)'
                            : 'Tdict (Tổng hợp)'}
                        </h4>
                        <div className="bg-purple-50 p-4 rounded-lg text-gray-800 whitespace-pre-wrap leading-relaxed text-base min-h-48 overflow-y-auto">
                          {selectedWord.tdict}
                        </div>
                      </div>
                    ) : (
                      <div className="bg-purple-50 p-4 rounded-lg text-gray-500 italic text-center min-h-48 flex items-center justify-center">
                        {langMode === 'tibetan'
                          ? 'ཚིག་དོན་མེད་'
                          : 'Chưa có dữ liệu'}
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="text-gray-500 italic py-4">
                    {langMode === 'tibetan'
                      ? 'ཚིག་དོན་མེད་'
                      : 'Chưa có định nghĩa'}
                  </div>
                )}

                {/* Metadata */}
                <div className="border-t border-gray-200 pt-4 text-xs text-gray-500">
                  <div>
                    {langMode === 'tibetan'
                      ? 'ལེགས་སྦྱར་དུས་ཚོད་: '
                      : 'Cập nhật: '}
                    {selectedWord.updated_at
                      ? new Date(selectedWord.updated_at).toLocaleDateString()
                      : 'N/A'}
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex items-center justify-center h-full text-gray-500">
                {langMode === 'tibetan'
                  ? 'གཞུང་དང་འདྲེས་རེས་ལ་གཏུབ་བྱེད་དུ་ཞུ་རོགས་།'
                  : 'Chọn từ bên trái để xem định nghĩa'}
              </div>
            )}
          </div>
        </div>
      )}

      {activeSource === 'nhiep' && query.trim() && (
        <div className="bg-white rounded-lg shadow-md p-4 space-y-4">
          {nhiepResults.length === 0 && !loading ? (
            <div className="text-center text-gray-500 py-6">Không tìm thấy</div>
          ) : (
            <div className="border border-purple-200 rounded-lg overflow-hidden">
              {/* Header - hidden on mobile */}
              <div className="hidden md:grid grid-cols-4 bg-purple-50 text-purple-900 font-semibold text-lg py-3 px-4">
                <div>Pháp</div>
                <div>Tạng</div>
                <div>Tánh tướng</div>
                <div>Phân loại</div>
              </div>
              <div className="divide-y divide-gray-100">
                {nhiepResults.map((item, idx) => {
                  const isActive = selectedNhiep?.phap === item.phap;
                  return (
                    <button
                      key={idx}
                      onClick={() => setSelectedNhiep(item)}
                      className={`w-full text-left px-4 py-3 transition ${
                        isActive
                          ? 'bg-purple-50 border-l-4 border-purple-500'
                          : 'hover:bg-gray-50'
                      }`}>
                      {/* Desktop: 4 columns */}
                      <div className="hidden md:grid grid-cols-4 gap-3">
                        <div className="font-semibold text-xl text-gray-900 break-words">
                          {item.phap || '—'}
                        </div>
                        <div className="text-xl text-purple-800 font-semibold break-words">
                          {item.tang || '—'}
                        </div>
                        <div className="text-lg text-gray-700 break-words">
                          {formatTibetanText(item.tanh_tuong)}
                        </div>
                        <div className="text-lg text-gray-700 break-words">
                          {formatTibetanText(item.phan_loai)}
                        </div>
                      </div>

                      {/* Mobile: 4 rows stacked */}
                      <div className="md:hidden space-y-3">
                        <div>
                          <div className="text-base text-purple-700 font-semibold mb-1">
                            Pháp
                          </div>
                          <div className="font-semibold text-xl text-gray-900 break-words">
                            {item.phap || '—'}
                          </div>
                        </div>
                        <div>
                          <div className="text-base text-purple-700 font-semibold mb-1">
                            Tạng
                          </div>
                          <div className="text-xl text-purple-800 font-semibold break-words">
                            {item.tang || '—'}
                          </div>
                        </div>
                        <div>
                          <div className="text-base text-purple-700 font-semibold mb-1">
                            Tánh tướng
                          </div>
                          <div className="text-lg text-gray-700 break-words">
                            {formatTibetanText(item.tanh_tuong)}
                          </div>
                        </div>
                        <div>
                          <div className="text-base text-purple-700 font-semibold mb-1">
                            Phân loại
                          </div>
                          <div className="text-lg text-gray-700 break-words">
                            {formatTibetanText(item.phan_loai)}
                          </div>
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* {selectedNhiep && (
            <div className="border border-purple-200 rounded-lg p-4 bg-purple-50 space-y-3">
              <div className="text-xl font-bold text-gray-900">
                {selectedNhiep.phap}
              </div>
              <div className="text-lg text-purple-800 font-semibold">
                {selectedNhiep.tang}
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <div className="text-xs font-semibold text-gray-600 uppercase mb-1">
                    Cột C • Tánh tướng
                  </div>
                  <div className="bg-white border rounded-lg p-3 text-gray-800 whitespace-pre-wrap min-h-[80px]">
                    {selectedNhiep.tanh_tuong || '—'}
                  </div>
                </div>
                <div>
                  <div className="text-xs font-semibold text-gray-600 uppercase mb-1">
                    Cột D • Phân loại
                  </div>
                  <div className="bg-white border rounded-lg p-3 text-gray-800 min-h-[80px]">
                    {selectedNhiep.phan_loai || '—'}
                  </div>
                </div>
              </div>
            </div>
          )} */}
        </div>
      )}

      {/* Empty State */}
      {!query.trim() && activeSource === 'dictionary' && (
        <div className="text-center py-12">
          <div className="text-6xl mb-4">📚</div>
          <h3 className="text-2xl font-bold text-gray-900 mb-2">
            {langMode === 'tibetan' ? 'བོད་ཀྱི་ཚིག་དཔེ་' : 'Từ Điển Tibetan'}
          </h3>
          <p className="text-gray-600 mb-4">
            {langMode === 'tibetan'
              ? 'Wylie ཚེག་བཅད་ལ་འདེགས་བྱེད་ནས་ཚིག་གི་དོན་ནོར་ལ་བལྟ་རོགས་།'
              : 'Nhập từ khóa bằng Wylie để tìm kiếm. Input sẽ tự động chuyển sang Uchen.'}
          </p>
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 max-w-md mx-auto text-left">
            <p className="text-sm font-semibold text-blue-900 mb-2">
              💡 Ví dụ:
            </p>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>• kho → ཁོ (he/him)</li>
              <li>• bod → བོད (Tibet)</li>
              <li>• tibetan → Tibetan language</li>
            </ul>
          </div>
        </div>
      )}

      {!query.trim() && activeSource === 'nhiep' && (
        <div className="text-center py-8 bg-white rounded-lg shadow-sm">
          <div className="text-4xl mb-3">📒</div>
          <p className="text-lg font-semibold text-gray-900 mb-1">
            Nhiếp (Pháp - Tạng)
          </p>
          <p className="text-gray-600">
            Nhập Pháp (cột A) hoặc Tạng (cột B) để tra cứu
          </p>
          {nhiepStats && (
            <p className="text-sm text-gray-500 mt-2">
              Hiện có {nhiepStats.total || 0} mục
            </p>
          )}
        </div>
      )}
    </div>
  );
}
