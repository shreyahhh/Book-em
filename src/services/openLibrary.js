// Use appropriate proxy based on environment
const BASE_URL = import.meta.env.DEV 
  ? '/api/search.json'  // Development - uses Vite proxy
  : '/api/search';  // Production - uses Vercel serverless function

const searchBooks = async (query, searchType = 'title', limit = 20) => {
  try {
    // Stage 1: Initial fast search for instant UI render
    let url = `${BASE_URL}?limit=${limit}&fields=key,title,author_name,cover_i,cover_edition_key,edition_count,first_publish_year,isbn,lccn,oclc,goodreads,librarything,publisher,subject,language,first_sentence,number_of_pages_median`;
    
    switch (searchType) {
      case 'title':
        url += `&title=${encodeURIComponent(query)}`;
        break;
      case 'author':
        url += `&author=${encodeURIComponent(query)}`;
        break;
      case 'subject':
        url += `&subject=${encodeURIComponent(query)}`;
        break;
      case 'isbn':
        url += `&isbn=${encodeURIComponent(query)}`;
        break;
      case 'publisher':
        url += `&publisher=${encodeURIComponent(query)}`;
        break;
      default:
        url += `&q=${encodeURIComponent(query)}`;
    }

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000);

    const fetchOptions = {
      signal: controller.signal,
      headers: {
        'Accept': 'application/json',
      }
    };

    // Only add User-Agent in development (some production environments restrict this)
    if (import.meta.env.DEV) {
      fetchOptions.headers['User-Agent'] = 'BookFinder/1.0';
    }

    const response = await fetch(url, fetchOptions);

    clearTimeout(timeoutId);
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    
    // Enhanced filtering and sorting for better results
    const filteredBooks = data.docs
      .filter(book => {
        return book.title && 
               book.title.trim().length > 0 &&
               (book.author_name || book.isbn || book.oclc);
      })
      .map(book => ({
        ...book,
        // Ensure consistent data structure
        title: book.title.trim(),
        author_name: book.author_name || ['Unknown Author'],
        cover_i: book.cover_i && book.cover_i !== -1 ? book.cover_i : null,
        isbn: book.isbn || [],
        oclc: book.oclc || [],
        lccn: book.lccn || [],
        edition_count: book.edition_count || 1,
        first_publish_year: book.first_publish_year || null,
        // Stage 2 preparation: Track hydration needs
        needsHydration: !(book.cover_i && book.cover_i !== -1) && !book.cover_edition_key,
        isHydrated: false,
        workKey: book.key ? book.key.replace('/works/', '') : null,
        hasCoverIdentifier: !!(
          (book.cover_i && book.cover_i !== -1) || 
          book.cover_edition_key ||
          (book.isbn && book.isbn.length > 0) ||
          (book.oclc && book.oclc.length > 0) ||
          (book.lccn && book.lccn.length > 0)
        )
      }))
      .sort((a, b) => {
        // Prioritize books with existing covers for instant display
        if (!a.needsHydration && b.needsHydration) return -1;
        if (a.needsHydration && !b.needsHydration) return 1;
        
        if (a.cover_i && !b.cover_i) return -1;
        if (!a.cover_i && b.cover_i) return 1;
        
        if (b.edition_count !== a.edition_count) {
          return (b.edition_count || 0) - (a.edition_count || 0);
        }
        
        return (b.first_publish_year || 0) - (a.first_publish_year || 0);
      })
      .slice(0, limit);
    
    return {
      books: filteredBooks,
      totalFound: data.numFound,
      start: data.start
    };
  } catch (error) {
    console.error('Error fetching books:', error);
    
    if (error.name === 'AbortError') {
      throw new Error('Request timed out. Please try again.');
    }
    
    throw new Error('Failed to fetch books. Please check your internet connection and try again.');
  }
};

const getBookDetails = async (bookKey) => {
  try {
    const response = await fetch(`/api${bookKey}.json`);
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching book details:', error);
    throw new Error('Failed to fetch book details.');
  }
};

