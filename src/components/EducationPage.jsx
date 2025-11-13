import React from 'react';
import { Link } from 'react-router-dom';

export default function EducationPage() {
  return (
    <div style={{
      minHeight: '100vh',
      background: '#fffffe',
      fontFamily: 'Arial, sans-serif',
      padding: '20px'
    }}>
      <div style={{
        maxWidth: '1200px',
        margin: '0 auto'
      }}>
        <Link to="/" style={{
          color: '#e84c61',
          textDecoration: 'none',
          fontSize: '16px',
          marginBottom: '20px',
          display: 'inline-block'
        }}>
          ← Quay lại trang chủ
        </Link>
        
        <h1 style={{
          color: '#133a5c',
          fontSize: '32px',
          marginBottom: '30px'
        }}>
          Giáo dục phổ thông
        </h1>
        
        <div style={{ color: '#2d4a67', fontSize: '16px' }}>
          <p>Nội dung trang Giáo dục phổ thông sẽ được hiển thị ở đây.</p>
        </div>
      </div>
    </div>
  );
}
