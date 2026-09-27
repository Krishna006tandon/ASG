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
