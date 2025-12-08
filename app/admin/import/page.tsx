'use client';

import React, {useState, useEffect, useRef} from 'react';
import {useRouter} from 'next/navigation';

export default function AdminPage() {
  // File input ref
  const fileInputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  // Tab state
  const [activeTab, setActiveTab] = useState<'upload' | 'search'>('upload');

  // Upload state
  const [file, setFile] = useState<File | null>(null);
  const [replaceMode, setReplaceMode] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [stats, setStats] = useState<any>(null);

  // Search state
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const [statsData, setStatsData] = useState<any>(null);

  // Load stats on component mount and when switching tabs
  useEffect(() => {
    const loadStats = async () => {
      try {
        const response = await fetch('/api/dictionary/stats');
        const data = await response.json();
        if (data.success) {
          setStatsData(data.data);
        }
      } catch (err) {
        console.error('Failed to load stats:', err);
      }
    };
    loadStats();
  }, [activeTab]);

  // ============ UPLOAD HANDLERS ============
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
      setError('');
      setMessage('');
    }
  };

  // Drag and drop handlers
  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    e.currentTarget.classList.add('border-blue-500', 'bg-blue-50');
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    e.currentTarget.classList.remove('border-blue-500', 'bg-blue-50');
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    e.currentTarget.classList.remove('border-blue-500', 'bg-blue-50');

    const droppedFiles = e.dataTransfer.files;
    if (droppedFiles && droppedFiles.length > 0) {
      const selectedFile = droppedFiles[0];
      if (selectedFile.name.match(/\.(xlsx|xls|csv)$/i)) {
        setFile(selectedFile);
        setError('');
        setMessage('');
      } else {
        setError('Vui lòng chọn file Excel (.xlsx, .xls, .csv)');
      }
    }
  };

  const handleImport = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!file) {
      setError('Vui lòng chọn file');
      return;
    }

    setLoading(true);
    setError('');
    setMessage('');

    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('replace', replaceMode.toString());

      const res = await fetch('/api/dictionary/import', {
        method: 'POST',
        body: formData,
      });

      const data = await res.json();

      if (res.ok) {
        setMessage(data.message);
        setStats(data.stats);
        setFile(null);
        // Reload stats after import
        setTimeout(async () => {
          const response = await fetch('/api/dictionary/stats');
          const statsData = await response.json();
          if (statsData.success) {
            setStatsData(statsData.data);
          }
        }, 500);
      } else {
        setError(data.error || 'Lỗi khi import file');
      }
    } catch (err) {
      setError(
        'Lỗi khi import: ' +
          (err instanceof Error ? err.message : 'Unknown error'),
      );
    } finally {
      setLoading(false);
    }
  };

  // ============ SEARCH HANDLERS ============
  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) {
      setSearchResults([]);
      return;
    }

    setSearchLoading(true);
    try {
      const response = await fetch(
        `/api/dictionary/search?q=${encodeURIComponent(searchQuery)}&limit=20`,
      );
      const data = await response.json();

      if (data.success) {
        setSearchResults(data.results || []);
      } else {
        setSearchResults([]);
      }
    } catch (err) {
      console.error('Search error:', err);
      setSearchResults([]);
    } finally {
      setSearchLoading(false);
    }
  };

  const handleClearSearch = () => {
    setSearchQuery('');
    setSearchResults([]);
  };

  const handleLogout = async () => {
    // Call logout endpoint to clear cookie
    await fetch('/api/auth/logout');
    // Redirect to home using current origin (preserves protocol, hostname, port)
    const baseUrl = typeof window !== 'undefined' ? window.location.origin : '';
    window.location.href = baseUrl + '/';
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-100">
      <div className="container mx-auto px-4 py-12">
        {/* Header with Logout */}
        <div className="flex justify-between items-start mb-8">
          <div className="text-center flex-1">
            <h1 className="text-4xl font-bold text-gray-900 mb-2">
              📚 Quản Lý Từ Điển
            </h1>
            <p className="text-lg text-gray-600">
              {statsData
                ? `${statsData.totalWords} từ trong cơ sở dữ liệu`
                : 'Đang tải...'}
            </p>
          </div>
          <button
            onClick={handleLogout}
            className="bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded-lg transition">
            🚪 Logout
          </button>
        </div>

        <div className="max-w-4xl mx-auto">
          {/* Tab Navigation */}
          <div className="flex gap-2 mb-8 bg-white rounded-lg shadow-md p-1">
            <button
              onClick={() => setActiveTab('upload')}
              className={`flex-1 py-3 px-4 rounded-lg font-semibold transition ${
                activeTab === 'upload'
                  ? 'bg-blue-600 text-white shadow-md'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}>
              📤 Tải Lên / Cập Nhật
            </button>
            <button
              onClick={() => setActiveTab('search')}
              className={`flex-1 py-3 px-4 rounded-lg font-semibold transition ${
                activeTab === 'search'
                  ? 'bg-blue-600 text-white shadow-md'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}>
              🔍 Tìm Kiếm
            </button>
          </div>

          {/* ============ TAB 1: UPLOAD ============ */}
          {activeTab === 'upload' && (
            <div className="bg-white rounded-xl shadow-lg p-8">
              <form onSubmit={handleImport} className="space-y-6">
                {/* File Input */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    📁 Chọn file Excel
                  </label>
                  <div
                    className="relative border-2 border-dashed border-gray-300 rounded-lg p-8 hover:border-blue-500 transition cursor-pointer"
                    onClick={() => fileInputRef.current?.click()}
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDrop={handleDrop}>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept=".xlsx,.xls,.csv"
                      onChange={handleFileChange}
                      disabled={loading}
                      className="hidden"
                    />
                    <div className="text-center">
                      <div className="text-4xl mb-2">📄</div>
                      <p className="text-gray-700 font-semibold">
                        Kéo file vào đây hoặc click để chọn
                      </p>
                      <p className="text-sm text-gray-500 mt-1">
                        Hỗ trợ: .xlsx, .xls, .csv (Max 10MB)
                      </p>
                    </div>
                  </div>
                  {file && (
                    <p className="mt-3 text-sm text-green-600 font-semibold">
                      ✓ File: {file.name} (
                      {(file.size / 1024 / 1024).toFixed(2)} MB)
                    </p>
                  )}
                </div>

                {/* Mode Selection */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    ⚙️ Chế độ Import
                  </label>
                  <div className="space-y-3">
                    <div
                      className="flex items-start p-4 border-2 rounded-lg cursor-pointer hover:bg-gray-50"
                      onClick={() => setReplaceMode(false)}>
                      <input
                        type="radio"
                        name="mode"
                        checked={!replaceMode}
                        onChange={() => setReplaceMode(false)}
                        disabled={loading}
                        className="h-5 w-5 text-blue-600 mt-1"
                      />
                      <div className="ml-3">
                        <p className="font-semibold text-gray-900">
                          🔄 Cập nhật
                        </p>
                        <p className="text-sm text-gray-600">
                          Thêm từ mới, cập nhật từ đã tồn tại (an toàn)
                        </p>
                      </div>
                    </div>
                    <div
                      className="flex items-start p-4 border-2 border-red-200 rounded-lg cursor-pointer hover:bg-red-50 bg-red-50"
                      onClick={() => setReplaceMode(true)}>
                      <input
                        type="radio"
                        name="mode"
                        checked={replaceMode}
                        onChange={() => setReplaceMode(true)}
                        disabled={loading}
                        className="h-5 w-5 text-red-600 mt-1"
                      />
                      <div className="ml-3">
                        <p className="font-semibold text-red-900">
                          ⚠️ Thay thế
                        </p>
                        <p className="text-sm text-red-700">
                          Xóa tất cả dữ liệu cũ, nhập từ file (cẩn thận!)
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={!file || loading}
                  className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-bold py-3 rounded-lg transition duration-200">
                  {loading ? '⏳ Đang xử lý...' : '📤 Bắt Đầu Import'}
                </button>
              </form>

              {/* Error Message */}
              {error && (
                <div className="mt-6 bg-red-50 border border-red-200 text-red-700 px-4 py-4 rounded-lg">
                  <p className="font-semibold mb-1">❌ Lỗi</p>
                  <p className="text-sm">{error}</p>
                </div>
              )}

              {/* Success Message */}
              {message && (
                <div className="mt-6 bg-green-50 border border-green-200 text-green-700 px-4 py-4 rounded-lg">
                  <p className="font-semibold mb-3">✅ Thành công!</p>
                  <p className="text-sm mb-3">{message}</p>
                  {stats && (
                    <div className="grid grid-cols-3 gap-3">
                      <div className="bg-green-100 p-3 rounded text-center">
                        <div className="text-2xl font-bold text-green-900">
                          {stats.added}
                        </div>
                        <div className="text-xs text-green-700">Thêm mới</div>
                      </div>
                      <div className="bg-blue-100 p-3 rounded text-center">
                        <div className="text-2xl font-bold text-blue-900">
                          {stats.updated}
                        </div>
                        <div className="text-xs text-blue-700">Cập nhật</div>
                      </div>
                      <div className="bg-purple-100 p-3 rounded text-center">
                        <div className="text-2xl font-bold text-purple-900">
                          {stats.total}
                        </div>
                        <div className="text-xs text-purple-700">Tổng cộng</div>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Instructions */}
              <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-6">
                <h3 className="font-semibold text-blue-900 mb-3">
                  📋 Định dạng Excel
                </h3>
                <p className="text-sm text-blue-800 mb-3">
                  File Excel phải chứa các cột (tối thiểu cột 1):
                </p>
                <div className="bg-white rounded p-4 text-sm text-gray-700 font-mono border border-blue-200 overflow-x-auto">
                  <div className="grid grid-cols-3 gap-8">
                    <div>
                      <div className="text-blue-600 font-bold">
                        Cột B (original)
                      </div>
                      <div className="text-xs mt-1">Từ gốc</div>
                    </div>
                    <div>
                      <div className="text-blue-600 font-bold">
                        Cột C (ndict)
                      </div>
                      <div className="text-xs mt-1">Định nghĩa</div>
                    </div>
                    <div>
                      <div className="text-blue-600 font-bold">
                        Cột E (phat_hc)
                      </div>
                      <div className="text-xs mt-1">Phát âm</div>
                    </div>
                  </div>
                </div>
                <p className="text-xs text-blue-700 mt-3">
                  💡 Cột B là bắt buộc. Các cột khác tùy chọn. Toàn bộ dòng được
                  lưu trong full_data.
                </p>
              </div>
            </div>
          )}

          {/* ============ TAB 2: SEARCH ============ */}
          {activeTab === 'search' && (
            <div className="space-y-6">
              {/* Search Form */}
              <div className="bg-white rounded-xl shadow-lg p-8">
                <form onSubmit={handleSearch} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      🔍 Tìm kiếm từ
                    </label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Nhập từ muốn tìm..."
                        disabled={searchLoading}
                        className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                      <button
                        type="submit"
                        disabled={searchLoading}
                        className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-semibold px-6 py-3 rounded-lg transition">
                        {searchLoading ? '⏳' : '🔍'}
                      </button>
                      {searchQuery && (
                        <button
                          type="button"
                          onClick={handleClearSearch}
                          className="bg-gray-300 hover:bg-gray-400 text-gray-700 font-semibold px-4 py-3 rounded-lg transition">
                          ✕
                        </button>
                      )}
                    </div>
                  </div>
                </form>

                {/* Results Count */}
                {searchQuery && !searchLoading && (
                  <div className="mt-4 text-sm text-gray-600">
                    Tìm thấy{' '}
                    <span className="font-semibold text-blue-600">
                      {searchResults.length}
                    </span>{' '}
                    kết quả
                  </div>
                )}
              </div>

              {/* Search Results */}
              {searchResults.length > 0 ? (
                <div className="space-y-4">
                  {searchResults.map((result, idx) => (
                    <div
                      key={idx}
                      className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition">
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {/* Original */}
                        <div>
                          <p className="text-xs font-semibold text-gray-500 uppercase mb-1">
                            Từ Gốc
                          </p>
                          <p className="text-lg font-bold text-gray-900 break-words">
                            {result.original}
                          </p>
                        </div>

                        {/* Pronunciation */}
                        <div>
                          <p className="text-xs font-semibold text-gray-500 uppercase mb-1">
                            Phát Âm
                          </p>
                          <p className="text-sm text-gray-700">
                            {result.phat_hc || '—'}
                          </p>
                        </div>

                        {/* Definition */}
                        <div>
                          <p className="text-xs font-semibold text-gray-500 uppercase mb-1">
                            Định Nghĩa
                          </p>
                          <p className="text-sm text-gray-700 line-clamp-3">
                            {result.ndict
                              ? result.ndict.substring(0, 100) + '...'
                              : '—'}
                          </p>
                        </div>
                      </div>

                      {/* Full Data Toggle */}
                      {result.full_data && (
                        <details className="mt-4 pt-4 border-t border-gray-200">
                          <summary className="cursor-pointer text-sm font-semibold text-blue-600 hover:text-blue-700">
                            📋 Xem chi tiết
                          </summary>
                          <div className="mt-3 bg-gray-50 p-3 rounded text-xs text-gray-700 overflow-x-auto">
                            <pre>
                              {JSON.stringify(
                                JSON.parse(result.full_data),
                                null,
                                2,
                              )}
                            </pre>
                          </div>
                        </details>
                      )}
                    </div>
                  ))}
                </div>
              ) : searchQuery && !searchLoading ? (
                <div className="bg-yellow-50 border border-yellow-200 text-yellow-700 px-6 py-4 rounded-lg text-center">
                  <p className="font-semibold">⚠️ Không tìm thấy kết quả</p>
                  <p className="text-sm mt-1">
                    Thử từ khác hoặc kiểm tra cách viết
                  </p>
                </div>
              ) : !searchQuery ? (
                <div className="bg-gray-50 border border-gray-200 text-gray-600 px-6 py-12 rounded-lg text-center">
                  <p className="text-lg font-semibold">
                    🔍 Nhập từ để tìm kiếm
                  </p>
                  <p className="text-sm mt-2">
                    Hiện có {statsData?.totalWords || 0} từ trong cơ sở dữ liệu
                  </p>
                </div>
              ) : null}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="mt-12 text-center">
          <a
            href="/"
            className="inline-block bg-gray-600 hover:bg-gray-700 text-white font-semibold py-2 px-6 rounded-lg transition">
            ← Về Trang Chủ
          </a>
        </div>
      </div>
    </main>
  );
}
