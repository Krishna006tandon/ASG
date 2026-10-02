import styles from './blog.module.css';
import Link from 'next/link';
import connectToDatabase from '@/lib/mongodb';
import Blog from '@/models/Blog';

export const dynamic = 'force-dynamic';

export const metadata = {
  title: "Insights & Articles | Career, Mindset & Leadership",
  description:
    "Explore in-depth articles by Avinash Gore on youth empowerment, student study methodologies, startup validation, engineering excellence, and personal finance.",
  alternates: {
    canonical: "/blog",
  },
  openGraph: {
    title: "Insights & Articles | Avinash Gore",
    description:
      "Curated expert perspectives on growth, leadership, and student success.",
    url: "/blog",
    images: [
      {
        url: "/images/image1.png",
        width: 800,
        height: 600,
        alt: "Avinash Gore Blog Insights",
      },
    ],
  },
};

export default async function BlogPage() {
  await connectToDatabase();
  const rawPosts = await Blog.find({ isPublished: true }).sort({ createdAt: -1 }).lean();
  const posts = JSON.parse(JSON.stringify(rawPosts));

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
