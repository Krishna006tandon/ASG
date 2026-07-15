"use client";

import { useState, useEffect } from 'react';
import styles from './orders.module.css';

export default function OrderManagement() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [updatingId, setUpdatingId] = useState(null);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      const res = await fetch('/api/admin/orders');
      if (!res.ok) throw new Error('Failed to fetch orders');
      const data = await res.json();
      setOrders(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (orderId, newStatus) => {
    setUpdatingId(orderId);
    try {
      const res = await fetch(`/api/admin/orders/${orderId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });
      
      if (!res.ok) throw new Error('Failed to update status');
      
      const updatedOrder = await res.json();
      
      // Update local state
      setOrders(orders.map(order => 
        order._id === updatedOrder._id ? updatedOrder : order
      ));
    } catch (err) {
      alert(err.message);
    } finally {
      setUpdatingId(null);
    }
  };

  if (loading) return <div className={styles.container}><h2>Loading orders...</h2></div>;
  if (error) return <div className={styles.container}><h2>Error: {error}</h2></div>;

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1>Order Management Console</h1>
        <p>Manage and process all platform transactions.</p>
      </div>

      <div className={styles.tableWrapper}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>Order Date</th>
              <th>Customer Name</th>
              <th>Amount</th>
              <th>Razorpay ID</th>
              <th>Current Status</th>
              <th>Update Status</th>
            </tr>
          </thead>
          <tbody>
            {orders.length === 0 ? (
              <tr>
                <td colSpan="6" style={{ textAlign: 'center', padding: '2rem' }}>No orders found in the database.</td>
              </tr>
            ) : (
              orders.map((order) => (
                <tr key={order._id}>
                  <td>{new Date(order.createdAt).toLocaleDateString()}</td>
                  <td>
                    {order.customerDetails?.name || 'N/A'}<br/>
                    <small style={{ color: '#6B7280' }}>{order.customerDetails?.email || ''}</small>
                  </td>
                  <td>
                    <div style={{fontWeight: '600', marginBottom: '0.5rem'}}>₹{order.totalAmount}</div>
                    {order.items.map((item, i) => (
                      <div key={i} style={{fontSize: '0.8rem', padding: '0.25rem 0', borderTop: '1px dashed #E5E7EB'}}>
                        {item.quantity}x {item.title}
                        {item.isPhysicalRequested && (
                          <div style={{marginTop: '0.25rem', padding: '0.25rem', background: '#FEF3C7', border: '1px solid #F59E0B', borderRadius: '4px'}}>
                            <strong>📦 Physical Copy Requested</strong><br/>
                            Status: {item.physicalStatus}<br/>
                            To: {item.shippingAddress}
                          </div>
                        )}
                      </div>
                    ))}
                  </td>
                  <td><small>{order.razorpayOrderId}</small></td>
                  <td>
                    <span className={`${styles.badge} ${styles[order.status.toLowerCase()] || styles.pending}`}>
                      {order.status}
                    </span>
                  </td>
                  <td>
                    <select 
                      className={styles.statusSelect}
                      value={order.status}
                      onChange={(e) => handleStatusChange(order._id, e.target.value)}
                      disabled={updatingId === order._id}
                    >
                      <option value="Pending">Pending</option>
                      <option value="Paid">Paid</option>
                      <option value="Processing">Processing</option>
                      <option value="Dispatched">Dispatched</option>
                      <option value="Delivered">Delivered</option>
                      <option value="Cancelled">Cancelled</option>
                    </select>
                    {updatingId === order._id && <span style={{ marginLeft: '0.5rem', fontSize: '0.8rem', color: '#6B7280' }}>...</span>}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
