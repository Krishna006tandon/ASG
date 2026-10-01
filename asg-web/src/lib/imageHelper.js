/**
 * Utility helper to resolve image URLs for books and media.
 * For assets hosted on a private Vercel Blob store, routes them via our
 * secure /api/image-proxy serverless route.
 */
export function getBookCoverUrl(url) {
  if (!url || typeof url !== 'string') return '';

  // Local object URLs (used during file selection preview), data URLs, and already-proxied URLs
  if (url.startsWith('blob:') || url.startsWith('data:') || url.startsWith('/api/image-proxy')) {
    return url;
  }

  // Vercel Blob URLs (private store) -> route through proxy
  if (url.includes('blob.vercel-storage.com') || url.includes('vercel.com/api/blob')) {
    return `/api/image-proxy?url=${encodeURIComponent(url)}`;
  }

  return url;
}

export const getImageUrl = getBookCoverUrl;

/**
 * Utility helper to resolve e-book PDF URLs for reading and downloading.
 * For assets hosted on a private Vercel Blob store, routes them via our
 * secure /api/books/read serverless route.
 */
export function getEbookUrl(url, download = false, bookId = null) {
  const downloadParam = download ? '&download=true' : '';

  if (url && typeof url === 'string') {
    // Local object URLs, data URLs, and already-proxied URLs
    if (url.startsWith('blob:') || url.startsWith('data:') || url.startsWith('/api/books/read')) {
      return url;
    }

    // Vercel Blob URLs (private store) -> route through secure reading endpoint
    if (url.includes('blob.vercel-storage.com') || url.includes('vercel.com/api/blob')) {
      return `/api/books/read?url=${encodeURIComponent(url)}${downloadParam}`;
    }

    return url;
  }

  // Fallback to bookId if direct URL was not provided
  if (bookId) {
    const id = typeof bookId === 'object' ? (bookId._id || bookId).toString() : bookId.toString();
    return `/api/books/read?bookId=${encodeURIComponent(id)}${downloadParam}`;
  }

  return '';
}
