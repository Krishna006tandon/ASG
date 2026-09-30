"use client";

import { useEffect, useState } from 'react';
import styles from './ecommerce.module.css';
import { useCart } from '@/context/CartContext';
import { getBookCoverUrl } from '@/lib/imageHelper';
import StarRating from '@/components/StarRating';
import ReviewModal from '@/components/ReviewModal';
import ReviewsListModal from '@/components/ReviewsListModal';

export default function EcommerceStore() {
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const { addToCart, cart, updateQuantity } = useCart();

  // Reviews State
  const [reviewsData, setReviewsData] = useState({});
  const [selectedBookForReviews, setSelectedBookForReviews] = useState(null);
  const [reviewsModalOpen, setReviewsModalOpen] = useState(false);
  const [reviewModalOpen, setReviewModalOpen] = useState(false);
  const [verifiedBookIds, setVerifiedBookIds] = useState([]);

  const fetchBooks = async () => {
    try {
      const res = await fetch('/api/admin/books');
      const data = await res.json();
      setBooks(data);
    } catch (error) {
      console.error("Failed to load books", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchReviews = async () => {
    try {
      const res = await fetch('/api/reviews?itemType=book');
      if (res.ok) {
        const data = await res.json();
        const map = {};
        (data.reviews || []).forEach(r => {
          const bId = r.itemId?.toString();
          if (!bId) return;
          if (!map[bId]) map[bId] = { total: 0, sum: 0 };
          map[bId].total += 1;
          map[bId].sum += r.rating;
        });
        setReviewsData(map);
      }
    } catch (e) {
      console.error("Failed to load reviews summary", e);
    }
  };

  const checkUserVerification = async () => {
    const token = localStorage.getItem('asg_token');
    if (!token) return;
    try {
      const res = await fetch('/api/user/reviews', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setVerifiedBookIds(data.verifiedItems?.books || []);
      }
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    fetchBooks();
    fetchReviews();
    checkUserVerification();
  }, []);

  const getCartCount = (bookId) => {
    const item = cart.find(c => c._id === bookId);
    return item ? item.quantity : 0;
  };

  const handleOpenReviewsList = (book) => {
    setSelectedBookForReviews(book);
    setReviewsModalOpen(true);
  };

  const handleOpenWriteReview = (book) => {
    const token = localStorage.getItem('asg_token');
    if (!token) {
      alert("Please login to your account to review this book.");
      window.location.href = '/login';
      return;
    }

    const isVerified = verifiedBookIds.includes(book._id.toString());
    if (!isVerified) {
      alert("Only verified readers who have purchased this book can post a review. Add it to your cart to purchase!");
      return;
    }

    setSelectedBookForReviews(book);
    setReviewsModalOpen(false);
    setReviewModalOpen(true);
  };

  return (
    <main className={styles.main}>
      <header className={`${styles.header} animate-fade-in`}>
        <h1>Avinash Book Store</h1>
        <p>Expert literature curated for your professional journey.</p>
      </header>

      {loading ? (
        <div className={styles.loader}>Loading curated books...</div>
      ) : (
        <section className={styles.grid}>
          {books.map((book) => {
            const stats = reviewsData[book._id] || { total: 0, sum: 0 };
            const avgRating = stats.total > 0 ? (stats.sum / stats.total).toFixed(1) : '5.0';
            const totalCount = stats.total;
            const isVerified = verifiedBookIds.includes(book._id.toString());

            return (
              <div key={book._id} className={`glass-card ${styles.bookCard}`}>
                <div className={styles.bookCoverPlaceholder}>
                  {book.coverImage ? (
                    <img src={getBookCoverUrl(book.coverImage)} alt={book.title} className={styles.bookCoverImage} />
                  ) : (
                    <span>{book.title[0]}</span>
                  )}
                </div>
                <div className={styles.bookInfo}>
                  {/* Format Badges */}
                  <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap', marginBottom: '0.5rem' }}>
                    <span style={{ fontSize: '0.75rem', fontWeight: '600', padding: '0.2rem 0.55rem', borderRadius: '4px', background: '#EEF2FF', color: '#4F46E5', display: 'inline-flex', alignItems: 'center', gap: '0.3rem' }}>
                      📄 Digital E-Book (PDF)
                    </span>
                    {book.physicalPrice > 0 && (
                      <span style={{ fontSize: '0.75rem', fontWeight: '600', padding: '0.2rem 0.55rem', borderRadius: '4px', background: '#F0FDF4', color: '#166534', display: 'inline-flex', alignItems: 'center', gap: '0.3rem' }}>
                        📦 Physical Copy Available (+₹{book.physicalPrice + (book.shippingCost || 0)})
                      </span>
                    )}
                  </div>

                  <h3>{book.title}</h3>

                  {/* Ratings & Reviews Link */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', margin: '0.3rem 0 0.6rem 0', flexWrap: 'wrap' }}>
                    <div 
                      onClick={() => handleOpenReviewsList(book)}
                      style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem', cursor: 'pointer' }}
                      title="Click to view reviews"
                    >
                      <StarRating rating={Number(avgRating)} readOnly={true} size={15} />
                      <span style={{ fontSize: '0.85rem', fontWeight: '700', color: '#111827' }}>{avgRating}</span>
                      <span style={{ fontSize: '0.8rem', color: '#6B7280', textDecoration: 'underline' }}>
                        ({totalCount} {totalCount === 1 ? 'review' : 'reviews'})
                      </span>
                    </div>

                    <button
                      onClick={() => handleOpenWriteReview(book)}
                      style={{
                        background: 'none',
                        border: 'none',
                        color: isVerified ? '#7942B5' : '#9CA3AF',
                        fontSize: '0.8rem',
                        fontWeight: '600',
                        cursor: 'pointer',
                        padding: '0.1rem 0.4rem',
                        borderRadius: '4px',
                        textDecoration: 'underline'
                      }}
                    >
                      {isVerified ? '✍️ Add Review' : '★ Review'}
                    </button>
                  </div>

                  <p className={styles.desc}>{book.description}</p>
                  
                  <div className={styles.priceRow}>
                    <div>
                      <div style={{display: 'flex', alignItems: 'center', gap: '0.5rem'}}>
                        <span className={styles.price}>₹{book.price}</span>
                        {book.originalPrice > book.price && (
                          <span style={{textDecoration: 'line-through', color: '#9CA3AF', fontSize: '0.9rem'}}>
                            ₹{book.originalPrice}
                          </span>
                        )}
                      </div>
                      <span style={{fontSize: '0.8rem', color: '#6B7280', display: 'block'}}>Digital E-Book</span>
                    </div>
                    <span className={styles.stock}>
                      {book.stock > 0 ? `In Stock (${book.stock})` : 'Out of Stock'}
                    </span>
                  </div>
                  <div style={{fontSize: '0.8rem', color: '#4F46E5', marginBottom: '1rem', fontStyle: 'italic'}}>
                    *Physical copy upgrade available after purchase.
                  </div>
                  
                  {getCartCount(book._id) > 0 ? (
                    <div className={styles.storeQtyControls}>
                      <button 
                        className={styles.storeQtyBtn}
                        onClick={() => updateQuantity(book._id, getCartCount(book._id) - 1)}
                      >
                        -
                      </button>
                      <span className={styles.storeQtySpan}>{getCartCount(book._id)}</span>
                      <button 
                        className={styles.storeQtyBtn}
                        onClick={() => updateQuantity(book._id, getCartCount(book._id) + 1)}
                        disabled={getCartCount(book._id) >= book.stock}
                        style={{ opacity: getCartCount(book._id) >= book.stock ? 0.5 : 1, cursor: getCartCount(book._id) >= book.stock ? 'not-allowed' : 'pointer' }}
                      >
                        +
                      </button>
                    </div>
                  ) : (
                    <button 
                      className={`btn-primary ${styles.addButton}`}
                      onClick={() => addToCart(book)}
                      disabled={book.stock <= 0}
                    >
                      Add to Cart
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </section>
      )}

      {/* Reviews List Modal */}
      {selectedBookForReviews && (
        <ReviewsListModal
          isOpen={reviewsModalOpen}
          onClose={() => setReviewsModalOpen(false)}
          item={{
            itemType: 'book',
            itemId: selectedBookForReviews._id,
            itemTitle: selectedBookForReviews.title
          }}
          onOpenWriteReview={() => handleOpenWriteReview(selectedBookForReviews)}
          isVerifiedUser={verifiedBookIds.includes(selectedBookForReviews._id.toString())}
        />
      )}

      {/* Write Review Modal */}
      {selectedBookForReviews && (
        <ReviewModal
          isOpen={reviewModalOpen}
          onClose={() => setReviewModalOpen(false)}
          item={{
            itemType: 'book',
            itemId: selectedBookForReviews._id,
            itemTitle: selectedBookForReviews.title
          }}
          onSuccess={() => {
            fetchReviews();
          }}
        />
      )}
    </main>
  );
}
