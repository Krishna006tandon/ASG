"use client";

import { useState, useEffect } from 'react';
import styles from './admin.module.css';

export default function AdminDashboard() {
  const [kpis, setKpis] = useState([]);
  const [recentOrders, setRecentOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const token = localStorage.getItem('asg_token');
        if (!token) {
          window.location.href = '/login';
          return;
        }

        const res = await fetch('/api/admin/dashboard', {
          headers: {
            // In a real app, pass the authorization token
            // 'Authorization': `Bearer ${token}` 
          }
        });

        if (!res.ok) {
          throw new Error('Failed to fetch dashboard data');
        }

        const data = await res.json();
        setKpis(data.kpis);
        setRecentOrders(data.recentOrders);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  if (loading) {
    return <div className={styles.dashboard}><h2>Loading dashboard data...</h2></div>;
  }

  if (error) {
    return <div className={styles.dashboard}><h2>Error: {error}</h2></div>;
  }

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
          {recentOrders.length === 0 ? (
            <p>No recent orders found.</p>
          ) : (
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
                      <span className={`${styles.badge} ${styles[order.status.toLowerCase()] || styles.pending}`}>
                        {order.status}
                      </span>
                    </td>
                    <td>{order.amount}</td>
                    <td><button className={styles.actionBtn}>Manage</button></td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}
