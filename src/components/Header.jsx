import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';

const menuItems = [
  'Giáo dục phổ thông',
  'Tài liệu chuyên môn',
  'Văn học - Truyện chữ',
  'Văn mẫu - Biểu mẫu',
  'Luận văn - Báo Cáo',
  'Ôn tập trắc nghiệm'
];

const menuRoutes = {
  'Giáo dục phổ thông': '/category/Giáo dục phổ thông',
  'Tài liệu chuyên môn': '/category/Tài liệu chuyên môn',
  'Văn học - Truyện chữ': '/category/Văn học - Truyện chữ',
  'Văn mẫu - Biểu mẫu': '/category/Văn mẫu - Biểu mẫu',
  'Luận văn - Báo Cáo': '/category/Luận văn - Báo Cáo',
  'Ôn tập trắc nghiệm': '/category/Ôn tập trắc nghiệm'
};

const menuDropdowns = {
  'Giáo dục phổ thông': {
    'Tiểu học': ['Lớp 1', 'Lớp 2', 'Lớp 3', 'Lớp 4', 'Lớp 5'],
    'THCS': ['Lớp 6', 'Lớp 7', 'Lớp 8', 'Lớp 9', 'Ôn thi THCS'],
    'THPT': ['Lớp 10', 'Lớp 11', 'Lớp 12', 'Ôn thi đại học', 'Ôn thi THPT'],
    'Đại học': ['Tài liệu']
  },
  'Tài liệu chuyên môn': {
    'Kinh tế': ['Tài chính', 'Kế toán', 'Marketing', 'Quản trị'],
    'Công nghệ': ['Lập trình', 'Mạng máy tính', 'An ninh mạng', 'AI/ML'],
    'Y học': ['Nội khoa', 'Ngoại khoa', 'Dược học'],
    'Khác': ['Luật', 'Kiến trúc', 'Nông nghiệp']
  },
  'Văn học - Truyện chữ': {
    'Văn học Việt Nam': ['Thơ', 'Truyện ngắn', 'Tiểu thuyết', 'Văn xuôi'],
    'Văn học nước ngoài': ['Châu Âu', 'Châu Á', 'Châu Mỹ'],
    'Truyện': ['Truyện tranh', 'Light novel', 'Truyện teen'],
    'Thể loại khác': ['Trinh thám', 'Kinh dị', 'Lãng mạn']
  },
  'Văn mẫu - Biểu mẫu': {
    'Văn mẫu': ['Tả người', 'Tả cảnh', 'Nghị luận', 'Thuyết minh'],
    'Biểu mẫu hành chính': ['Đơn xin việc', 'Sơ yếu lý lịch', 'Giấy ủy quyền'],
    'Biểu mẫu học tập': ['Đơn xin nghỉ học', 'Đơn xin chuyển trường'],
    'Mẫu khác': ['Hợp đồng', 'Giấy tờ pháp lý']
  },
  'Luận văn - Báo Cáo': {
    'Luận văn': ['Cử nhân', 'Thạc sĩ', 'Tiến sĩ'],
    'Báo cáo': ['Thực tập', 'Nghiên cứu', 'Tiểu luận'],
    'Đề tài': ['Khoa học tự nhiên', 'Khoa học xã hội'],
    'Tài liệu tham khảo': ['Cách viết', 'Format', 'Trích dẫn']
  },
  'Ôn tập trắc nghiệm': {
    'THPT Quốc gia': ['Toán', 'Văn', 'Anh', 'Lý', 'Hóa', 'Sinh'],
    'Đại học': ['Đề thi thử', 'Luyện thi'],
    'Chứng chỉ': ['TOEIC', 'IELTS', 'HSK', 'JLPT'],
    'Thi công chức': ['Luật', 'Hành chính', 'Kinh tế']
  }
};

