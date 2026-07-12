"use client";

import { useEffect, useState } from 'react';
import styles from './ecommerce.module.css';
import { useCart } from '@/context/CartContext';

export default function EcommerceStore() {
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const { addToCart, cart } = useCart();

  useEffect(() => {
    // In a real scenario, this fetches from /api/books
    // For preview purposes without a connected DB, we use mock data
    const fetchBooks = async () => {
      try {
        // const res = await fetch('/api/books');
        // const data = await res.json();
        
        // Mock data fallback
        const data = [
          { _id: '1', title: 'The Startup Playbook', price: 899, description: 'A comprehensive guide to scaling your first venture from 0 to 1.', stock: 15 },
          { _id: '2', title: 'Financial Intelligence', price: 1250, description: 'Understanding numbers, budgets, and investments for non-finance leaders.', stock: 8 },
          { _id: '3', title: 'E-Commerce Mastery', price: 1499, description: 'Advanced strategies for driving traffic and optimizing conversion rates.', stock: 24 },
          { _id: '4', title: 'Productivity Frameworks', price: 599, description: 'Time management and deep work strategies for busy professionals.', stock: 5 },
        ];
        
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
        <div className={styles.cartStatus}>
          <span>Cart Items: {cart.reduce((sum, i) => sum + i.quantity, 0)}</span>
          <button className="btn-accent" onClick={() => alert("Checkout flow coming next!")}>Checkout</button>
        </div>
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
                  <button 
                    className={`btn-primary ${styles.addButton} ${styles.added}`}
                    onClick={() => addToCart(book)}
                  >
                    Add More ({getCartCount(book._id)} in cart)
                  </button>
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
