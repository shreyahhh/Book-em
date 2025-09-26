import BookCard from './BookCard';

const BookList = ({ books, isLoading, error, onBookClick, hasSearched }) => {
  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
          {[...Array(12)].map((_, index) => (
            <div key={index} className="bg-white rounded-lg border border-gray-200 p-4 animate-pulse">
              <div className="bg-gray-200 rounded aspect-[2/3] mb-3"></div>
              <div className="space-y-2">
                <div className="h-4 bg-gray-200 rounded"></div>
                <div className="h-3 bg-gray-200 rounded w-3/4"></div>
                <div className="h-3 bg-gray-200 rounded w-1/2"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-16">
        <div className="bg-white rounded-lg p-8 text-center shadow-sm max-w-md mx-auto border border-gray-200">
          <h3 className="text-xl font-semibold text-gray-900 mb-4">Something went wrong</h3>
          <p className="text-gray-600 mb-6 leading-relaxed">{error}</p>
          <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
            <p className="text-sm text-gray-700">Please try searching again with different keywords</p>
          </div>
        </div>
      </div>
    );
  }

  // Only show "No books found" if user has searched and no results were returned
  if (hasSearched && (!books || books.length === 0)) {
    return (
      <div className="container mx-auto px-4 py-16">
        <div className="bg-white rounded-lg p-8 text-center shadow-sm max-w-lg mx-auto border border-gray-200">
          <h3 className="text-xl font-semibold text-gray-900 mb-4">
            No books found
          </h3>
          <p className="text-gray-600 mb-6 leading-relaxed">
            We couldn't find any books matching your search. Try different keywords or search criteria.
          </p>
          <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
            <h4 className="font-medium text-gray-900 mb-3">Search Tips:</h4>
            <ul className="text-sm text-gray-600 space-y-1 text-left">
              <li>• Try shorter, more general terms</li>
              <li>• Check your spelling</li>
              <li>• Use author's last name only</li>
              <li>• Try searching by genre or subject</li>
            </ul>
          </div>
        </div>
      </div>
    );
  }

  // If no search has been performed yet, don't render anything (welcome screen will show instead)
  if (!hasSearched) {
    return null;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Results header */}
      <div className="mb-6">
        <h2 className="text-2xl font-semibold text-gray-900 mb-2">
          Search Results
        </h2>
        <p className="text-gray-600">
          Found {books.length} book{books.length !== 1 ? 's' : ''}
        </p>
      </div>
      
      
      {/* Books grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
        {books.map((book, index) => (
          <BookCard 
            key={book.key || index}
            book={book} 
            onBookClick={onBookClick}
          />
        ))}
      </div>
      
      {/* Footer */}
      <div className="mt-8 text-center">
        <p className="text-gray-500 text-sm">
          Showing {books.length} results • Powered by Open Library
        </p>
      </div>
    </div>
  );
};

export default BookList;
