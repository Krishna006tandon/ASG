import styles from './recommends.module.css';
import Link from 'next/link';
import connectToDatabase from '@/lib/mongodb';
import Blog from '@/models/Blog';

export const metadata = {
  title: "Avinash Blog | Matrix",
};

export const dynamic = 'force-dynamic';

export default async function Recommends() {
  await connectToDatabase();
  const blogs = await Blog.find({ isPublished: true }).sort({ createdAt: -1 }).lean();

  return (
    <main className={styles.main}>
      <header className={`${styles.header} animate-fade-in`}>
        <h1>Avinash Blog Matrix</h1>
        <p>Curated insights, strategies, and articles for personal and professional growth.</p>
      </header>

      {blogs.length === 0 ? (
        <section style={{ textAlign: 'center', padding: '4rem 1rem', color: 'var(--text-secondary)' }}>
          <h2>Blogs coming soon!</h2>
          <p>Stay tuned for exciting new content.</p>
        </section>
      ) : (
        <section className={styles.grid}>
          {blogs.map(blog => (
            <div key={blog._id.toString()} className="glass-card">
              <div style={{fontSize: '0.8rem', color: 'var(--primary-color)', fontWeight: 'bold', marginBottom: '0.5rem'}}>{blog.category}</div>
              <h3>{blog.title}</h3>
              <p style={{fontSize: '0.9rem', color: '#6B7280', margin: '0.5rem 0'}}>{blog.excerpt}</p>
              <Link href={`/blog/${blog.slug}`} style={{fontSize: '0.9rem', color: 'var(--primary-dark)', fontWeight: 'bold', textDecoration: 'none'}}>Read More &rarr;</Link>
            </div>
          ))}
        </section>
      )}
    </main>
  );
}
