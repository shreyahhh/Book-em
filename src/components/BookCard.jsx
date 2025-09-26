import BookCover from './BookCover';

const BookCard = ({ book, onBookClick }) => {
  const formatAuthors = (authors) => {
    if (!authors || authors.length === 0) return 'Unknown Author';
    return authors.slice(0, 2).join(', ') + (authors.length > 2 ? '...' : '');
  };

  const formatPublishYear = (year) => {
    if (!year || year.length === 0) return '';
    return year[0];
  };

  return (
    <div
      className="bg-white rounded-lg shadow-sm hover:shadow-md transition-all duration-300 cursor-pointer overflow-hidden group border border-gray-200 hover:border-gray-300"
      onClick={() => onBookClick && onBookClick(book)}
    >
      <div className="aspect-[2/3] overflow-hidden relative bg-gray-100">
        <div className="w-full h-full">
          <BookCover book={book} size="M" />
        </div>
      </div>
      
      <div className="p-4 space-y-2">
        <div>
          <h3 className="font-semibold text-gray-900 mb-1 line-clamp-2 leading-tight">
            {book.title || 'Untitled'}
          </h3>
          <p className="text-gray-600 text-sm line-clamp-1">
            by {formatAuthors(book.author_name)}
          </p>
        </div>
        
        <div className="flex items-center justify-between text-xs text-gray-500">
          <div className="space-y-1">
            {book.first_publish_year && (
              <div className="flex items-center">
                <span>{formatPublishYear([book.first_publish_year])}</span>
              </div>
            )}
            {book.edition_count && (
              <div className="flex items-center">
                {book.edition_count} edition{book.edition_count > 1 ? 's' : ''}
              </div>
            )}
          </div>
          
          <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-200">
            <div className="bg-gray-900 text-white px-2 py-1 rounded text-xs">
              View Details
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BookCard;
