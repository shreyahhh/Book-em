import { useState, useCallback, useRef } from 'react';
import { searchBooks, hydrateBooksBatch } from '../services/openLibrary';

const useBookSearch = () => {
  const [books, setBooks] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isHydrating, setIsHydrating] = useState(false);
  const [hydrationProgress, setHydrationProgress] = useState({ completed: 0, total: 0 });
  const [error, setError] = useState(null);
  const [hasSearched, setHasSearched] = useState(false);
  
  // Keep track of the current search to avoid stale results
  const currentSearchRef = useRef(null);

  // Stage 2: Handle individual book hydration updates
  const handleBookHydrated = useCallback((hydratedBook) => {
    setBooks(currentBooks => 
      currentBooks.map(book => 
        book.workKey === hydratedBook.workKey ? hydratedBook : book
      )
    );
    
    setHydrationProgress(prev => ({
      ...prev,
      completed: prev.completed + 1
    }));
  }, []);

  const search = useCallback(async (query, searchType = 'title') => {
    if (!query.trim()) {
      setError('Please enter a search term');
      return;
    }

    // Create a unique identifier for this search
    const searchId = Date.now();
    currentSearchRef.current = searchId;

    setIsLoading(true);
    setError(null);
    setBooks([]);
    setHasSearched(true);
    setIsHydrating(false);
    setHydrationProgress({ completed: 0, total: 0 });

    try {
      // Stage 1: Fast initial search for instant UI render
      const result = await searchBooks(query, searchType);
      
      // Only update state if this is still the current search
      if (currentSearchRef.current !== searchId) return;
      
      setBooks(result.books);
      setIsLoading(false);
      
      if (result.books.length === 0) {
        setError('No books found. Try different search terms or criteria.');
        return;
      }
      
      // Stage 2: Background hydration for better covers
      const booksNeedingHydration = result.books.filter(book => book.needsHydration);
      
      if (booksNeedingHydration.length > 0) {
        console.log(`🚀 Starting background hydration for ${booksNeedingHydration.length} books`);
        
        setIsHydrating(true);
        setHydrationProgress({ 
          completed: 0, 
          total: booksNeedingHydration.length 
        });
        
        // Start background hydration - don't await this
        hydrateBooksBatch(
          result.books, 
          handleBookHydrated,
          3 // Process 3 books concurrently
        ).then(() => {
          if (currentSearchRef.current === searchId) {
            setIsHydrating(false);
            console.log('✅ Background hydration complete');
          }
        }).catch(error => {
          if (currentSearchRef.current === searchId) {
            setIsHydrating(false);
            console.warn('⚠️ Background hydration failed:', error);
          }
        });
      }
      
    } catch (err) {
      // Only update error if this is still the current search
      if (currentSearchRef.current === searchId) {
        setError(err.message);
        setIsLoading(false);
      }
    }
  }, [handleBookHydrated]);

  const clearSearch = useCallback(() => {
    setBooks([]);
    setError(null);
    setIsLoading(false);
    setIsHydrating(false);
    setHydrationProgress({ completed: 0, total: 0 });
    setHasSearched(false);
    currentSearchRef.current = null;
  }, []);

  return {
    books,
    isLoading,
    isHydrating,
    hydrationProgress,
    error,
    hasSearched,
    search,
    clearSearch
  };
};

export default useBookSearch;
