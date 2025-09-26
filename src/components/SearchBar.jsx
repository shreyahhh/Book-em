import { useState, useEffect, useRef } from 'react';
import useDebounce from '../hooks/useDebounce';

const SearchBar = ({ onSearch }) => {
  const [query, setQuery] = useState('');
  const [searchType, setSearchType] = useState('title');
  const debouncedQuery = useDebounce(query, 500);
  const onSearchRef = useRef(onSearch);
  
  // Update the ref when onSearch changes
  useEffect(() => {
    onSearchRef.current = onSearch;
  }, [onSearch]);

  const searchOptions = [
    { value: 'title', label: 'Title' },
    { value: 'author', label: 'Author' },
    { value: 'subject', label: 'Subject' },
    { value: 'isbn', label: 'ISBN' },
    { value: 'publisher', label: 'Publisher' },
  ];

  // Auto-search when debounced query changes
  useEffect(() => {
    if (debouncedQuery.trim().length >= 2) {
      onSearchRef.current(debouncedQuery.trim(), searchType);
    }
  }, [debouncedQuery, searchType]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (query.trim()) {
      onSearchRef.current(query.trim(), searchType);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
        <form onSubmit={handleSubmit} className="flex flex-col lg:flex-row gap-4 items-end">
          <div className="flex-1 space-y-2">
            <label className="text-sm font-medium text-gray-700 block">
              Search Books
            </label>
            <div className="relative">
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Enter book title, author, or any keyword..."
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-gray-500 outline-none transition-all duration-200 placeholder-gray-500 bg-white"
              />
              <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
            </div>
          </div>
          
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700 block">
              Search by
            </label>
            <select
              value={searchType}
              onChange={(e) => setSearchType(e.target.value)}
              className="px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-gray-500 outline-none transition-all duration-200 bg-white min-w-[140px]"
            >
              {searchOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
          
          <button
            type="submit"
            className="px-6 py-3 bg-gray-900 text-white rounded-lg hover:bg-gray-800 focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition-all duration-200 font-medium flex items-center space-x-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <span>Search</span>
          </button>
        </form>
        
        {/* Search tips */}
        {query.length === 0 && (
          <div className="mt-4 flex flex-wrap gap-2 justify-center">
            <span className="text-sm text-gray-500">Try searching for:</span>
            {['Ruskin Bond', 'Stephen King', 'Science Fiction', '1984'].map((suggestion) => (
              <button
                key={suggestion}
                onClick={() => setQuery(suggestion)}
                className="px-3 py-1 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-full text-sm transition-colors duration-200"
              >
                {suggestion}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default SearchBar;
