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
        
                {/* Background hydration progress indicator */}
        {isHydrating && hydrationProgress.total > 0 && (
          <div className="container mx-auto px-4 py-2">
            <div className="bg-gray-100 border border-gray-200 rounded-lg p-3">
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center space-x-3 text-gray-700">
                  <div className="w-3 h-3 border-2 border-gray-300 border-t-gray-900 rounded-full animate-spin"></div>
                  <span>Loading covers</span>
                </div>
                <span className="text-gray-600 font-medium">
                  {hydrationProgress.completed}/{hydrationProgress.total}
                </span>
              </div>
              <div className="mt-2 w-full bg-gray-200 rounded-full h-1">
                <div 
                  className="bg-gray-900 h-1 rounded-full transition-all duration-300 ease-out"
                  style={{ 
                    width: `${(hydrationProgress.completed / hydrationProgress.total) * 100}%` 
                  }}
                ></div>
              </div>
            </div>
          </div>
        )}
        
        {/* Welcome screen for first-time visitors */}
        {!hasSearched && !isLoading && (
          <div className="container mx-auto px-4 py-20">
            <div className="text-center max-w-4xl mx-auto">
              <h1 className="text-6xl font-bold text-gray-900 mb-6 tracking-tight">
                Book'em
              </h1>
              <p className="text-xl text-gray-600 mb-12 leading-relaxed">
                Discover millions of books from the world's largest open library. 
                Search by title, author, subject, or ISBN to find your next great read.
              </p>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-left">
                <div className="bg-white p-8 rounded-xl border border-gray-200 hover:border-gray-300 transition-colors">
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">Smart Search</h3>
                  <p className="text-gray-600 leading-relaxed">
                    Advanced search functionality with multiple filters and intelligent auto-complete to help you find exactly what you're looking for.
                  </p>
                </div>
                <div className="bg-white p-8 rounded-xl border border-gray-200 hover:border-gray-300 transition-colors">
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">Comprehensive Details</h3>
                  <p className="text-gray-600 leading-relaxed">
                    Access detailed information about each book including covers, publication data, descriptions, and multiple editions.
                  </p>
                </div>
                <div className="bg-white p-8 rounded-xl border border-gray-200 hover:border-gray-300 transition-colors">
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">Open Library</h3>
                  <p className="text-gray-600 leading-relaxed">
                    Powered by Open Library's extensive database containing millions of books from libraries worldwide.
                  </p>
                </div>
              </div>
              
              <div className="mt-16 bg-gray-100 rounded-xl p-6 max-w-2xl mx-auto border border-gray-200">
                <p className="text-gray-700 font-medium">
                  Start by typing a book title, author name, or any keyword in the search box above
                </p>
              </div>
            </div>
          </div>
        )}

        <BookList 
          books={books}
          isLoading={isLoading}
          error={error}
          onBookClick={handleBookClick}
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
