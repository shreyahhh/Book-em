import { useState, useEffect } from 'react';
import { LazyLoadImage } from 'react-lazy-load-image-component';
// import { coverCache } from '../utils/coverCache';

// Custom placeholder component instead of external URL
const PLACEHOLDER_COMPONENT = 'PLACEHOLDER';

const BookCover = ({ book, size = 'M' }) => {
  const [imgSrc, setImgSrc] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const [showPlaceholder, setShowPlaceholder] = useState(false);

  useEffect(() => {
    // Reset states when book changes
    setImgSrc(null);
    setIsLoading(true);
    setHasError(false);
    setShowPlaceholder(false);

    if (!book) {
      setIsLoading(false);
      setShowPlaceholder(true);
      return;
    }

    // Check cache first (temporarily disabled)
    // const cacheKey = coverCache.generateKey(book);
    // if (coverCache.has(cacheKey)) {
    //   const cachedUrl = coverCache.get(cacheKey);
    //   console.log(`📦 Using cached cover for: ${book.title}`);
    //   setImgSrc(cachedUrl);
    //   setIsLoading(false);
    //   return;
    // }

    // Step 1: Try by Cover ID (Primary Method - fastest)
    if (book.cover_i && book.cover_i !== -1) {
      const coverIdUrl = `https://covers.openlibrary.org/b/id/${book.cover_i}-${size}.jpg`;
      console.log(`Trying Cover ID: ${coverIdUrl}`);
      tryImageUrl(coverIdUrl, 'cover_i');
      return;
    }

    // Step 2: Try Edition Key (OLID - most reliable, what the website uses)
    if (book.cover_edition_key) {
      const olidUrl = `https://covers.openlibrary.org/b/olid/${book.cover_edition_key}-${size}.jpg`;
      console.log(`Trying Edition Key (OLID): ${olidUrl}`);
      tryImageUrl(olidUrl, 'cover_edition_key');
      return;
    }

    // Step 3: Fallback to ISBN (strong fallback for many editions)
    if (book.isbn && book.isbn.length > 0) {
      const isbnUrl = `https://covers.openlibrary.org/b/isbn/${book.isbn[0]}-${size}.jpg`;
      console.log(`Trying Primary ISBN: ${isbnUrl}`);
      tryImageUrl(isbnUrl, 'isbn_primary');
      return;
    }

    // Step 4: Try additional ISBNs if available
    if (book.isbn && book.isbn.length > 1) {
      const isbnUrl = `https://covers.openlibrary.org/b/isbn/${book.isbn[1]}-${size}.jpg`;
      console.log(`Trying Secondary ISBN: ${isbnUrl}`);
      tryImageUrl(isbnUrl, 'isbn_secondary');
      return;
    }

    // Step 5: Fallback to OCLC if available
    if (book.oclc && book.oclc.length > 0) {
      const oclcUrl = `https://covers.openlibrary.org/b/oclc/${book.oclc[0]}-${size}.jpg`;
      console.log(`Trying OCLC: ${oclcUrl}`);
      tryImageUrl(oclcUrl, 'oclc');
      return;
    }

    // Step 6: Fallback to LCCN if available
    if (book.lccn && book.lccn.length > 0) {
      const lccnUrl = `https://covers.openlibrary.org/b/lccn/${book.lccn[0]}-${size}.jpg`;
      console.log(`Trying LCCN: ${lccnUrl}`);
      tryImageUrl(lccnUrl, 'lccn');
      return;
    }

    // Step 7: No valid identifiers found, use placeholder
    console.log(`No cover identifiers found for: ${book.title}`);
    setIsLoading(false);
    setShowPlaceholder(true);
  }, [book, size]);

  const tryImageUrl = (url, method = 'unknown') => {
    const img = new Image();
    
    // Set a timeout for slow-loading images
    const timeoutId = setTimeout(() => {
      console.log(`⏰ Cover loading timeout [${method}]: ${url}`);
      handleImageError();
    }, 8000);

    img.onload = () => {
      clearTimeout(timeoutId);
      // Check if the image actually loaded content (not just a 1x1 placeholder)
      if (img.width > 1 && img.height > 1) {
        console.log(`✅ Cover loaded successfully [${method}]: ${url} (${img.width}x${img.height})`);
        
        // Cache successful URL (temporarily disabled)
        // const cacheKey = coverCache.generateKey(book);
        // coverCache.set(cacheKey, url);
        
        setImgSrc(url);
        setIsLoading(false);
        setHasError(false);
      } else {
        console.log(`📏 Cover is too small [${method}]: ${url} (${img.width}x${img.height})`);
        // Image loaded but it's likely a placeholder, try next fallback
        handleImageError();
      }
    };

    img.onerror = () => {
      clearTimeout(timeoutId);
      console.log(`❌ Cover failed to load [${method}]: ${url}`);
      handleImageError();
    };

    img.src = url;
  };

  const handleImageError = () => {
    setImgSrc(null);
    setShowPlaceholder(true);
    setIsLoading(false);
    setHasError(true);
  };

  const handleFinalError = () => {
    setShowPlaceholder(true);
    setImgSrc(null);
  };

  return (
    <div className="relative w-full h-full">
      {/* Loading skeleton */}
      {isLoading && (
        <div className="absolute inset-0 bg-gray-200 animate-pulse flex items-center justify-center z-10">
          <div className="w-5 h-5 border-2 border-gray-300 border-t-gray-600 rounded-full animate-spin"></div>
        </div>
      )}
      
      {/* Show placeholder if no cover available */}
      {showPlaceholder ? (
        <div className="w-full h-full bg-gray-100 border border-gray-200 flex flex-col items-center justify-center text-gray-500">
          <div className="w-8 h-8 rounded-full bg-gray-300 flex items-center justify-center mb-3">
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M3 5a2 2 0 012-2h10a2 2 0 012 2v8a2 2 0 01-2 2h-2.22l.123.489.804.804A1 1 0 0113 18H7a1 1 0 01-.707-1.707l.804-.804L7.22 15H5a2 2 0 01-2-2V5zm5.771 7H5V5h10v7H8.771z" clipRule="evenodd" />
            </svg>
          </div>
          <div className="text-xs font-medium text-center leading-tight">
            <div>No Cover</div>
            <div>Available</div>
          </div>
        </div>
      ) : (
        /* Lazy loaded image */
        imgSrc && (
          <LazyLoadImage
            src={imgSrc}
            alt={book ? `Cover for ${book.title}` : 'Book cover'}
            onError={handleFinalError}
            className={`w-full h-full object-cover transition-opacity duration-300 ${
              isLoading ? 'opacity-0' : 'opacity-100'
            }`}
            placeholder={
              <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                <div className="w-5 h-5 border-2 border-gray-300 border-t-gray-600 rounded-full animate-spin"></div>
              </div>
            }
            threshold={150}
          />
        )
      )}
    </div>
  );
};

export default BookCover;
