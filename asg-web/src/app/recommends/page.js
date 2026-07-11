import styles from './recommends.module.css';

export const metadata = {
  title: "Avinash Recommends | Matrix",
};

export default function Recommends() {
  const recommendations = [
    { title: "Fitness Items", desc: "Adjustable dumbbells and smart scales to track physical health, which is crucial for mental stamina.", link: "#" },
    { title: "Productivity Tools", desc: "Notion for organizing startup strategies and Todoist for daily task tracking.", link: "#" },
    { title: "Meditation", desc: "Headspace subscriptions to maintain focus and reduce burnout during scaling phases.", link: "#" },
    { title: "Travel Setups", desc: "Minimalist carry-on tech backpacks and noise-cancelling headphones for deep work anywhere.", link: "#" },
    { title: "Associate Businesses", desc: "Trusted legal consultants and accounting firms for rapid business registration.", link: "#" },
  ];

  return (
    <main className={styles.main}>
      <header className={`${styles.header} animate-fade-in`}>
        <h1>Avinash Recommends Matrix</h1>
        <p>Curated assets, tools, and services highly recommended for personal and professional growth.</p>
      </header>

      <section className={styles.grid}>
        {recommendations.map((item, idx) => (
          <div key={idx} className="glass-card">
            <h3>{item.title}</h3>
            <p>{item.desc}</p>
            <a href={item.link} className={styles.buyLink}>Purchase / View &rarr;</a>
          </div>
        ))}
      </section>
    </main>
  );
}