export default function Header() {
  const navigate = useNavigate();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [username, setUsername] = useState('');
  const [userCoins, setUserCoins] = useState(0);
  const [showDropdown, setShowDropdown] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState(null);
  const userMenuRef = useRef(null);

  // State cho tìm kiếm
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const searchRef = useRef(null);

  useEffect(() => {
    const loggedIn = localStorage.getItem('isLoggedIn') === 'true';
    const admin = localStorage.getItem('isAdmin') === 'true';
    const user = localStorage.getItem('username') || '';
    const coins = localStorage.getItem('userCoins') || '0';
    
    setIsLoggedIn(loggedIn);
    setIsAdmin(admin);
    setUsername(user);
    setUserCoins(parseInt(coins));
  }, []);

  // Debounce search
  useEffect(() => {
    if (searchQuery.trim() === '') {
      setSearchResults([]);
      setShowSuggestions(false);
      return;
    }

    setIsSearching(true);
    const timer = setTimeout(() => {
      fetchSearchResults();
    }, 300);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Đóng suggestions khi click bên ngoài
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const fetchSearchResults = async () => {
    try {
      const res = await fetch(
        `http://localhost:5000/api/documents/search?q=${encodeURIComponent(searchQuery)}&limit=5`
      );
      const data = await res.json();
      setSearchResults(data);
      setShowSuggestions(true);
      setIsSearching(false);
    } catch (err) {
      console.error('❌ Error searching:', err);
      setIsSearching(false);
    }
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      setShowSuggestions(false);
      navigate(`/search?q=${encodeURIComponent(searchQuery)}`);
    }
  };

  const handleSuggestionClick = (docId) => {
    setShowSuggestions(false);
    setSearchQuery('');
    navigate(`/document/${docId}`);
  };

  const handleLogout = () => {
    localStorage.clear();
    setIsLoggedIn(false);
    setIsAdmin(false);
    setUsername('');
    setUserCoins(0);
    setShowDropdown(false);
    navigate('/');
  };

  const handleProtectedAction = (actionName) => {
    if (!isLoggedIn) {
      alert(`Bạn cần đăng nhập để sử dụng chức năng ${actionName}!`);
    }
  };

  const handleSubItemClick = (subItem) => {
    navigate(`/category/${subItem}`);
    setActiveDropdown(null);
  };

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      zIndex: 1000,
      background: '#eafcff',
      boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
    }}>
      {/* Header chính */}
      <header style={{
        display: 'flex',
        alignItems: 'center',
        padding: '18px 0',
        maxWidth: '1200px',
        margin: '0 auto',
        paddingLeft: '16px',
        paddingRight: '16px'
      }}>
        {/* Logo */}
        <Link 
          to="/" 
          style={{ 
            color: '#e84c61', 
            fontWeight: 'bold', 
            fontSize: '22px', 
            marginRight: '32px', 
            textDecoration: 'none',
            transition: 'transform 0.2s'
          }}
          onMouseOver={(e) => e.currentTarget.style.transform = 'scale(1.05)'}
          onMouseOut={(e) => e.currentTarget.style.transform = 'scale(1)'}
        >
          📚 EDUCONNECT
        </Link>

        {/* Search Box */}
        <div style={{ flex: 1, position: 'relative' }} ref={searchRef}>
          <form onSubmit={handleSearchSubmit} style={{ position: 'relative' }}>
            <input
              type="text"
              placeholder="Tìm kiếm tài liệu..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onFocus={() => searchResults.length > 0 && setShowSuggestions(true)}
              style={{
                height: '36px',
                width: '100%',
                maxWidth: '400px',
                fontSize: '15px',
                borderRadius: '20px',
                border: '1px solid #ccc',
                paddingLeft: '18px',
                paddingRight: '45px',
                outline: 'none'
              }}
            />
            <button
              type="submit"
              style={{
                position: 'absolute',
                right: '8px',
                top: '50%',
                transform: 'translateY(-50%)',
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                fontSize: '20px',
                padding: '5px'
              }}
            >
              🔍
            </button>
          </form>

          {/* Search Suggestions */}
          {showSuggestions && searchResults.length > 0 && (
            <div style={{
              position: 'absolute',
              top: '100%',
              left: 0,
              right: 0,
              marginTop: '8px',
              background: '#fff',
              borderRadius: '10px',
              boxShadow: '0 6px 25px rgba(0,0,0,0.15)',
              maxHeight: '400px',
              maxWidth: '400px',
              overflowY: 'auto',
              zIndex: 1001
            }}>
              {searchResults.map((doc) => (
                <div
                  key={doc._id}
                  onClick={() => handleSuggestionClick(doc._id)}
                  style={{
                    padding: '12px 16px',
                    borderBottom: '1px solid #eee',
                    cursor: 'pointer',
                    transition: 'background 0.2s',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px'
                  }}
                  onMouseOver={(e) => e.currentTarget.style.background = '#f5f5f5'}
                  onMouseOut={(e) => e.currentTarget.style.background = '#fff'}
                >
                  <div style={{ fontSize: '20px' }}>📄</div>
                  <div style={{ flex: 1, textAlign: 'left' }}>
                    <div style={{ fontWeight: 'bold', color: '#133a5c', fontSize: '14px', marginBottom: '3px' }}>
                      {doc.title}
                    </div>
                    <div style={{ fontSize: '12px', color: '#666' }}>
                      {doc.category} • {doc.views || 0} lượt xem
                    </div>
                  </div>
                  <div style={{ fontSize: '18px', color: '#4ba3d6' }}>→</div>
                </div>
              ))}
            </div>
          )}

          {isSearching && (
            <div style={{
              position: 'absolute',
              top: '100%',
              left: 0,
              marginTop: '8px',
              background: '#fff',
              borderRadius: '10px',
              padding: '15px',
              maxWidth: '400px',
              boxShadow: '0 6px 25px rgba(0,0,0,0.15)',
              color: '#666',
              fontSize: '14px'
            }}>
              Đang tìm kiếm...
            </div>
          )}
        </div>

        {/* Navigation */}
        <nav style={{ 
          display: 'flex', 
          gap: '24px', 
          marginLeft: '40px', 
          fontSize: '16px', 
          alignItems: 'center' 
        }}>
          <Link 
            to="/upload"
            onClick={(e) => {
              if (!isLoggedIn) {
                e.preventDefault();
                handleProtectedAction('Upload');
              }
            }}
            style={{ 
              textDecoration: 'none', 
              color: '#133a5c', 
              fontWeight: '500',
              transition: 'color 0.2s'
            }}
            onMouseOver={(e) => e.currentTarget.style.color = '#e84c61'}
            onMouseOut={(e) => e.currentTarget.style.color = '#133a5c'}
          >
            📤 Upload
          </Link>
          
          {isAdmin ? (
            <Link
              to="/admin"
              style={{
                padding: '7px 18px',
                borderRadius: '20px',
                background: '#fff3cd',
                border: '2px solid #ffc107',
                color: '#ff8c00',
                fontWeight: 'bold',
                fontSize: '14px',
                textDecoration: 'none',
                whiteSpace: 'nowrap'
              }}
            >
              📊 Quản lý
            </Link>
          ) : (
            isLoggedIn && (
              <div 
                onClick={() => navigate('/recharge')}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '6px 16px',
                  background: '#fff3cd',
                  borderRadius: '20px',
                  border: '2px solid #ffc107',
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                  whiteSpace: 'nowrap'
                }}
                onMouseOver={(e) => {
                  e.currentTarget.style.background = '#ffc107';
                  e.currentTarget.style.transform = 'scale(1.05)';
                }}
                onMouseOut={(e) => {
                  e.currentTarget.style.background = '#fff3cd';
                  e.currentTarget.style.transform = 'scale(1)';
                }}
                title="Nhấn để nạp tiền"
              >
                <span style={{ fontSize: '16px' }}>🪙</span>
                <span style={{ fontWeight: 'bold', color: '#856404', fontSize: '14px' }}>
                  {userCoins} DP
                </span>
              </div>
            )
          )}

          <Link 
            to="/saved"
            onClick={(e) => {
              if (!isLoggedIn) {
                e.preventDefault();
                handleProtectedAction('Saved');
              }
            }}
            style={{ 
              textDecoration: 'none', 
              color: '#133a5c', 
              fontWeight: '500',
              transition: 'color 0.2s',
              whiteSpace: 'nowrap'
            }}
            onMouseOver={(e) => e.currentTarget.style.color = '#e84c61'}
            onMouseOut={(e) => e.currentTarget.style.color = '#133a5c'}
          >
            🔖 Đã lưu
          </Link>
          
          {isLoggedIn ? (
            <div
              style={{ position: 'relative', display: 'inline-block' }}
              ref={userMenuRef}
            >
              <span
                style={{
                  display: 'inline-block',
                  width: 38,
                  height: 38,
                  borderRadius: '50%',
                  background: (localStorage.getItem('avatarUrl') ?
                    `url(${localStorage.getItem('avatarUrl')}) center/cover no-repeat`
                    : '#4ba3d6'
                  ),
                  color: '#fff',
                  fontWeight: 'bold',
                  fontSize: '18px',
                  textAlign: 'center',
                  verticalAlign: 'middle',
                  lineHeight: '38px',
                  cursor: 'pointer',
                  border: '2px solid #fff',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.06)'
                }}
                onClick={() => setShowDropdown(prev => !prev)}
                title={username}
              >
                {!localStorage.getItem('avatarUrl') && (username ? username[0].toUpperCase() : 'U')}
              </span>
              {showDropdown && (
                <div style={{
                  position: 'absolute',
                  top: '110%',
                  right: 0,
                  background: '#fff',
                  border: '1px solid #ddd',
                  borderRadius: '8px',
                  marginTop: '8px',
                  minWidth: '180px',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                  zIndex: 1000
                }}>
                  <div style={{ padding: '12px 16px', borderBottom: '1px solid #eee', color: '#133a5c', fontWeight: 'bold' }}>
                    {username}
                  </div>
                  <Link to="/profile" style={{
                    display: 'block',
                    padding: '12px 16px',
                    textDecoration: 'none',
                    color: '#133a5c',
                    borderBottom: '1px solid #eee',
                    transition: 'background 0.2s'
                  }}
                    onClick={() => setShowDropdown(false)}
                    onMouseOver={e => e.currentTarget.style.background = '#f5f5f5'}
                    onMouseOut={e => e.currentTarget.style.background = 'transparent'}
                  >📋 Hồ sơ</Link>
                  <button
                    onClick={handleLogout}
                    style={{
                      width: '100%',
                      padding: '12px 16px',
                      textAlign: 'left',
                      background: 'none',
                      border: 'none',
                      cursor: 'pointer',
                      color: '#e84c61',
                      fontSize: '16px',
                      fontFamily: 'inherit',
                      transition: 'background 0.2s'
                    }}
                    onMouseOver={e => e.target.style.background = '#f5f5f5'}
                    onMouseOut={e => e.target.style.background = 'transparent'}
                  >🚪 Đăng xuất
                  </button>
                </div>
              )}
            </div>
          ) : (
            <Link 
              to="/login" 
              style={{ 
                textDecoration: 'none', 
                color: '#133a5c', 
                fontWeight: '500',
                transition: 'color 0.2s'
              }}
              onMouseOver={(e) => e.currentTarget.style.color = '#e84c61'}
              onMouseOut={(e) => e.currentTarget.style.color = '#133a5c'}
            >
              🔐 Đăng nhập
            </Link>
          )}
        </nav>
      </header>
      
      {/* Menu Categories */}
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        gap: '36px',
        padding: '12px 0',
        fontSize: '15px',
        fontWeight: '600',
        color: '#133a5c',
        background: '#eafcff',
        borderTop: '1px solid #d0e8f0'
      }}>
        {menuItems.map(item => (
          <div
            key={item}
            style={{ 
              position: 'relative', 
              display: 'inline-block',
              paddingBottom: '12px'
            }}
            onMouseEnter={() => setActiveDropdown(item)}
            onMouseLeave={() => setActiveDropdown(null)}
          >
            <Link 
              to={menuRoutes[item]} 
              style={{ 
                cursor: 'pointer',
                textDecoration: 'none',
                color: 'inherit',
                transition: 'color 0.2s'
              }}
              onMouseOver={(e) => e.currentTarget.style.color = '#e84c61'}
              onMouseOut={(e) => e.currentTarget.style.color = '#133a5c'}
            >
              {item}
            </Link>
            
            {activeDropdown === item && menuDropdowns[item] && (
              <div style={{
                position: 'absolute',
                top: '100%',
                left: menuItems.indexOf(item) >= 3 ? 'auto' : 0,
                right: menuItems.indexOf(item) >= 3 ? 0 : 'auto',
                background: '#fff',
                border: '1px solid #ddd',
                borderRadius: '8px',
                marginTop: '0px',
                padding: '20px',
                minWidth: '600px',
                boxShadow: '0 4px 16px rgba(0,0,0,0.15)',
                zIndex: 2000,
                display: 'flex',
                gap: '30px'
              }}>
                {Object.entries(menuDropdowns[item]).map(([category, items]) => (
                  <div key={category} style={{ flex: 1 }}>
                    <div style={{
                      fontWeight: 'bold',
                      marginBottom: '12px',
                      color: '#133a5c',
                      fontSize: '14px'
                    }}>
                      {category}
                    </div>
                    {items.map(subItem => (
                      <div
                        key={subItem}
                        style={{
                          padding: '8px 0',
                          cursor: 'pointer',
                          color: '#2d4a67',
                          fontSize: '13px',
                          fontWeight: 'normal',
                          transition: 'color 0.2s'
                        }}
                        onClick={() => handleSubItemClick(subItem)}
                        onMouseOver={(e) => e.currentTarget.style.color = '#e84c61'}
                        onMouseOut={(e) => e.currentTarget.style.color = '#2d4a67'}
                      >
                        {subItem}
                      </div>
                    ))}
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
