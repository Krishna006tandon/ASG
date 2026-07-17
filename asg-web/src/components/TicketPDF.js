import React from 'react';
import { QRCodeCanvas } from 'qrcode.react';

export default function TicketPDF({ ticket, ticketRef }) {
  if (!ticket) return null;

  return (
    <div 
      ref={ticketRef}
      style={{
        position: 'absolute',
        top: '-10000px',
        left: '-10000px',
        width: '800px',
        height: '350px',
        background: '#ffffff', // Clean white background
        borderRadius: '24px',
        display: 'flex',
        color: '#0F172A', // Dark text for contrast
        fontFamily: 'system-ui, -apple-system, sans-serif',
        overflow: 'hidden',
        boxShadow: '0 0 0 4px #059669', // Emerald border effect
      }}
    >
      {/* Left Main Section */}
      <div style={{ flex: '1', padding: '40px', position: 'relative', background: 'linear-gradient(to right, #ffffff, #F8FAFC)' }}>
        {/* VIP Watermark */}
        <div style={{ position: 'absolute', top: '40px', right: '40px', fontSize: '130px', fontWeight: '900', color: 'rgba(5, 150, 105, 0.05)', pointerEvents: 'none', letterSpacing: '-5px' }}>
          VIP
        </div>
        
        <h3 style={{ margin: '0 0 8px 0', fontSize: '14px', color: '#059669', letterSpacing: '2px', textTransform: 'uppercase', fontWeight: '700' }}>
          Official Masterclass Pass
        </h3>
        <h1 style={{ margin: '0 0 30px 0', fontSize: '32px', fontWeight: '800', lineHeight: '1.2', maxWidth: '450px', color: '#111827' }}>
          {ticket.seminarId?.title || 'Exclusive Masterclass'}
        </h1>
        
        <div style={{ display: 'flex', gap: '50px' }}>
          <div>
            <p style={{ margin: '0 0 5px 0', fontSize: '12px', color: '#64748B', textTransform: 'uppercase', fontWeight: '600' }}>Attendee</p>
            <p style={{ margin: '0', fontSize: '20px', fontWeight: '700', color: '#0F172A' }}>{ticket.registrationData?.name}</p>
          </div>
          <div>
            <p style={{ margin: '0 0 5px 0', fontSize: '12px', color: '#64748B', textTransform: 'uppercase', fontWeight: '600' }}>Date & Time</p>
            <p style={{ margin: '0', fontSize: '20px', fontWeight: '700', color: '#0F172A' }}>
              {new Date(ticket.seminarId?.date).toLocaleDateString()} &middot; {ticket.seminarId?.time}
            </p>
          </div>
        </div>
        
        <div style={{ marginTop: '35px' }}>
          <p style={{ margin: '0 0 5px 0', fontSize: '12px', color: '#64748B', textTransform: 'uppercase', fontWeight: '600' }}>Venue</p>
          <p style={{ margin: '0', fontSize: '16px', fontWeight: '600', color: '#334155', maxWidth: '450px' }}>
            📍 {ticket.seminarId?.locationAddress}
          </p>
        </div>
      </div>

      {/* Perforated Divider */}
      <div style={{ 
        width: '4px', 
        background: 'linear-gradient(to bottom, transparent 50%, #CBD5E1 50%)',
        backgroundSize: '4px 16px',
        height: '100%'
      }}></div>

      {/* Right Stub Section */}
      <div style={{ width: '250px', background: '#F1F5F9', padding: '40px 30px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
        
        <div style={{ background: 'white', padding: '12px', borderRadius: '12px', marginBottom: '20px', boxShadow: '0 4px 6px rgba(0,0,0,0.05)' }}>
          <QRCodeCanvas 
            value={`${typeof window !== 'undefined' ? window.location.origin : 'https://asg.com'}/ticket/${ticket.ticketNumber}`} 
            size={120} 
            bgColor={"#ffffff"}
            fgColor={"#000000"}
            level={"Q"}
            includeMargin={false}
          />
        </div>
        
        <p style={{ margin: '0 0 5px 0', fontSize: '12px', color: '#64748B', textTransform: 'uppercase', letterSpacing: '1px', fontWeight: '600' }}>Ticket No.</p>
        <p style={{ margin: '0', fontSize: '20px', fontWeight: '800', letterSpacing: '2px', fontFamily: 'monospace', color: '#0F172A' }}>
          {ticket.ticketNumber}
        </p>
        
        <div style={{ marginTop: '20px', padding: '6px 16px', background: '#059669', borderRadius: '99px', fontSize: '13px', fontWeight: '700', color: 'white', letterSpacing: '1px' }}>
          VERIFIED
        </div>
      </div>
    </div>
  );
}
