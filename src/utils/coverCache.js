// Simple in-memory cache for successful cover URLs
class CoverCache {
  constructor() {
    this.cache = new Map();
    this.maxSize = 500; // Limit cache size
  }

  set(key, url) {
    // If cache is full, remove oldest entry
    if (this.cache.size >= this.maxSize) {
      const firstKey = this.cache.keys().next().value;
      this.cache.delete(firstKey);
    }
    this.cache.set(key, url);
  }

  get(key) {
    return this.cache.get(key);
  }

  has(key) {
    return this.cache.has(key);
  }

  clear() {
    this.cache.clear();
  }

  // Generate a cache key from book identifiers
  generateKey(book) {
    const identifiers = [
      book.cover_i,
      book.cover_edition_key,
      book.isbn?.[0],
      book.oclc?.[0],
      book.lccn?.[0]
    ].filter(Boolean);
    
    return identifiers.join('|') || book.key || book.title;
  }
}

export const coverCache = new CoverCache();