// Stage 2: Background hydration with Works/Editions API
const hydrateBookWithEditions = async (book) => {
  if (!book.workKey || book.isHydrated) {
    return book;
  }

  try {
    // Fetch the work details to get editions
    const workUrl = `https://openlibrary.org/works/${book.workKey}.json`;
    const workResponse = await fetch(workUrl, {
      headers: {
        'Accept': 'application/json',
      }
    });
    
    if (!workResponse.ok) {
      console.warn(`Failed to fetch work details for ${book.workKey}`);
      return { ...book, isHydrated: true, hydrationFailed: true };
    }
    
    const workData = await workResponse.json();
    
    // Fetch editions for this work
    const editionsUrl = `https://openlibrary.org/works/${book.workKey}/editions.json?limit=50`;
    const editionsResponse = await fetch(editionsUrl, {
      headers: {
        'Accept': 'application/json',
      }
    });
    
    if (!editionsResponse.ok) {
      console.warn(`Failed to fetch editions for work ${book.workKey}`);
      return { ...book, isHydrated: true, hydrationFailed: true };
    }
    
    const editionsData = await editionsResponse.json();
    
    // Find the best edition with cover
    const bestEdition = findBestEditionWithCover(editionsData.entries);
    
    if (bestEdition) {
      const hydratedBook = {
        ...book,
        // Update with better cover information
        cover_i: bestEdition.cover_i || book.cover_i,
        cover_edition_key: bestEdition.key ? bestEdition.key.replace('/books/', '') : book.cover_edition_key,
        isbn: bestEdition.isbn_13 || bestEdition.isbn_10 || book.isbn,
        oclc: bestEdition.oclc_numbers || book.oclc,
        lccn: bestEdition.lccn || book.lccn,
        // Enhanced metadata from edition
        publisher: bestEdition.publishers || book.publisher,
        publish_date: bestEdition.publish_date || book.publish_date,
        number_of_pages: bestEdition.number_of_pages || book.number_of_pages_median,
        physical_format: bestEdition.physical_format,
        description: workData.description?.value || workData.description,
        subjects: workData.subjects,
        // Hydration status
        isHydrated: true,
        hydrationSuccess: true,
        needsHydration: false,
        originalCoverMethod: book.cover_i ? 'search_api' : 'none',
        hydratedCoverMethod: bestEdition.cover_i ? 'editions_api' : 'none'
      };
      
      console.log(`✅ Hydrated "${book.title}" - Cover improved:`, {
        before: book.cover_i ? 'Had cover' : 'No cover',
        after: bestEdition.cover_i ? 'Enhanced cover' : 'Still no cover',
        editionKey: bestEdition.key,
        coverId: bestEdition.cover_i
      });
      
      return hydratedBook;
    }
    
    // No better edition found, mark as hydrated anyway
    return {
      ...book,
      isHydrated: true,
      hydrationSuccess: false,
      needsHydration: false
    };
    
  } catch (error) {
    console.error(`Hydration failed for "${book.title}":`, error);
    return {
      ...book,
      isHydrated: true,
      hydrationFailed: true,
      needsHydration: false
    };
  }
};

const findBestEditionWithCover = (editions) => {
  if (!editions || editions.length === 0) return null;
  
  // Score editions based on cover availability and metadata quality
  const scoredEditions = editions
    .filter(edition => edition && edition.key)
    .map(edition => {
      let score = 0;
      
      // Primary: Has cover
      if (edition.covers && edition.covers.length > 0 && edition.covers[0] !== -1) {
        score += 100;
        edition.cover_i = edition.covers[0];
      }
      
      // Secondary: Has ISBN (better for fallback cover lookup)
      if (edition.isbn_13 && edition.isbn_13.length > 0) score += 50;
      if (edition.isbn_10 && edition.isbn_10.length > 0) score += 30;
      
      // Tertiary: Has other identifiers
      if (edition.oclc_numbers && edition.oclc_numbers.length > 0) score += 20;
      if (edition.lccn && edition.lccn.length > 0) score += 15;
      
      // Quality indicators
      if (edition.number_of_pages) score += 10;
      if (edition.publishers && edition.publishers.length > 0) score += 5;
      if (edition.publish_date) score += 5;
      
      // Prefer more recent editions (rough heuristic)
      if (edition.publish_date) {
        const year = parseInt(edition.publish_date.match(/\d{4}/)?.[0]);
        if (year && year > 1990) score += Math.min(year - 1990, 30);
      }
      
      return { ...edition, _score: score };
    })
    .sort((a, b) => b._score - a._score);
  
  return scoredEditions[0] || null;
};

// Batch hydration with concurrency control
const hydrateBooksBatch = async (books, onBookHydrated, concurrency = 3) => {
  const booksToHydrate = books.filter(book => book.needsHydration && !book.isHydrated);
  
  if (booksToHydrate.length === 0) {
    console.log('📚 No books need hydration');
    return books;
  }
  
  console.log(`🔄 Starting batch hydration for ${booksToHydrate.length} books (concurrency: ${concurrency})`);
  
  const results = [];
  
  // Process books in concurrent batches
  for (let i = 0; i < booksToHydrate.length; i += concurrency) {
    const batch = booksToHydrate.slice(i, i + concurrency);
    const batchPromises = batch.map(async (book) => {
      const hydratedBook = await hydrateBookWithEditions(book);
      
      // Notify callback immediately when each book is hydrated
      if (onBookHydrated && typeof onBookHydrated === 'function') {
        onBookHydrated(hydratedBook);
      }
      
      return hydratedBook;
    });
    
    const batchResults = await Promise.allSettled(batchPromises);
    results.push(...batchResults.map(result => 
      result.status === 'fulfilled' ? result.value : result.reason
    ));
    
    // Small delay between batches to be API-friendly
    if (i + concurrency < booksToHydrate.length) {
      await new Promise(resolve => setTimeout(resolve, 100));
    }
  }
  
  console.log(`✅ Hydration complete: ${results.filter(r => r.hydrationSuccess).length}/${booksToHydrate.length} successful`);
  
  return books.map(book => {
    const hydratedVersion = results.find(h => h.workKey === book.workKey);
    return hydratedVersion || book;
  });
};

export { searchBooks, hydrateBookWithEditions, hydrateBooksBatch };
