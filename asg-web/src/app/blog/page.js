"use client";

import styles from './blog.module.css';
import Link from 'next/link';
import { useState, useEffect } from 'react';

export default function Blog() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBlogs = async () => {
      try {
        const res = await fetch('/api/admin/blogs');
        if (res.ok) {
          const data = await res.json();
          // Filter to show only published posts
          setPosts(data.filter(post => post.isPublished !== false));
        }
      } catch (error) {
        console.error("Failed to load blogs", error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchBlogs();
  }, []);

  if (loading) return <div className={styles.main}><div className={styles.loader}>Loading insights...</div></div>;

  return (
    <main className={styles.main}>
      <header className={`${styles.header} animate-fade-in`}>
        <h1>Latest Insights</h1>
        <p>Expert articles on growth, leadership, and market analysis.</p>
      </header>

      <section className={styles.grid}>
        {posts.length === 0 ? (
          <p style={{ textAlign: 'center', gridColumn: '1 / -1', color: '#6B7280' }}>No articles published yet.</p>
        ) : (
          posts.map((post) => (
            <article key={post._id} className="glass-card">
              <div className={styles.meta}>
                <span className={styles.category}>{post.category}</span>
                <span className={styles.date}>{new Date(post.createdAt).toLocaleDateString()}</span>
              </div>
              <h2>{post.title}</h2>
              <p className={styles.excerpt}>{post.excerpt}</p>
              <Link href={`/blog/${post.slug}`} className={styles.readMore}>
                Read Full Article &rarr;
              </Link>
            </article>
          ))
        )}
      </section>
    </main>
  );
}
