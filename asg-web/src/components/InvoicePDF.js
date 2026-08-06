import React from 'react';

export default function InvoicePDF({ invoiceData, invoiceRef }) {
  if (!invoiceData) return null;

  return (
    <div 
      ref={invoiceRef}
      style={{
        position: 'absolute',
        top: '-10000px',
        left: '-10000px',
        width: '800px',
        minHeight: '1131px', // A4 aspect ratio at roughly 96 DPI
        background: '#ffffff',
        color: '#1F2937',
        fontFamily: 'system-ui, -apple-system, sans-serif',
        boxSizing: 'border-box',
        overflow: 'hidden'
      }}
    >
      <div style={{ padding: '60px', display: 'flex', flexDirection: 'column', height: '100%', boxSizing: 'border-box', background: '#ffffff', border: '1px solid #E5E7EB' }}>
        
        {/* Header Section */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', borderBottom: '2px solid #7942b5', paddingBottom: '30px', marginBottom: '40px' }}>
          <div>
            <h1 style={{ margin: '0 0 10px 0', fontSize: '32px', fontWeight: '700', color: '#7942b5', letterSpacing: '2px', textTransform: 'uppercase' }}>
              ASG Consulting
            </h1>
            <p style={{ margin: '0 0 4px 0', color: '#4B5563', fontSize: '13px' }}>123 Business Avenue, Suite 400</p>
            <p style={{ margin: '0 0 4px 0', color: '#4B5563', fontSize: '13px' }}>New Delhi, DL 110001, India</p>
            <p style={{ margin: '0', color: '#4B5563', fontSize: '13px' }}>contact@asg.com | +91-9876543210</p>
          </div>
          <div style={{ textAlign: 'right' }}>
            <h2 style={{ margin: '0 0 10px 0', fontSize: '40px', fontWeight: '300', color: '#374151', letterSpacing: '4px' }}>
              INVOICE
            </h2>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '20px' }}>
              <div style={{ textAlign: 'right' }}>
                <p style={{ margin: '0 0 4px 0', fontSize: '11px', color: '#6B7280', textTransform: 'uppercase', fontWeight: 'bold' }}>Invoice No.</p>
                <p style={{ margin: '0', fontSize: '14px', color: '#111827', fontWeight: '600' }}>{invoiceData.id.substring(0, 10).toUpperCase()}</p>
              </div>
              <div style={{ textAlign: 'right' }}>
                <p style={{ margin: '0 0 4px 0', fontSize: '11px', color: '#6B7280', textTransform: 'uppercase', fontWeight: 'bold' }}>Date</p>
                <p style={{ margin: '0', fontSize: '14px', color: '#111827', fontWeight: '600' }}>
                  {new Date(invoiceData.date).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Billing Info */}
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '40px' }}>
          <div style={{ width: '45%' }}>
            <div style={{ background: '#F3F4F6', padding: '6px 12px', borderLeft: '4px solid #7942b5', marginBottom: '10px' }}>
              <p style={{ margin: '0', fontSize: '12px', color: '#374151', textTransform: 'uppercase', fontWeight: '700' }}>Bill To:</p>
            </div>
            <div style={{ paddingLeft: '12px' }}>
              <p style={{ margin: '0 0 4px 0', fontSize: '16px', fontWeight: '700', color: '#111827' }}>
                {invoiceData.customer?.name || 'Valued Customer'}
              </p>
              <p style={{ margin: '0 0 4px 0', fontSize: '14px', color: '#4B5563' }}>
                {invoiceData.customer?.email}
              </p>
            </div>
          </div>
          <div style={{ width: '45%' }}>
            <div style={{ background: '#F3F4F6', padding: '6px 12px', borderLeft: '4px solid #7942b5', marginBottom: '10px' }}>
              <p style={{ margin: '0', fontSize: '12px', color: '#374151', textTransform: 'uppercase', fontWeight: '700' }}>Invoice Details:</p>
            </div>
            <div style={{ paddingLeft: '12px' }}>
              <table style={{ width: '100%', fontSize: '13px' }}>
                <tbody>
                  <tr>
                    <td style={{ padding: '2px 0', color: '#6B7280', width: '100px' }}>Category:</td>
                    <td style={{ padding: '2px 0', color: '#111827', fontWeight: '500' }}>{invoiceData.type}</td>
                  </tr>
                  <tr>
                    <td style={{ padding: '2px 0', color: '#6B7280' }}>Status:</td>
                    <td style={{ padding: '2px 0', color: '#059669', fontWeight: 'bold' }}>PAID</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Line Items Table */}
        <div style={{ flex: 1, marginBottom: '40px' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', border: '1px solid #D1D5DB' }}>
            <thead>
              <tr style={{ background: '#7942b5', color: 'white' }}>
                <th style={{ textAlign: 'left', padding: '12px 16px', fontSize: '12px', textTransform: 'uppercase', fontWeight: '600', border: '1px solid #7942b5' }}>Description</th>
                <th style={{ textAlign: 'center', padding: '12px 16px', fontSize: '12px', textTransform: 'uppercase', fontWeight: '600', width: '15%', border: '1px solid #7942b5' }}>Qty</th>
                <th style={{ textAlign: 'right', padding: '12px 16px', fontSize: '12px', textTransform: 'uppercase', fontWeight: '600', width: '20%', border: '1px solid #7942b5' }}>Unit Price</th>
                <th style={{ textAlign: 'right', padding: '12px 16px', fontSize: '12px', textTransform: 'uppercase', fontWeight: '600', width: '20%', border: '1px solid #7942b5' }}>Amount</th>
              </tr>
            </thead>
            <tbody>
              {invoiceData.items.map((item, index) => (
                <tr key={index} style={{ borderBottom: '1px solid #D1D5DB', background: index % 2 === 0 ? '#ffffff' : '#F9FAFB' }}>
                  <td style={{ padding: '16px', fontSize: '14px', color: '#111827', borderRight: '1px solid #D1D5DB' }}>
                    {item.title}
                  </td>
                  <td style={{ padding: '16px', fontSize: '14px', color: '#374151', textAlign: 'center', borderRight: '1px solid #D1D5DB' }}>
                    {item.quantity}
                  </td>
                  <td style={{ padding: '16px', fontSize: '14px', color: '#374151', textAlign: 'right', borderRight: '1px solid #D1D5DB' }}>
                    ₹{item.price.toLocaleString('en-IN')}
                  </td>
                  <td style={{ padding: '16px', fontSize: '14px', color: '#111827', textAlign: 'right', fontWeight: '600' }}>
                    ₹{(item.price * item.quantity).toLocaleString('en-IN')}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Totals Section */}
        <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '40px' }}>
          <table style={{ width: '350px', borderCollapse: 'collapse' }}>
            <tbody>
              <tr>
                <td style={{ padding: '10px 16px', fontSize: '13px', color: '#4B5563', borderBottom: '1px solid #E5E7EB' }}>Subtotal</td>
                <td style={{ padding: '10px 16px', fontSize: '14px', color: '#111827', textAlign: 'right', borderBottom: '1px solid #E5E7EB' }}>₹{invoiceData.totalAmount.toLocaleString('en-IN')}</td>
              </tr>
              <tr>
                <td style={{ padding: '10px 16px', fontSize: '13px', color: '#4B5563', borderBottom: '2px solid #7942b5' }}>Tax</td>
                <td style={{ padding: '10px 16px', fontSize: '14px', color: '#111827', textAlign: 'right', borderBottom: '2px solid #7942b5' }}>₹0</td>
              </tr>
              <tr style={{ background: '#F3F4F6' }}>
                <td style={{ padding: '16px', fontSize: '16px', fontWeight: '700', color: '#111827' }}>Total Amount</td>
                <td style={{ padding: '16px', fontSize: '18px', fontWeight: '700', color: '#7942b5', textAlign: 'right' }}>
                  ₹{invoiceData.totalAmount.toLocaleString('en-IN')}
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Footer */}
        <div style={{ borderTop: '2px solid #E5E7EB', paddingTop: '20px', marginTop: 'auto' }}>
          <p style={{ margin: '0 0 4px 0', fontSize: '12px', fontWeight: '700', color: '#374151', textTransform: 'uppercase' }}>Terms & Conditions</p>
          <p style={{ margin: '0', fontSize: '11px', color: '#6B7280', lineHeight: '1.5' }}>
            1. This is a computer generated invoice and does not require a physical signature.<br/>
            2. Payment has been received in full via Razorpay.<br/>
            3. For any queries regarding this invoice, please quote the Invoice No. in your communication.
          </p>
        </div>
      </div>
    </div>
  );
}
