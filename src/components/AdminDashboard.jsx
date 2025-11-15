import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from './Header';

export default function AdminDashboard() {
  const navigate = useNavigate();
  useEffect(() => {
    const storedAdmin = localStorage.getItem('isAdmin') === 'true';
    if (!storedAdmin) {
      alert('Bạn không có quyền truy cập trang này!');
      navigate('/');
    }
  }, [navigate]);
  return (
    <div style={{ minHeight: '100vh', background: '#f3f7fb' }}>
      <Header />
      <div style={{ height: '130px' }} />
      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '32px' }}>
        <h1 style={{ color: '#133a5c', fontSize: '32px', marginBottom: '30px', fontWeight: 'bold' }}>
          Quản lý - Thống kê (Trang Admin)
        </h1>
        <p>Chào <b>admin</b>! Đây là bộ công cụ dành riêng cho quản trị viên.</p>
        {/* Thêm các tool quản lý, thống kê ... tại đây */}
      </div>
    </div>
  );
}
