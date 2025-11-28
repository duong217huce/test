import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { colors } from '../theme/colors';
import { showToast } from '../utils/toast';

export default function LoginPage() {
  const navigate = useNavigate();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    
    if (!username.trim() || !password.trim()) {
      showToast('Vui lòng nhập đầy đủ thông tin', 'warning');
      return;
    }

    setLoading(true);
    
    try {
      const response = await fetch('http://localhost:5000/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
      });

      const data = await response.json();

      if (response.ok) {
        // ✅ Lưu thông tin đăng nhập
        localStorage.setItem('isLoggedIn', 'true');
        localStorage.setItem('token', data.token);
        localStorage.setItem('userId', data.user._id);
        localStorage.setItem('username', data.user.username);
        localStorage.setItem('userCoins', data.user.coins || 0);
        
        // ✅ Lưu thông tin user đầy đủ
        localStorage.setItem('user', JSON.stringify(data.user));
        
        // ✅ Kiểm tra và lưu role admin
        const isAdmin = data.user.role === 'admin';
        localStorage.setItem('isAdmin', isAdmin ? 'true' : 'false');
        localStorage.setItem('userRole', data.user.role || 'user');
        
        console.log('✅ Login successful:', {
          username: data.user.username,
          role: data.user.role,
          isAdmin
        });
        
        showToast('Đăng nhập thành công!', 'success');
        
        // ✅ Redirect dựa vào role
        setTimeout(() => {
          if (isAdmin) {
            navigate('/admin');
          } else {
            navigate('/');
          }
        }, 500);
        
      } else {
        showToast(data.message || 'Đăng nhập thất bại', 'error');
      }
    } catch (error) {
      console.error('❌ Login error:', error);
      showToast('Có lỗi xảy ra khi đăng nhập', 'error');
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
      fontFamily: 'Montserrat'
    }}>
      <div style={{
        width: '100%',
        maxWidth: '440px',
        padding: '40px',
        background: colors.background2,
        borderRadius: '16px',
        boxShadow: '0 8px 32px rgba(0,0,0,0.08)',
        border: `1px solid ${colors.background3}`
      }}>
        {/* Logo/Title */}
        <div style={{
          textAlign: 'center',
          marginBottom: '40px'
        }}>
          <h1 style={{
            color: colors.text,
            fontSize: '32px',
            fontWeight: '700',
            marginBottom: '8px',
            letterSpacing: '-0.5px'
          }}>
            EDUCONNECT
          </h1>
          <p style={{
            color: colors.text2,
            fontSize: '14px',
            fontWeight: '500'
          }}>
            Đăng nhập vào tài khoản của bạn
          </p>
        </div>

        {/* Login Form */}
        <form onSubmit={handleLogin}>
          {/* Username */}
          <div style={{ marginBottom: '20px' }}>
            <label style={{
              display: 'block',
              color: colors.text,
              fontSize: '14px',
              fontWeight: '600',
              marginBottom: '8px'
            }}>
              Tên đăng nhập
            </label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Nhập tên đăng nhập"
              disabled={loading}
              style={{
                width: '100%',
                padding: '12px 16px',
                fontSize: '14px',
                border: `1px solid ${colors.background3}`,
                borderRadius: '8px',
                outline: 'none',
                fontFamily: 'Montserrat',
                background: colors.background3,
                color: colors.text,
                transition: 'all 0.2s',
                boxSizing: 'border-box'
              }}
              onFocus={(e) => e.target.style.borderColor = colors.accent2}
              onBlur={(e) => e.target.style.borderColor = colors.background3}
            />
          </div>

          {/* Password */}
          <div style={{ marginBottom: '24px' }}>
            <label style={{
              display: 'block',
              color: colors.text,
              fontSize: '14px',
              fontWeight: '600',
              marginBottom: '8px'
            }}>
              Mật khẩu
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Nhập mật khẩu"
              disabled={loading}
              style={{
                width: '100%',
                padding: '12px 16px',
                fontSize: '14px',
                border: `1px solid ${colors.background3}`,
                borderRadius: '8px',
                outline: 'none',
                fontFamily: 'Montserrat',
                background: colors.background3,
                color: colors.text,
                transition: 'all 0.2s',
                boxSizing: 'border-box'
              }}
              onFocus={(e) => e.target.style.borderColor = colors.accent2}
              onBlur={(e) => e.target.style.borderColor = colors.background3}
            />
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            style={{
              width: '100%',
              padding: '14px',
              background: loading ? colors.text2 : colors.accent2,
              color: colors.text,
              border: 'none',
              borderRadius: '8px',
              fontSize: '15px',
              fontWeight: '600',
              fontFamily: 'Montserrat',
              cursor: loading ? 'not-allowed' : 'pointer',
              transition: 'all 0.3s ease',
              marginBottom: '16px'
            }}
            onMouseEnter={(e) => {
              if (!loading) e.target.style.transform = 'translateY(-2px)';
            }}
            onMouseLeave={(e) => {
              e.target.style.transform = 'translateY(0)';
            }}
          >
            {loading ? 'Đang đăng nhập...' : 'Đăng nhập'}
          </button>

          {/* Register Link */}
          <div style={{
            textAlign: 'center',
            fontSize: '14px',
            color: colors.text2
          }}>
            Chưa có tài khoản?{' '}
            <Link
              to="/register"
              style={{
                color: colors.accent2,
                textDecoration: 'none',
                fontWeight: '600',
                transition: 'color 0.2s'
              }}
              onMouseOver={(e) => e.target.style.color = colors.accent3}
              onMouseOut={(e) => e.target.style.color = colors.accent2}
            >
              Đăng ký ngay
            </Link>
          </div>
        </form>

        {/* Back to Home */}
        <div style={{
          textAlign: 'center',
          marginTop: '24px',
          paddingTop: '24px',
          borderTop: `1px solid ${colors.background3}`
        }}>
          <Link
            to="/"
            style={{
              color: colors.text2,
              textDecoration: 'none',
              fontSize: '14px',
              fontWeight: '500',
              transition: 'color 0.2s'
            }}
            onMouseOver={(e) => e.target.style.color = colors.text}
            onMouseOut={(e) => e.target.style.color = colors.text2}
          >
            ← Quay về trang chủ
          </Link>
        </div>
      </div>
    </div>
  );
}
