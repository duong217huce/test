import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { colors } from '../theme/colors';

export default function RegisterPage() {
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleRegister = async (e) => {
    e.preventDefault();
    setError('');
    
    if (password !== confirmPassword) {
      setError('Mật khẩu không khớp!');
      return;
    }

    if (password.length < 6) {
      setError('Mật khẩu phải có ít nhất 6 ký tự!');
      return;
    }

    setLoading(true);

    try {
      const response = await fetch('http://localhost:5000/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username,
          email: email || `${username}@example.com`, // Nếu không nhập email thì tạo mặc định
          password,
          fullName,
          phone
        })
      });

      const data = await response.json();

      if (response.ok) {
        // Lưu thông tin cơ bản vào localStorage (tương thích với code cũ)
        localStorage.setItem('username', username);
        localStorage.setItem('fullName', fullName);
        localStorage.setItem('phone', phone);
        
        alert('Đăng ký tài khoản thành công!');
        navigate('/login');
      } else {
        setError(data.message || 'Đăng ký thất bại!');
      }
    } catch (error) {
      console.error('Lỗi:', error);
      setError('Không thể kết nối đến server!');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: colors.background,
      fontFamily: 'Montserrat, sans-serif',
      padding: '20px'
    }}>
      <div style={{
        background: colors.background,
        padding: '40px',
        borderRadius: '16px',
        boxShadow: '0 8px 32px rgba(0,0,0,0.08)',
        width: '100%',
        maxWidth: '440px',
        border: `1px solid ${colors.borderLight}`
      }}>
        <h1 style={{
          textAlign: 'center',
          color: colors.headline,
          marginBottom: '10px',
          fontSize: '32px',
          fontWeight: '700',
          letterSpacing: '-0.5px'
        }}>
          EDUCONNECT
        </h1>
        <h2 style={{
          textAlign: 'center',
          color: colors.text2,
          marginBottom: '30px',
          fontSize: '14px',
          fontWeight: '500'
        }}>
          Đăng ký tài khoản mới
        </h2>

        {error && (
          <div style={{
            backgroundColor: '#ffebee',
            color: colors.error,
            padding: '12px',
            borderRadius: '8px',
            marginBottom: '20px',
            fontSize: '14px',
            textAlign: 'center'
          }}>
            {error}
          </div>
        )}

        <form onSubmit={handleRegister}>
          {/* Họ và tên */}
          <div style={{ marginBottom: '20px' }}>
            <label style={{
              display: 'block',
              marginBottom: '8px',
              color: colors.headline,
              fontSize: '14px',
              fontWeight: '600'
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
                border: `1px solid ${colors.border}`,
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
              color: colors.headline,
              fontSize: '14px',
              fontWeight: '600'
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
                border: `1px solid ${colors.border}`,
                borderRadius: '6px',
                outline: 'none',
                boxSizing: 'border-box'
              }}
              required
            />
          </div>

          {/* Email (tùy chọn) */}
          <div style={{ marginBottom: '20px' }}>
            <label style={{
              display: 'block',
              marginBottom: '8px',
              color: colors.headline,
              fontSize: '14px',
              fontWeight: '600'
            }}>
              Email (tùy chọn)
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Ví dụ: email@example.com"
              style={{
                width: '100%',
                padding: '12px',
                fontSize: '14px',
                border: `1px solid ${colors.border}`,
                borderRadius: '6px',
                outline: 'none',
                boxSizing: 'border-box'
              }}
            />
          </div>

          {/* Tên đăng nhập */}
          <div style={{ marginBottom: '20px' }}>
            <label style={{
              display: 'block',
              marginBottom: '8px',
              color: colors.headline,
              fontSize: '14px',
              fontWeight: '600'
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
                border: `1px solid ${colors.border}`,
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
              color: colors.headline,
              fontSize: '14px',
              fontWeight: '600'
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
                border: `1px solid ${colors.border}`,
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
              color: colors.headline,
              fontSize: '14px',
              fontWeight: '600'
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
                border: `1px solid ${colors.border}`,
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
            disabled={loading}
            style={{
              width: '100%',
              padding: '12px',
              background: loading ? colors.border : colors.button,
              color: '#fff',
              border: 'none',
              borderRadius: '6px',
              fontSize: '16px',
              fontWeight: 'bold',
              cursor: loading ? 'not-allowed' : 'pointer',
              marginBottom: '15px'
            }}
          >
            {loading ? 'Đang đăng ký...' : 'Đăng ký'}
          </button>

          {/* Link đăng nhập */}
          <div style={{
            textAlign: 'center',
            fontSize: '14px',
            color: colors.text2
          }}>
            Đã có tài khoản?{' '}
            <Link to="/login" style={{
              color: colors.button,
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