import { useState, useCallback } from 'react';
import Header from './components/Header';
import SearchBar from './components/SearchBar';
import BookList from './components/BookList';
import BookDetailModal from './components/BookDetailModal';
import useBookSearch from './hooks/useBookSearch';
import './App.css';

function App() {
  const { books, isLoading, isHydrating, hydrationProgress, error, search, hasSearched } = useBookSearch();
  const [selectedBook, setSelectedBook] = useState(null);

  const handleSearch = useCallback((query, searchType) => {
    search(query, searchType);
  }, [search]);

  const handleBookClick = useCallback((book) => {
    setSelectedBook(book);
  }, []);

  const handleCloseModal = useCallback(() => {
    setSelectedBook(null);
  }, []);

  return (
    <div className="min-h-screen bg-gray-50">{/* Removed animated background elements for clean design */}

      <Header />
      
      <main className="pb-8">
        <SearchBar onSearch={handleSearch} />
        
        {/* Search status indicator */}
        {isLoading && (
          <div className="container mx-auto px-4 py-4">
            <div className="flex items-center justify-center space-x-3 text-gray-700">
              <div className="w-5 h-5 border-2 border-gray-300 border-t-gray-900 rounded-full animate-spin"></div>
              <span className="text-sm font-medium">Searching books...</span>
            </div>
          </div>
        )}
        
        {/* Welcome screen for first-time visitors */}
        {!hasSearched && !isLoading && (
          <div className="container mx-auto px-4 py-8">
            <div className="text-center max-w-4xl mx-auto">
              <h1 className="text-4xl font-bold text-gray-900 mb-4 tracking-tight">
                Book'em
              </h1>
              <p className="text-xl text-gray-600 mb-8 leading-relaxed">
                Discover millions of books from the world's largest open library. 
                Search by title, author, subject, publisher or ISBN to find your next great read.
              </p>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-left">
                <div className="bg-white p-6 rounded-xl border border-gray-200 hover:border-gray-300 transition-colors">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Smart Search</h3>
                  <p className="text-gray-600 leading-relaxed">
                    Advanced search functionality with multiple filters and intelligent auto-complete to help you find exactly what you're looking for.
                  </p>
                </div>
                <div className="bg-white p-6 rounded-xl border border-gray-200 hover:border-gray-300 transition-colors">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Comprehensive Details</h3>
                  <p className="text-gray-600 leading-relaxed">
                    Access detailed information about each book including covers, publication data, descriptions, and multiple editions.
                  </p>
                </div>
                <div className="bg-white p-6 rounded-xl border border-gray-200 hover:border-gray-300 transition-colors">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Open Library</h3>
                  <p className="text-gray-600 leading-relaxed">
                    Powered by Open Library's extensive database containing millions of books from libraries worldwide.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        <BookList 
          books={books}
          isLoading={isLoading}
          error={error}
          onBookClick={handleBookClick}
          hasSearched={hasSearched}
        />
      </main>

      {selectedBook && (
        <BookDetailModal 
          book={selectedBook} 
          onClose={handleCloseModal} 
        />
      )}
    </div>
  );
}

export default App;
