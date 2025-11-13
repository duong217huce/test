import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

export default function RegisterPage() {
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const navigate = useNavigate();

  const handleRegister = (e) => {
    e.preventDefault();
    
    if (password !== confirmPassword) {
      alert('Mật khẩu không khớp!');
      return;
    }
    
    // Lưu thông tin đăng ký
    localStorage.setItem('isLoggedIn', 'true');
    localStorage.setItem('username', username);
    localStorage.setItem('fullName', fullName);
    localStorage.setItem('phone', phone);
    localStorage.setItem('userPoints', '0'); // Tài khoản mới = 0 DP
    
    alert('Đăng ký tài khoản thành công!');
    navigate('/');
  };

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'linear-gradient(135deg, #eafcff 0%, #b4cbe0 100%)',
      fontFamily: 'Arial, sans-serif',
      padding: '20px'
    }}>
      <div style={{
        background: '#fff',
        padding: '40px',
        borderRadius: '10px',
        boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
        width: '100%',
        maxWidth: '500px',
        border: '2px solid #133a5c'
      }}>
        <h1 style={{
          textAlign: 'center',
          color: '#e84c61',
          marginBottom: '10px',
          fontSize: '32px',
          fontWeight: 'bold'
        }}>
          EDUCONNECT
        </h1>
        <h2 style={{
          textAlign: 'center',
          color: '#133a5c',
          marginBottom: '30px',
          fontSize: '20px'
        }}>
          Đăng ký tài khoản
        </h2>

        <form onSubmit={handleRegister}>
          {/* Họ và tên */}
          <div style={{ marginBottom: '20px' }}>
            <label style={{
              display: 'block',
              marginBottom: '8px',
              color: '#133a5c',
              fontSize: '14px',
              fontWeight: '500'
            }}>
              Họ và tên
            </label>
            <input
              type="text"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="Ví dụ: Nguyễn Văn A"
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

          {/* Số điện thoại */}
          <div style={{ marginBottom: '20px' }}>
            <label style={{
              display: 'block',
              marginBottom: '8px',
              color: '#133a5c',
              fontSize: '14px',
              fontWeight: '500'
            }}>
              Số điện thoại
            </label>
            <input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="Ví dụ: 0912345678"
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

          {/* Tên đăng nhập */}
          <div style={{ marginBottom: '20px' }}>
            <label style={{
              display: 'block',
              marginBottom: '8px',
              color: '#133a5c',
              fontSize: '14px',
              fontWeight: '500'
            }}>
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

          {/* Mật khẩu */}
          <div style={{ marginBottom: '20px' }}>
            <label style={{
              display: 'block',
              marginBottom: '8px',
              color: '#133a5c',
              fontSize: '14px',
              fontWeight: '500'
            }}>
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

          {/* Xác nhận mật khẩu */}
          <div style={{ marginBottom: '25px' }}>
            <label style={{
              display: 'block',
              marginBottom: '8px',
              color: '#133a5c',
              fontSize: '14px',
              fontWeight: '500'
            }}>
              Xác nhận mật khẩu
            </label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
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

          {/* Nút đăng ký */}
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
            Đăng ký
          </button>

          {/* Link đăng nhập */}
          <div style={{
            textAlign: 'center',
            fontSize: '14px',
            color: '#666'
          }}>
            Đã có tài khoản?{' '}
            <Link to="/login" style={{
              color: '#4ba3d6',
              textDecoration: 'none',
              fontWeight: 'bold'
            }}>
              Đăng nhập
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}
