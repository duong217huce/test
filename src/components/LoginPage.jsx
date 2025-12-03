import { useState, useEffect, useCallback } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { colors } from '../theme/colors';
import { showToast } from '../utils/toast';

export default function LoginPage() {
  const navigate = useNavigate();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);

  const handleGoogleSignIn = useCallback(async (response) => {
    setGoogleLoading(true);
    try {
      const res = await fetch('http://localhost:5000/api/auth/google', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tokenId: response.credential })
      });

      const data = await res.json();

      if (res.ok) {
        // Save login info
        localStorage.setItem('isLoggedIn', 'true');
        localStorage.setItem('token', data.token);
        localStorage.setItem('userId', data.user._id || data.user.id);
        localStorage.setItem('username', data.user.username);
        localStorage.setItem('fullName', data.user.fullName || '');
        
        if (data.user.avatarUrl) {
          localStorage.setItem('avatarUrl', data.user.avatarUrl);
        }
        
        localStorage.setItem('user', JSON.stringify(data.user));
        
        const isAdmin = data.user.role === 'admin';
        localStorage.setItem('isAdmin', isAdmin ? 'true' : 'false');
        localStorage.setItem('userRole', data.user.role || 'user');

        showToast('Đăng nhập Google thành công!', 'success');
        
        setTimeout(() => {
          if (isAdmin) {
            navigate('/admin');
          } else {
            navigate('/');
          }
        }, 500);
      } else {
        showToast(data.message || 'Đăng nhập Google thất bại', 'error');
      }
    } catch (error) {
      console.error('❌ Google login error:', error);
      showToast('Có lỗi xảy ra khi đăng nhập Google', 'error');
    } finally {
      setGoogleLoading(false);
    }
  }, [navigate]);

  // Load Google Sign-In script
  useEffect(() => {
    const script = document.createElement('script');
    script.src = 'https://accounts.google.com/gsi/client';
    script.async = true;
    script.defer = true;
    script.onload = () => {
      if (window.google && window.google.accounts) {
        const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;
        if (clientId && clientId !== 'YOUR_GOOGLE_CLIENT_ID') {
          window.google.accounts.id.initialize({
            client_id: clientId,
            callback: handleGoogleSignIn,
          });
        }
      }
    };
    document.head.appendChild(script);

    return () => {
      // Cleanup
      const existingScript = document.querySelector('script[src="https://accounts.google.com/gsi/client"]');
      if (existingScript) {
        document.head.removeChild(existingScript);
      }
    };
  }, [handleGoogleSignIn]);

  const handleGoogleButtonClick = () => {
    if (window.google && window.google.accounts) {
      window.google.accounts.id.prompt();
    } else {
      showToast('Google Sign-In đang tải, vui lòng thử lại sau', 'warning');
    }
  };

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
        localStorage.setItem('userId', data.user._id || data.user.id);
        localStorage.setItem('username', data.user.username);
        // Coins is already saved in user object, no need to save separately
        localStorage.setItem('fullName', data.user.fullName || '');
        
        // ✅ Lưu avatar URL nếu có
        if (data.user.avatarUrl) {
          localStorage.setItem('avatarUrl', `http://localhost:5000${data.user.avatarUrl}`);
        }
        
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
              onFocus={(e) => e.target.style.borderColor = colors.button}
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
              onFocus={(e) => e.target.style.borderColor = colors.button}
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
              background: loading ? colors.text2 : colors.button,
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
            color: colors.text2,
            marginBottom: '20px'
          }}>
            Chưa có tài khoản?{' '}
            <Link
              to="/register"
              style={{
                color: colors.button,
                textDecoration: 'none',
                fontWeight: '600',
                transition: 'color 0.2s'
              }}
              onMouseOver={(e) => e.target.style.color = colors.buttonHover}
              onMouseOut={(e) => e.target.style.color = colors.button}
            >
              Đăng ký ngay
            </Link>
          </div>
        </form>

        {/* Divider */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          margin: '24px 0',
          color: colors.text2
        }}>
          <div style={{ flex: 1, height: '1px', background: colors.background3 }}></div>
          <span style={{ padding: '0 16px', fontSize: '14px' }}>hoặc</span>
          <div style={{ flex: 1, height: '1px', background: colors.background3 }}></div>
        </div>

        {/* Google Sign-In Button */}
        <button
          type="button"
          onClick={handleGoogleButtonClick}
          disabled={googleLoading}
          style={{
            width: '100%',
            padding: '12px',
            background: '#fff',
            color: '#333',
            border: `1px solid ${colors.background3}`,
            borderRadius: '8px',
            fontSize: '15px',
            fontWeight: '500',
            fontFamily: 'Montserrat',
            cursor: googleLoading ? 'not-allowed' : 'pointer',
            transition: 'all 0.3s ease',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '12px',
            marginBottom: '16px',
            boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
          }}
          onMouseEnter={(e) => {
            if (!googleLoading) {
              e.target.style.boxShadow = '0 4px 8px rgba(0,0,0,0.15)';
              e.target.style.transform = 'translateY(-2px)';
            }
          }}
          onMouseLeave={(e) => {
            e.target.style.boxShadow = '0 2px 4px rgba(0,0,0,0.1)';
            e.target.style.transform = 'translateY(0)';
          }}
        >
          {googleLoading ? (
            <>
              <div style={{
                width: '20px',
                height: '20px',
                border: '3px solid #f3f3f3',
                borderTop: '3px solid #4285f4',
                borderRadius: '50%',
                animation: 'spin 1s linear infinite'
              }}></div>
              <span>Đang xử lý...</span>
            </>
          ) : (
            <>
              <svg width="20" height="20" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
              <span>Đăng nhập với Google</span>
            </>
          )}
        </button>

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