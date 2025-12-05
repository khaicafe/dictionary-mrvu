import DictionarySearch from '@/app/components/DictionarySearch';

export default function Home() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-3">
            📚 བོད་ཀྱི་ཚིག་དཔེ་
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Tibetan-Vietnamese Dictionary | Wylie Input → Uchen Display
          </p>
          <p className="text-sm text-gray-500 mt-2">
            ཉིན་རེའི་ལ་སྲིད་བོད་ཀྱི་ཚིག་སྟེགས་བརྒྱ་ཕྲག་ལ་བལྟ་རོགས་། | Tra cứu
            hơn 53,000 từ Tạng chính thức
          </p>
        </div>

        {/* Main Search Container */}
        <div className="max-w-6xl mx-auto bg-white rounded-xl shadow-2xl p-6 md:p-8">
          <DictionarySearch />
        </div>

        {/* Features Info */}
        <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
          <div className="bg-white rounded-lg shadow p-6 text-center">
            <div className="text-3xl mb-2">🔤</div>
            <h3 className="font-bold text-gray-900 mb-2">Wylie Input</h3>
            <p className="text-sm text-gray-600">
              Type in Romanized Tibetan (Wylie) and see Uchen script
              automatically
            </p>
          </div>
          <div className="bg-white rounded-lg shadow p-6 text-center">
            <div className="text-3xl mb-2">🔀</div>
            <h3 className="font-bold text-gray-900 mb-2">Bilingual Mode</h3>
            <p className="text-sm text-gray-600">
              Switch between བོད། and Tiếng Việt interface with one click
            </p>
          </div>
          <div className="bg-white rounded-lg shadow p-6 text-center">
            <div className="text-3xl mb-2">📖</div>
            <h3 className="font-bold text-gray-900 mb-2">Multiple Sources</h3>
            <p className="text-sm text-gray-600">
              Ndict, Tdict (translation), Drepung - comprehensive definitions
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-16 text-center text-gray-600">
          <p className="text-sm">
            💡 Admin Panel:{' '}
            <a href="/admin/import" className="text-blue-600 hover:underline">
              Manage Dictionaries
            </a>
          </p>
          <p className="text-xs mt-2 text-gray-500">
            Powered by Next.js 16 + React 19 + SQLite + Wylie Converter
          </p>
        </div>
      </div>
    </main>
  );
}
