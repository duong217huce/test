import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';

export default function LoginPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();
  

  useEffect(() => {
    if (localStorage.getItem('isLoggedIn') === null) {
      localStorage.setItem('isLoggedIn', 'false');
    }
    if (!localStorage.getItem('adminInitialized')) {
      localStorage.setItem('adminUsername', 'admin');
      localStorage.setItem('adminPassword', '123');
      localStorage.setItem('adminInitialized', 'true');
    }
  }, []);

  const handleLogin = (e) => {
    e.preventDefault();

    const adminUser = localStorage.getItem('adminUsername') || 'admin';
    const adminPass = localStorage.getItem('adminPassword') || '123';

    if (username === adminUser && password === adminPass) {
      localStorage.setItem('isLoggedIn', 'true');
      localStorage.setItem('username', username);
      localStorage.setItem('isAdmin', 'true');
      alert('Đăng nhập admin thành công!');
      navigate('/');
      window.location.reload();
      return;
    }

    localStorage.setItem('isLoggedIn', 'true');
    localStorage.setItem('username', username);
    localStorage.setItem('isAdmin', 'false');
    alert('Đăng nhập thành công!');
    navigate('/');
    window.location.reload();
  };

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'linear-gradient(135deg, #eafcff 0%, #b4cbe0 100%)',
      fontFamily: 'Arial, sans-serif'
    }}>
      <div style={{
        background: '#fff',
        padding: '40px',
        borderRadius: '10px',
        boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
        width: '400px'
      }}>
        <h1 style={{ textAlign: 'center', color: '#e84c61', marginBottom: '10px', fontSize: '28px' }}>
          EDUCONNECT
        </h1>
        <h2 style={{ textAlign: 'center', color: '#133a5c', marginBottom: '30px', fontSize: '22px' }}>
          Đăng nhập
        </h2>
        <form onSubmit={handleLogin}>
          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', marginBottom: '8px', color: '#133a5c', fontSize: '14px' }}>
              Tên đăng nhập
            </label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              style={{
                width: '100%',
                padding: '12px',
                fontSize: '14px',
                border: '1px solid #ccc',
                borderRadius: '6px',
                outline: 'none',
                boxSizing: 'border-box'
              }}
              required
            />
          </div>
          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', marginBottom: '8px', color: '#133a5c', fontSize: '14px' }}>
              Mật khẩu
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              style={{
                width: '100%',
                padding: '12px',
                fontSize: '14px',
                border: '1px solid #ccc',
                borderRadius: '6px',
                outline: 'none',
                boxSizing: 'border-box'
              }}
              required
            />
          </div>
          <button
            type="submit"
            style={{
              width: '100%',
              padding: '12px',
              background: '#4ba3d6',
              color: '#fff',
              border: 'none',
              borderRadius: '6px',
              fontSize: '16px',
              fontWeight: 'bold',
              cursor: 'pointer',
              marginBottom: '15px'
            }}
          >
            Đăng nhập
          </button>
          <div style={{ textAlign: 'center', fontSize: '14px', color: '#666' }}>
            Chưa có tài khoản?{' '}
            <Link to="/register" style={{ color: '#4ba3d6', textDecoration: 'none', fontWeight: 'bold' }}>
              Đăng ký
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}
