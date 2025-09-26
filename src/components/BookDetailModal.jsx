import { useEffect } from 'react';
import BookCover from './BookCover';

const BookDetailModal = ({ book, onClose }) => {
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    document.addEventListener('keydown', handleEscape);
    document.body.style.overflow = 'hidden';

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [onClose]);

  if (!book) return null;



  const formatAuthors = (authors) => {
    if (!authors || authors.length === 0) return 'Unknown Author';
    return authors.join(', ');
  };

  const formatSubjects = (subjects) => {
    if (!subjects || subjects.length === 0) return 'No subjects available';
    return subjects.slice(0, 10).join(', ');
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-4xl max-h-[90vh] overflow-hidden relative shadow-lg border border-gray-200 w-full">
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 z-20 bg-white rounded-full w-8 h-8 flex items-center justify-center shadow-sm border border-gray-200 hover:border-gray-300 transition-colors"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
        
        <div className="overflow-y-auto max-h-[90vh]">
          <div className="flex flex-col lg:flex-row">
            {/* Cover Section */}
            <div className="lg:w-1/3 p-6 bg-gray-50 border-r border-gray-200">
              <div className="w-full max-w-sm mx-auto rounded-lg shadow-sm overflow-hidden aspect-[2/3] border border-gray-200">
                <BookCover book={book} size="L" />
              </div>
              
              {/* Quick stats */}
              <div className="mt-4 space-y-2">
                {book.edition_count && (
                  <div className="bg-white rounded-lg p-3 text-center border border-gray-200">
                    <div className="text-xl font-semibold text-gray-900">{book.edition_count}</div>
                    <div className="text-xs text-gray-500">Edition{book.edition_count > 1 ? 's' : ''}</div>
                  </div>
                )}
                {book.first_publish_year && (
                  <div className="bg-white rounded-lg p-3 text-center border border-gray-200">
                    <div className="text-xl font-semibold text-gray-900">{book.first_publish_year}</div>
                    <div className="text-xs text-gray-500">First Published</div>
                  </div>
                )}
              </div>
            </div>
            
            {/* Details Section */}
            <div className="lg:w-2/3 p-6">
              <div className="mb-6">
                <h2 className="text-3xl font-bold mb-2 pr-12 leading-tight text-gray-900">
                  {book.title}
                </h2>
                <p className="text-lg text-gray-600">
                  by {formatAuthors(book.author_name)}
                </p>
              </div>
            
              <div className="space-y-4">
                {/* Book description/first sentence */}
                {book.first_sentence && (
                  <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                    <h3 className="text-sm font-semibold text-gray-900 mb-2">
                      First Sentence
                    </h3>
                    <p className="text-gray-700 italic leading-relaxed">
                      "{book.first_sentence[0]}"
                    </p>
                  </div>
                )}
                
                {/* Book details grid */}
                <div className="grid md:grid-cols-2 gap-4">
                  {book.language && (
                    <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                      <h4 className="text-sm font-semibold text-gray-900 mb-2">
                        Languages
                      </h4>
                      <div className="flex flex-wrap gap-1">
                        {book.language.slice(0, 5).map((lang, index) => (
                          <span key={index} className="bg-gray-200 text-gray-800 px-2 py-1 rounded text-xs">
                            {lang}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  {book.isbn && book.isbn.length > 0 && (
                    <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                      <h4 className="text-sm font-semibold text-gray-900 mb-2">
                        ISBN
                      </h4>
                      <p className="font-mono text-sm text-gray-700 bg-white px-2 py-1 rounded border border-gray-200">
                        {book.isbn[0]}
                      </p>
                    </div>
                  )}
                  
                  {book.publisher && book.publisher.length > 0 && (
                    <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                      <h4 className="text-sm font-semibold text-gray-900 mb-2">
                        Publishers
                      </h4>
                      <div className="space-y-1">
                        {book.publisher.slice(0, 3).map((pub, index) => (
                          <div key={index} className="text-gray-700 text-sm">{pub}</div>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  {book.number_of_pages && (
                    <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                      <h4 className="text-sm font-semibold text-gray-900 mb-2">
                        Pages
                      </h4>
                      <p className="text-xl font-bold text-gray-900">{book.number_of_pages}</p>
                    </div>
                  )}
                </div>
                
                {/* Subjects/Tags */}
                {book.subject && book.subject.length > 0 && (
                  <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                    <h3 className="text-sm font-semibold text-gray-900 mb-2">
                      Subjects & Topics
                    </h3>
                    <div className="flex flex-wrap gap-1">
                      {book.subject.slice(0, 12).map((subject, index) => (
                        <span key={index} className="bg-gray-200 text-gray-800 px-2 py-1 rounded text-xs">
                          {subject}
                        </span>
                      ))}
                      {book.subject.length > 12 && (
                        <span className="text-gray-500 text-xs px-2 py-1">
                          +{book.subject.length - 12} more
                        </span>
                      )}
                    </div>
                  </div>
                )}
                
                {/* Enhanced book info */}
                {book.description && (
                  <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                    <h3 className="text-sm font-semibold text-gray-900 mb-2">
                      Description
                    </h3>
                    <p className="text-gray-700 text-sm leading-relaxed">
                      {typeof book.description === 'string' ? book.description : book.description?.value}
                    </p>
                  </div>
                )}
              </div>
              
              {/* Action buttons */}
              <div className="mt-6 pt-4 border-t border-gray-200 flex flex-wrap gap-3">
                <a
                  href={`https://openlibrary.org${book.key}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center px-4 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors font-medium text-sm"
                >
                  View on Open Library
                  <svg className="ml-2 w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                  </svg>
                </a>
                
                {book.isbn && book.isbn[0] && (
                  <a
                    href={`https://www.google.com/search?q=isbn%20${book.isbn[0]}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center px-4 py-2 bg-gray-100 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors font-medium text-sm"
                  >
                    Find Online
                  </a>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BookDetailModal;
