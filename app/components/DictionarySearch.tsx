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

export default function DictionarySearch() {
  // Language mode
  const [langMode, setLangMode] = useState<'tibetan' | 'vietnamese'>('tibetan');

  // Search state
  const [query, setQuery] = useState('');
  const [displayQuery, setDisplayQuery] = useState('');
  const [results, setResults] = useState<Word[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedWord, setSelectedWord] = useState<Word | null>(null);
  const [stats, setStats] = useState<any>(null);

  // Fetch stats on mount
  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await fetch('/api/dictionary/stats');
        const data = await res.json();
        if (data.success) {
          setStats(data.data);
        }
      } catch (error) {
        console.error('Failed to fetch stats:', error);
      }
    };
    fetchStats();
  }, []);

  // Handle search input
  const handleSearch = useCallback(async (searchQuery: string) => {
    setQuery(searchQuery);

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
      // Search using both original input and converted form
      const searchTerm = isUchen(searchQuery) ? searchQuery : display;
      const res = await fetch(
        `/api/dictionary/search?q=${encodeURIComponent(searchTerm)}&limit=30`,
      );
      const data: SearchResponse = await res.json();
      if (data.success) {
        setResults(data.results);
        // Auto-select first result
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
  }, []);

  const toggleLanguage = () => {
    setLangMode(langMode === 'tibetan' ? 'vietnamese' : 'tibetan');
  };

  return (
    <div className="space-y-6">
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
            {langMode === 'tibetan'
              ? 'ཚིག་ཚོད་འདེགས་པ་'
              : 'Nhập từ khóa (Wylie)'}
          </label>
          <div className="relative">
            <input
              type="text"
              placeholder={
                langMode === 'tibetan'
                  ? 'wylie ཡིན་ཞེས་འབྲི་...'
                  : 'VD: kho, bod, tibetan...'
              }
              value={query}
              onChange={(e) => handleSearch(e.target.value)}
              style={{
                color: '#000000',
                backgroundColor: '#ffffff',
                caretColor: '#000000',
              }}
              className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-base font-mono font-semibold placeholder-gray-400"
            />
            {loading && (
              <div className="absolute right-3 top-3">
                <div className="animate-spin h-5 w-5 text-blue-500">⟳</div>
              </div>
            )}
          </div>

          {/* Display converted text */}
          {displayQuery && displayQuery !== query && (
            <div className="text-sm text-gray-600 font-tibetan">
              <span className="text-gray-500">Uchen:</span> {displayQuery}
            </div>
          )}

          {/* Stats */}
          {stats && (
            <div className="text-xs text-gray-500">
              {langMode === 'tibetan'
                ? `ཚིག་ཚིག་ ༢༥༣༤༣ གི་ནང་འདེགས་`
                : `Có ${stats.totalWords} từ trong cơ sở dữ liệu`}
            </div>
          )}
        </div>
      </div>

      {/* Split Panel: Results (Left) and Definition (Right) */}
      {query.trim() && (
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

      {/* Empty State */}
      {!query.trim() && (
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
    </div>
  );
}
