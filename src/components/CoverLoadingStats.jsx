import { useState, useEffect } from 'react';

const CoverLoadingStats = ({ books }) => {
  const [stats, setStats] = useState({
    total: 0,
    withCoverI: 0,
    withEditionKey: 0,
    withISBN: 0,
    withOCLC: 0,
    withLCCN: 0,
    withAnyIdentifier: 0
  });

  useEffect(() => {
    if (!books || books.length === 0) {
      setStats({
        total: 0,
        withCoverI: 0,
        withEditionKey: 0,
        withISBN: 0,
        withOCLC: 0,
        withLCCN: 0,
        withAnyIdentifier: 0
      });
      return;
    }

    const total = books.length;
    const withCoverI = books.filter(book => book.cover_i && book.cover_i !== -1).length;
    const withEditionKey = books.filter(book => book.cover_edition_key).length;
    const withISBN = books.filter(book => book.isbn && book.isbn.length > 0).length;
    const withOCLC = books.filter(book => book.oclc && book.oclc.length > 0).length;
    const withLCCN = books.filter(book => book.lccn && book.lccn.length > 0).length;
    const withAnyIdentifier = books.filter(book => 
      (book.cover_i && book.cover_i !== -1) ||
      book.cover_edition_key ||
      (book.isbn && book.isbn.length > 0) ||
      (book.oclc && book.oclc.length > 0) ||
      (book.lccn && book.lccn.length > 0)
    ).length;

    setStats({
      total,
      withCoverI,
      withEditionKey,
      withISBN,
      withOCLC,
      withLCCN,
      withAnyIdentifier
    });
  }, [books]);

  // Only show in development
  if (process.env.NODE_ENV === 'production') {
    return null;
  }

  if (stats.total === 0) {
    return null;
  }

  return (
    <div className="glass rounded-2xl p-6 mb-8 shadow-xl border border-white/20">
      <div className="flex items-center justify-between mb-4">
        <h4 className="text-lg font-bold text-gray-800 flex items-center">
          <span className="mr-2">📊</span>
          Cover Analytics
          <span className="ml-2 text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full">DEV</span>
        </h4>
        <div className="text-2xl floating">📈</div>
      </div>
      
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl p-4 border border-blue-100">
          <div className="text-2xl font-bold gradient-text">{stats.total}</div>
          <div className="text-xs text-gray-600 font-medium">Total Books</div>
        </div>
        
        <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl p-4 border border-green-100">
          <div className="text-2xl font-bold text-green-700">{stats.withCoverI}</div>
          <div className="text-xs text-gray-600 font-medium">
            Cover ID ({Math.round((stats.withCoverI / stats.total) * 100)}%)
          </div>
        </div>
        
        <div className="bg-gradient-to-r from-orange-50 to-red-50 rounded-xl p-4 border border-orange-100">
          <div className="text-2xl font-bold text-orange-700">{stats.withISBN}</div>
          <div className="text-xs text-gray-600 font-medium">
            ISBN ({Math.round((stats.withISBN / stats.total) * 100)}%)
          </div>
        </div>
        
        <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl p-4 border border-purple-100">
          <div className="text-2xl font-bold text-purple-700">{stats.withAnyIdentifier}</div>
          <div className="text-xs text-gray-600 font-medium">
            Any ID ({Math.round((stats.withAnyIdentifier / stats.total) * 100)}%)
          </div>
        </div>
      </div>
      
      <div className="mt-4 grid grid-cols-3 gap-3 text-xs">
        <div className="text-center p-2 bg-white/50 rounded-lg">
          <span className="font-medium text-gray-700">Edition Key:</span>
          <div className="font-bold text-blue-600">{stats.withEditionKey}</div>
        </div>
        <div className="text-center p-2 bg-white/50 rounded-lg">
          <span className="font-medium text-gray-700">OCLC:</span>
          <div className="font-bold text-indigo-600">{stats.withOCLC}</div>
        </div>
        <div className="text-center p-2 bg-white/50 rounded-lg">
          <span className="font-medium text-gray-700">LCCN:</span>
          <div className="font-bold text-pink-600">{stats.withLCCN}</div>
        </div>
      </div>
    </div>
  );
};

export default CoverLoadingStats;
