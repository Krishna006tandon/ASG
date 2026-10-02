import connectToDatabase from '@/lib/mongodb';
import Blog from '@/models/Blog';
import styles from '../blog.module.css';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import JsonLd from '@/components/JsonLd';
import { getArticleSchema } from '@/lib/seoSchemas';

export async function generateMetadata({ params }) {
  const { slug } = await params;
  await connectToDatabase();
  const post = await Blog.findOne({ slug }).lean();

  if (!post) {
    return {
      title: 'Article Not Found',
      robots: { index: false, follow: false },
    };
  }

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://avinashsgore.com';
  const pageUrl = `${siteUrl}/blog/${slug}`;

  return {
    title: `${post.title} | Avinash Gore`,
    description: post.excerpt || post.title,
    alternates: {
      canonical: pageUrl,
    },
    openGraph: {
      title: post.title,
      description: post.excerpt || post.title,
      url: pageUrl,
      type: 'article',
      publishedTime: post.createdAt ? new Date(post.createdAt).toISOString() : undefined,
      modifiedTime: post.updatedAt ? new Date(post.updatedAt).toISOString() : undefined,
      authors: ['Avinash Gore'],
      images: [
        {
          url: '/images/image1.png',
          width: 1200,
          height: 630,
          alt: post.title,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: post.title,
      description: post.excerpt || post.title,
      images: ['/images/image1.png'],
    },
  };
}

export default async function BlogPost({ params }) {
  const { slug } = await params;
  
  await connectToDatabase();
  const post = await Blog.findOne({ slug }).lean();

  if (!post) {
    notFound();
  }

  const articleSchema = getArticleSchema(post);

  return (
    <main className={styles.main}>
      <JsonLd data={articleSchema} />
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
