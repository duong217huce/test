import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';

export default function LoginPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (!localStorage.getItem('adminInitialized')) {
      localStorage.setItem('adminUsername', 'admin');
      localStorage.setItem('adminPassword', '123');
      localStorage.setItem('adminInitialized', 'true');
    }
  }, []);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');

    const adminUser = localStorage.getItem('adminUsername') || 'admin';
    const adminPass = localStorage.getItem('adminPassword') || '123';

    if (username === adminUser && password === adminPass) {
      localStorage.setItem('isLoggedIn', 'true');
      localStorage.setItem('username', username);
      localStorage.setItem('userId', 'admin-local-id');
      localStorage.setItem('userRole', 'admin');
      localStorage.setItem('isAdmin', 'true');
      localStorage.setItem('fullName', 'Admin');
      localStorage.setItem('userCoins', '999999');
      
      const adminUserObj = {
        _id: 'admin-local-id',
        id: 'admin-local-id',
        username: username,
        fullName: 'Admin',
        role: 'admin',
        coins: 999999
      };
      localStorage.setItem('user', JSON.stringify(adminUserObj));
      
      alert('Đăng nhập admin thành công!');
      navigate('/');
      window.location.reload();
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
        console.log('✅ Login response:', data);

        if (!data.user) {
          setError('Dữ liệu người dùng không hợp lệ!');
          return;
        }

        // ✅ LƯU TOKEN
        localStorage.setItem('token', data.token || '');
        localStorage.setItem('isLoggedIn', 'true');
        
        // ✅ LƯU THÔNG TIN CƠ BẢN
        localStorage.setItem('username', data.user.username || '');
        localStorage.setItem('userId', data.user.id || data.user._id || '');
        localStorage.setItem('userRole', data.user.role || 'user');
        localStorage.setItem('isAdmin', (data.user.role === 'admin').toString());
        localStorage.setItem('fullName', data.user.fullName || '');
        localStorage.setItem('userCoins', (data.user.coins || 0).toString());
        
        // ✅ LƯU TOÀN BỘ OBJECT USER (quan trọng nhất!)
        localStorage.setItem('user', JSON.stringify(data.user));

        console.log('✅ User data saved to localStorage');
        console.log('📦 User object:', data.user);

        alert(`Chào mừng ${data.user.fullName || data.user.username}!`);
        navigate('/');
        window.location.reload();
      } else {
        setError(data.message || 'Đăng nhập thất bại!');
      }
    } catch (error) {
      console.error('❌ Login error:', error);
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

        {error && (
          <div style={{
            backgroundColor: '#ffebee',
            color: '#c62828',
            padding: '12px',
            borderRadius: '6px',
            marginBottom: '20px',
            fontSize: '14px',
            textAlign: 'center'
          }}>
            {error}
          </div>
        )}

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
            disabled={loading}
            style={{
              width: '100%',
              padding: '12px',
              background: loading ? '#ccc' : '#4ba3d6',
              color: '#fff',
              border: 'none',
              borderRadius: '6px',
              fontSize: '16px',
              fontWeight: 'bold',
              cursor: loading ? 'not-allowed' : 'pointer',
              marginBottom: '15px'
            }}
          >
            {loading ? 'Đang đăng nhập...' : 'Đăng nhập'}
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
