'use client';

import {useState, useCallback, useEffect} from 'react';
import type {Word} from '@/lib/db/operations';

interface SearchResponse {
  success: boolean;
  query: string;
  count: number;
  results: Word[];
}

export default function SearchForm() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<Word[]>([]);
  const [loading, setLoading] = useState(false);
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

  // Search with debounce
  const handleSearch = useCallback(async (searchQuery: string) => {
    setQuery(searchQuery);

    if (!searchQuery.trim()) {
      setResults([]);
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(
        `/api/dictionary/search?q=${encodeURIComponent(searchQuery)}&limit=30`,
      );
      const data: SearchResponse = await res.json();
      if (data.success) {
        setResults(data.results);
      }
    } catch (error) {
      console.error('Search failed:', error);
      setResults([]);
    } finally {
      setLoading(false);
    }
  }, []);

  return (
    <div className="space-y-6">
      {/* Search Input */}
      <div className="relative">
        <div className="relative">
          <svg
            className="absolute left-3 top-3 h-5 w-5 text-gray-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
          <input
            type="text"
            placeholder="Nhập từ cần tìm..."
            value={query}
            onChange={(e) => handleSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-lg"
          />
        </div>
        {loading && (
          <div className="absolute right-3 top-3">
            <div className="animate-spin h-5 w-5 text-blue-500">
              <svg fill="none" viewBox="0 0 24 24">
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                />
              </svg>
            </div>
          </div>
        )}
      </div>

      {/* Statistics */}
      {stats && (
        <div className="grid grid-cols-3 gap-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">
              {stats.totalWords}
            </div>
            <div className="text-sm text-gray-600">Tổng từ</div>
          </div>
          <div className="text-center">
            <div className="text-sm font-semibold text-gray-700">
              {stats.firstWord || '-'}
            </div>
            <div className="text-xs text-gray-600">Từ đầu tiên</div>
          </div>
          <div className="text-center">
            <div className="text-sm font-semibold text-gray-700">
              {stats.lastWord || '-'}
            </div>
            <div className="text-xs text-gray-600">Từ cuối cùng</div>
          </div>
        </div>
      )}

      {/* Results */}
      <div className="space-y-3">
        {results.length > 0 ? (
          <>
            <div className="text-sm text-gray-600">
              Tìm thấy <span className="font-semibold">{results.length}</span>{' '}
              kết quả
            </div>
            {results.map((word) => (
              <div
                key={word.id}
                className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <h3 className="text-lg font-bold text-blue-600">
                        {word.original}
                      </h3>
                      {word.phat_hc && (
                        <span className="text-sm text-gray-500">
                          /{word.phat_hc}/
                        </span>
                      )}
                    </div>

                    {word.ndict && (
                      <p className="mt-2 text-gray-700">
                        <span className="font-semibold">Nghĩa: </span>
                        {word.ndict}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </>
        ) : query && !loading ? (
          <div className="p-4 text-center text-gray-500">
            Không tìm thấy từ nào khớp với "{query}"
          </div>
        ) : !query ? (
          <div className="p-4 text-center text-gray-500">
            Hãy nhập từ cần tìm...
          </div>
        ) : null}
      </div>
    </div>
  );
}
