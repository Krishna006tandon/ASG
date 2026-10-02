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

  // Selected format state per book: 'digital' | 'physical'
  const [selectedFormats, setSelectedFormats] = useState({});

  const getFormat = (book) => {
    if (selectedFormats[book._id]) return selectedFormats[book._id];
    return book.physicalPrice > 0 ? 'physical' : 'digital';
  };

  const getCartCount = (bookId, isPhysical = false) => {
    const item = cart.find(c => c._id === bookId && Boolean(c.isPhysicalRequested) === Boolean(isPhysical));
    return item ? item.quantity : 0;
  };

  const getItemKey = (bookId, isPhysical = false) => {
    const item = cart.find(c => c._id === bookId && Boolean(c.isPhysicalRequested) === Boolean(isPhysical));
    return item ? (item.cartItemId || item._id) : `${bookId}_${isPhysical ? 'physical' : 'digital'}`;
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
                  {/* Format Selector on Card */}
                  {book.physicalPrice > 0 ? (
                    <div style={{ marginBottom: '0.75rem' }}>
                      <div style={{ fontSize: '0.78rem', fontWeight: 700, color: '#4B5563', marginBottom: '0.4rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span>Choose Format:</span>
                        <span style={{ color: '#059669', fontSize: '0.72rem', fontWeight: 700 }}>✓ Physical Copy Available</span>
                      </div>
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
                        {/* Physical Copy Tile */}
                        <button
                          type="button"
                          onClick={() => setSelectedFormats(prev => ({ ...prev, [book._id]: 'physical' }))}
                          style={{
                            padding: '0.65rem 0.4rem',
                            borderRadius: '10px',
                            border: format === 'physical' ? '2px solid #059669' : '1px solid #D1D5DB',
                            background: format === 'physical' ? '#ECFDF5' : '#FFFFFF',
                            cursor: 'pointer',
                            textAlign: 'center',
                            position: 'relative',
                            transition: 'all 0.2s ease',
                            boxShadow: format === 'physical' ? '0 4px 12px rgba(5,150,105,0.18)' : 'none'
                          }}
                        >
                          <span style={{
                            position: 'absolute',
                            top: '-8px',
                            right: '6px',
                            background: '#059669',
                            color: 'white',
                            fontSize: '0.6rem',
                            fontWeight: 800,
                            padding: '0.05rem 0.4rem',
                            borderRadius: '10px',
                            letterSpacing: '0.03em'
                          }}>
                            POPULAR
                          </span>
                          <div style={{ fontSize: '0.82rem', fontWeight: 700, color: format === 'physical' ? '#065F46' : '#374151' }}>
                            📦 Physical Copy
                          </div>
                          <div style={{ fontSize: '1.05rem', fontWeight: 800, color: '#111827', margin: '0.15rem 0' }}>
                            ₹{physicalTotalPrice}
                          </div>
                          <div style={{ fontSize: '0.7rem', color: '#059669', fontWeight: 600 }}>
                            Paperback Book
                          </div>
                        </button>

                        {/* Digital E-Book Tile */}
                        <button
                          type="button"
                          onClick={() => setSelectedFormats(prev => ({ ...prev, [book._id]: 'digital' }))}
                          style={{
                            padding: '0.65rem 0.4rem',
                            borderRadius: '10px',
                            border: format === 'digital' ? '2px solid #7942B5' : '1px solid #D1D5DB',
                            background: format === 'digital' ? '#F5F3FF' : '#FFFFFF',
                            cursor: 'pointer',
                            textAlign: 'center',
                            transition: 'all 0.2s ease',
                            boxShadow: format === 'digital' ? '0 4px 12px rgba(121,66,181,0.15)' : 'none'
                          }}
                        >
                          <div style={{ fontSize: '0.82rem', fontWeight: 700, color: format === 'digital' ? '#7942B5' : '#374151' }}>
                            📄 Digital E-Book
                          </div>
                          <div style={{ fontSize: '1.05rem', fontWeight: 800, color: '#111827', margin: '0.15rem 0' }}>
                            ₹{book.price}
                          </div>
                          <div style={{ fontSize: '0.7rem', color: '#6B7280' }}>
                            Instant PDF
                          </div>
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap', marginBottom: '0.5rem' }}>
                      <span style={{ fontSize: '0.75rem', fontWeight: '600', padding: '0.2rem 0.55rem', borderRadius: '4px', background: '#EEF2FF', color: '#4F46E5', display: 'inline-flex', alignItems: 'center', gap: '0.3rem' }}>
                        📄 Digital E-Book (PDF)
                      </span>
                    </div>
                  )}

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
                  
                  {/* Format Features Banner */}
                  {isPhysicalSelected ? (
                    <div style={{ fontSize: '0.8rem', color: '#065F46', background: '#F0FDF4', padding: '0.55rem 0.75rem', borderRadius: '8px', marginBottom: '1rem', border: '1px solid #BBF7D0', lineHeight: 1.45 }}>
                      <div style={{ fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.35rem', marginBottom: '0.15rem' }}>
                        <span>📦 Doorstep Courier Delivery</span>
                        <span style={{ fontSize: '0.68rem', background: '#059669', color: 'white', padding: '0.05rem 0.35rem', borderRadius: '4px' }}>Paperback</span>
                      </div>
                      <div style={{ color: '#374151' }}>
                        Printed physical book delivered directly to your doorstep + includes instant Digital E-Book access!
                      </div>
                      <div style={{ fontSize: '0.74rem', color: '#047857', fontWeight: 600, marginTop: '0.25rem' }}>
                        Book: ₹{book.price + (book.physicalPrice || 0)} {book.shippingCost > 0 ? `+ ₹${book.shippingCost} Shipping` : '+ FREE Shipping'}
                      </div>
                    </div>
                  ) : (
                    <div style={{ fontSize: '0.8rem', color: '#3730A3', background: '#EEF2FF', padding: '0.55rem 0.75rem', borderRadius: '8px', marginBottom: '1rem', border: '1px solid #C7D2FE', lineHeight: 1.45 }}>
                      <div style={{ fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.35rem', marginBottom: '0.15rem' }}>
                        <span>⚡ Instant Digital Access</span>
                        <span style={{ fontSize: '0.68rem', background: '#4F46E5', color: 'white', padding: '0.05rem 0.35rem', borderRadius: '4px' }}>PDF</span>
                      </div>
                      <div style={{ color: '#374151' }}>
                        Download PDF immediately after payment. Lifetime access inside your account dashboard.
                      </div>
                    </div>
                  )}

                  <div className={styles.priceRow}>
                    <div>
                      <div style={{display: 'flex', alignItems: 'center', gap: '0.5rem'}}>
                        <span className={styles.price}>₹{activePrice}</span>
                        {book.originalPrice > activePrice && (
                          <span style={{textDecoration: 'line-through', color: '#9CA3AF', fontSize: '0.9rem'}}>
                            ₹{book.originalPrice}
                          </span>
                        )}
                      </div>
                      <span style={{fontSize: '0.8rem', color: isPhysicalSelected ? '#059669' : '#6B7280', fontWeight: 600, display: 'block'}}>
                        {isPhysicalSelected ? 'Printed Paperback Edition' : 'Digital E-Book (PDF)'}
                      </span>
                    </div>
                    <span className={styles.stock}>
                      {book.stock > 0 ? `In Stock (${book.stock})` : 'Out of Stock'}
                    </span>
                  </div>
                  
                  {currentQty > 0 ? (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem', marginTop: 'auto' }}>
                      <div style={{ fontSize: '0.78rem', fontWeight: 700, color: isPhysicalSelected ? '#059669' : '#4F46E5', textAlign: 'center' }}>
                        ✓ {isPhysicalSelected ? 'Physical Copy' : 'Digital E-Book'} in Cart ({currentQty})
                      </div>
                      <div className={styles.storeQtyControls}>
                        <button 
                          className={styles.storeQtyBtn}
                          onClick={() => updateQuantity(currentItemKey, currentQty - 1, isPhysicalSelected)}
                        >
                          -
                        </button>
                        <span className={styles.storeQtySpan}>{currentQty}</span>
                        <button 
                          className={styles.storeQtyBtn}
                          onClick={() => updateQuantity(currentItemKey, currentQty + 1, isPhysicalSelected)}
                          disabled={currentQty >= book.stock}
                          style={{ opacity: currentQty >= book.stock ? 0.5 : 1, cursor: currentQty >= book.stock ? 'not-allowed' : 'pointer' }}
                        >
                          +
                        </button>
                      </div>
                    </div>
                  ) : (
                    <button 
                      className={`btn-primary ${styles.addButton}`}
                      style={isPhysicalSelected ? { background: 'linear-gradient(135deg, #059669 0%, #047857 100%)', borderColor: '#059669' } : {}}
                      onClick={() => addToCart(book, isPhysicalSelected)}
                      disabled={book.stock <= 0}
                    >
                      {isPhysicalSelected 
                        ? `📦 Buy Physical Copy • ₹${physicalTotalPrice}`
                        : `📄 Add E-Book to Cart • ₹${book.price}`
                      }
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
