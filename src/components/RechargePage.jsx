import React from 'react';
import { useNavigate } from 'react-router-dom';
import Header from './Header';

export default function RechargePage() {
  const navigate = useNavigate();

  return (
    <div style={{ minHeight: '100vh', background: '#fffffe', fontFamily: 'Arial, sans-serif' }}>
      <Header />
      <div style={{ height: '130px' }}></div>
      
      <div style={{ maxWidth: '600px', margin: '0 auto', padding: '20px' }}>
        <div style={{
          background: '#fff',
          borderRadius: '12px',
          padding: '40px',
          boxShadow: '0 2px 12px rgba(0,0,0,0.08)',
          textAlign: 'center'
        }}>
          <h1 style={{ color: '#133a5c', marginBottom: '20px' }}>💳 Nạp tiền</h1>
          
          <p style={{ color: '#2d4a67', fontSize: '16px', marginBottom: '30px' }}>
            Chức năng nạp tiền đang được phát triển.
          </p>

          <button
            onClick={() => navigate(-1)}
            style={{
              padding: '12px 30px',
              background: '#4ba3d6',
              color: '#fff',
              border: 'none',
              borderRadius: '8px',
              fontSize: '16px',
              fontWeight: 'bold',
              cursor: 'pointer'
            }}
          >
            ← Quay lại
          </button>
        </div>
      </div>
    </div>
  );
}
