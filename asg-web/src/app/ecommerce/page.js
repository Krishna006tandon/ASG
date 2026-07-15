"use client";

import { useEffect, useState } from 'react';
import styles from './ecommerce.module.css';
import { useCart } from '@/context/CartContext';

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
                <span>{book.title[0]}</span>
              </div>
              <div className={styles.bookInfo}>
                <h3>{book.title}</h3>
                <p className={styles.desc}>{book.description}</p>
                <div className={styles.priceRow}>
                  <span className={styles.price}>₹{book.price}</span>
                  <span className={styles.stock}>
                    {book.stock > 0 ? `In Stock (${book.stock})` : 'Out of Stock'}
                  </span>
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
