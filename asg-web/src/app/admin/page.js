import styles from './admin.module.css';

export default function AdminDashboard() {
  const kpis = [
    { label: "Total Revenue", value: "₹45,230", trend: "+12%" },
    { label: "Active Orders", value: "14", trend: "+3" },
    { label: "Upcoming Consultations", value: "8", trend: "-1" },
    { label: "Webinar Registrations", value: "112", trend: "+45" }
  ];

  const recentOrders = [
    { id: "ORD-9821", customer: "Rahul Sharma", status: "Paid", amount: "₹899" },
    { id: "ORD-9822", customer: "Priya Patel", status: "Pending", amount: "₹1,250" },
    { id: "ORD-9823", customer: "Vikram Singh", status: "Dispatched", amount: "₹1,499" },
    { id: "ORD-9824", customer: "Anjali Gupta", status: "Delivered", amount: "₹599" },
  ];

  return (
    <div className={styles.dashboard}>
      <h1 className={styles.title}>Dashboard Overview</h1>
      
      <div className={styles.kpiGrid}>
        {kpis.map((kpi, idx) => (
          <div key={idx} className={styles.kpiCard}>
            <h3>{kpi.label}</h3>
            <div className={styles.kpiValueRow}>
              <span className={styles.value}>{kpi.value}</span>
              <span className={kpi.trend.startsWith('+') ? styles.trendUp : styles.trendDown}>
                {kpi.trend}
              </span>
            </div>
          </div>
        ))}
      </div>

      <div className={styles.tablesGrid}>
        <div className={styles.tableCard}>
          <h2>Recent Orders Queue</h2>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Order ID</th>
                <th>Customer</th>
                <th>Status</th>
                <th>Amount</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {recentOrders.map(order => (
                <tr key={order.id}>
                  <td>{order.id}</td>
                  <td>{order.customer}</td>
                  <td>
                    <span className={`${styles.badge} ${styles[order.status.toLowerCase()]}`}>
                      {order.status}
                    </span>
                  </td>
                  <td>{order.amount}</td>
                  <td><button className={styles.actionBtn}>Manage</button></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
