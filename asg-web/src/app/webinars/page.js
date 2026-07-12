import styles from './webinar.module.css';

export const metadata = {
  title: "Webinars & Masterclasses | Avinash Professional",
};

export default function Webinars() {
  const webinars = [
    {
      id: 1,
      title: "Mastering SIPs and Mutual Funds",
      date: "November 12, 2026",
      time: "6:00 PM - 8:00 PM IST",
      price: 499,
      seatsLeft: 12,
      desc: "An intensive 2-hour masterclass breaking down the mathematics of compounding and portfolio diversification for beginners."
    },
    {
      id: 2,
      title: "The 90-Day MVP Bootcamp",
      date: "December 05, 2026",
      time: "10:00 AM - 2:00 PM IST",
      price: 1999,
      seatsLeft: 5,
      desc: "A half-day workshop where we actively build your startup's go-to-market strategy and pitch deck architecture live."
    }
  ];

  return (
    <main className={styles.main}>
      <header className={`${styles.header} animate-fade-in`}>
        <h1>Live Masterclasses</h1>
        <p>Book your seat for upcoming interactive sessions and transform your strategy.</p>
      </header>

      <section className={styles.list}>
        {webinars.map((webinar) => (
          <div key={webinar.id} className={`glass-card ${styles.webinarCard}`}>
            <div className={styles.dateBlock}>
              <span className={styles.month}>{webinar.date.split(' ')[0].substring(0,3)}</span>
              <span className={styles.day}>{webinar.date.split(' ')[1].replace(',', '')}</span>
            </div>
            
            <div className={styles.content}>
              <h2>{webinar.title}</h2>
              <div className={styles.metaRow}>
                <span className={styles.time}>🕒 {webinar.time}</span>
                <span className={styles.seats}>🪑 {webinar.seatsLeft} seats left</span>
              </div>
              <p className={styles.desc}>{webinar.desc}</p>
            </div>
            
            <div className={styles.actionBlock}>
              <div className={styles.price}>₹{webinar.price}</div>
              <button className={`btn-primary ${styles.bookBtn}`}>Book Seat</button>
            </div>
          </div>
        ))}
      </section>
    </main>
  );
}
