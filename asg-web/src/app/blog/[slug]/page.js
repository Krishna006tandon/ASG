import connectToDatabase from '@/lib/mongodb';
import Blog from '@/models/Blog';
import styles from '../blog.module.css';
import Link from 'next/link';
import { notFound } from 'next/navigation';

export async function generateMetadata({ params }) {
  const { slug } = await params;
  await connectToDatabase();
  const post = await Blog.findOne({ slug }).lean();

  if (!post) {
    return { title: 'Post Not Found | Avinash Professional' };
  }

  return {
    title: `${post.title} | Avinash Professional`,
    description: post.excerpt
  };
}

export default async function BlogPost({ params }) {
  const { slug } = await params;
  
  await connectToDatabase();
  const post = await Blog.findOne({ slug }).lean();

  if (!post) {
    notFound();
  }

  return (
    <main className={styles.main}>
      <article className={styles.articleContainer}>
        <div className={styles.backLink}>
          <Link href="/blog">&larr; Back to all insights</Link>
        </div>
        
        <header className={styles.articleHeader}>
          <div className={styles.metaRow}>
            <span className={styles.categoryBadge}>{post.category}</span>
            <span className={styles.readTime}>⏳ {post.readTime}</span>
          </div>
          <h1 className={styles.articleTitle}>{post.title}</h1>
          <div className={styles.articleDate}>
            Published on {new Date(post.createdAt).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
          </div>
        </header>

        <div className={styles.articleContent}>
          {/* Note: In a real app, you'd use a Markdown parser like react-markdown here */}
          {/* Since this is simple, we will map over paragraphs splitting by newline */}
          {post.content.split('\n').map((paragraph, idx) => (
            <p key={idx}>{paragraph}</p>
          ))}
        </div>
      </article>
    </main>
  );
}
