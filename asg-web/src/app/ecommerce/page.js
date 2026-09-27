"use client";

import { useEffect, useState } from 'react';
import styles from './ecommerce.module.css';
import { useCart } from '@/context/CartContext';
import { getBookCoverUrl } from '@/lib/imageHelper';

export default function EcommerceStore() {
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const { addToCart, cart, updateQuantity } = useCart();

  useEffect(() => {
    // In a real scenario, this fetches from /api/books
    // For preview purposes without a connected DB, we use mock data
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
    
    fetchBooks();
  }, []);

  const getCartCount = (bookId) => {
    const item = cart.find(c => c._id === bookId);
    return item ? item.quantity : 0;
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
          {books.map((book) => (
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
                <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap', marginBottom: '0.65rem' }}>
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
          ))}
        </section>
      )}
    </main>
  );
}
