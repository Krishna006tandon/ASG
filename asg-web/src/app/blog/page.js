import styles from './blog.module.css';
import Link from 'next/link';

export const metadata = {
  title: "Blog | Avinash Professional",
};

export default function Blog() {
  const posts = [
    {
      id: 1,
      title: "The Ultimate Guide to Scaling Your E-Commerce Store",
      excerpt: "Learn the core strategies used by top founders to scale revenue without compromising profit margins.",
      date: "Oct 15, 2026",
      category: "E-Commerce",
    },
    {
      id: 2,
      title: "Mastering the Art of Angel Investing",
      excerpt: "A deep dive into identifying high-growth startups and structuring your early-stage portfolio.",
      date: "Sep 28, 2026",
      category: "Investing",
    },
    {
      id: 3,
      title: "Building Resilient Teams in 2027",
      excerpt: "Why the traditional management structure is fading and how to foster extreme ownership.",
      date: "Aug 12, 2026",
      category: "Leadership",
    }
  ];

  return (
    <main className={styles.main}>
      <header className={`${styles.header} animate-fade-in`}>
        <h1>Latest Insights</h1>
        <p>Expert articles on growth, leadership, and market analysis.</p>
      </header>

      <section className={styles.grid}>
        {posts.map((post) => (
          <article key={post.id} className="glass-card">
            <div className={styles.meta}>
              <span className={styles.category}>{post.category}</span>
              <span className={styles.date}>{post.date}</span>
            </div>
            <h2>{post.title}</h2>
            <p className={styles.excerpt}>{post.excerpt}</p>
            <Link href={`/blog/${post.id}`} className={styles.readMore}>
              Read Full Article &rarr;
            </Link>
          </article>
        ))}
      </section>
    </main>
  );
}
