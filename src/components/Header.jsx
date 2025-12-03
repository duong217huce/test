import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { colors } from '../theme/colors';
import { showToast } from '../utils/toast';

const menuItems = [
  'Giáo dục phổ thông',
  'Tài liệu chuyên môn',
  'Văn học - Truyện chữ',
  'Văn mẫu - Biểu mẫu',
  'Luận văn - Báo Cáo',
  'Ôn tập trắc nghiệm'
];

const menuRoutes = {
  'Giáo dục phổ thông': '/category/education',
  'Tài liệu chuyên môn': '/category/professional',
  'Văn học - Truyện chữ': '/category/literature',
  'Văn mẫu - Biểu mẫu': '/category/templates',
  'Luận văn - Báo Cáo': '/category/thesis',
  'Ôn tập trắc nghiệm': '/quiz'
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
  }
};

export default function Header() {
  const navigate = useNavigate();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [username, setUsername] = useState('');
  const [coins, setCoins] = useState(0);
  const [showDropdown, setShowDropdown] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState(null);
  const userMenuRef = useRef(null);

  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const searchRef = useRef(null);

  useEffect(() => {
    const updateUserInfo = () => {
      const loggedIn = localStorage.getItem('isLoggedIn') === 'true';
      const admin = localStorage.getItem('isAdmin') === 'true';
      const user = localStorage.getItem('username') || '';
      const userData = JSON.parse(localStorage.getItem('user') || '{}');
      const coinsValue = userData.coins || 0;
      
      setIsLoggedIn(loggedIn);
      setIsAdmin(admin);
      setUsername(user);
      setCoins(coinsValue);
    };

    // Initial load
    updateUserInfo();

    // Listen for storage changes (when payment callback updates coins)
    const handleStorageChange = () => {
      updateUserInfo();
    };

    window.addEventListener('storage', handleStorageChange);
    
    // Also listen for custom event (for same-tab updates)
    window.addEventListener('coinsUpdated', handleStorageChange);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('coinsUpdated', handleStorageChange);
    };
  }, []);

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
      console.error('Error searching:', err);
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
    setCoins(0);
    setShowDropdown(false);
    showToast('Đã đăng xuất thành công', 'success');
    navigate('/');
  };

  const handleProtectedAction = (actionName) => {
    if (!isLoggedIn) {
      showToast(`Bạn cần đăng nhập để sử dụng chức năng ${actionName}`, 'warning');
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
      background: colors.background,
      boxShadow: '0 2px 8px rgba(9, 64, 103, 0.08)',
      borderBottom: `1px solid ${colors.borderLight}`
    }}>
      {/* Container chung - căn giữa */}
      <div style={{ 
        maxWidth: '1300px',
        margin: '0 auto',
        paddingLeft: '20px',
        paddingRight: '20px'
      }}>
        
        {/* Header chính */}
        <header style={{
          display: 'flex',
          alignItems: 'center',
          padding: '20px 0',
          justifyContent: 'space-between'
        }}>
          {/* Logo */}
          <Link 
            to="/" 
            style={{ 
              color: colors.headline,
              fontWeight: '800',
              fontSize: '20px',
              textDecoration: 'none',
              transition: 'color 0.2s',
              letterSpacing: '-0.5px',
              flexShrink: 0
            }}
            onMouseOver={(e) => e.currentTarget.style.color = colors.button}
            onMouseOut={(e) => e.currentTarget.style.color = colors.headline}
          >
            EDUCONNECT
          </Link>

          {/* Search Box */}
          <div style={{ flex: 1, position: 'relative', maxWidth: '500px', marginLeft: '32px', marginRight: '32px' }} ref={searchRef}>
            <form onSubmit={handleSearchSubmit} style={{ position: 'relative' }}>
              <input
                type="text"
                placeholder="Tìm kiếm tài liệu..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onFocus={(e) => {
                  if (searchResults.length > 0) setShowSuggestions(true);
                  e.currentTarget.style.borderColor = colors.button;
                  e.currentTarget.style.background = colors.background;
                }}
                onBlur={(e) => {
                  setTimeout(() => {
                    e.currentTarget.style.borderColor = colors.border;
                    e.currentTarget.style.background = colors.inputBg;
                  }, 200);
                }}
                style={{
                  height: '44px',
                  width: '100%',
                  fontSize: '14px',
                  borderRadius: '8px',
                  border: `1px solid ${colors.border}`,
                  paddingLeft: '16px',
                  paddingRight: '45px',
                  outline: 'none',
                  fontFamily: 'Montserrat, sans-serif',
                  background: colors.inputBg,
                  color: colors.paragraph,
                  transition: 'all 0.2s'
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
                  fontSize: '18px',
                  padding: '8px',
                  color: colors.button,
                  transition: 'color 0.2s'
                }}
                onMouseOver={(e) => e.currentTarget.style.color = colors.buttonHover}
                onMouseOut={(e) => e.currentTarget.style.color = colors.button}
              >
                🔍
              </button>
            </form>

            {/* Search Suggestions */}
            {showSuggestions && (
              <div style={{
                position: 'absolute',
                top: '100%',
                left: 0,
                right: 0,
                marginTop: '8px',
                background: colors.background,
                borderRadius: '8px',
                boxShadow: '0 8px 24px rgba(9, 64, 103, 0.12)',
                maxHeight: '400px',
                overflowY: 'auto',
                zIndex: 1001,
                border: `1px solid ${colors.borderLight}`
              }}>
                {searchResults.length > 0 ? (
                  searchResults.map((doc) => (
                    <div
                      key={doc._id}
                      onClick={() => handleSuggestionClick(doc._id)}
                      style={{
                        padding: '14px 16px',
                        borderBottom: `1px solid ${colors.borderLight}`,
                        cursor: 'pointer',
                        transition: 'background 0.2s',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '12px'
                      }}
                      onMouseOver={(e) => e.currentTarget.style.background = colors.inputBg}
                      onMouseOut={(e) => e.currentTarget.style.background = colors.background}
                    >
                      <div style={{ flex: 1, textAlign: 'left' }}>
                        <div style={{ 
                          fontWeight: '600', 
                          color: colors.headline, 
                          fontSize: '14px', 
                          marginBottom: '4px' 
                        }}>
                          {doc.title}
                        </div>
                        <div style={{ fontSize: '12px', color: colors.paragraph }}>
                          {doc.category} • {doc.views || 0} lượt xem
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div style={{
                    padding: '32px 16px',
                    textAlign: 'center',
                    color: colors.paragraph,
                    fontSize: '14px',
                    fontWeight: '500'
                  }}>
                    Không tìm thấy tài liệu
                  </div>
                )}
              </div>
            )}

            {isSearching && (
              <div style={{
                position: 'absolute',
                top: '100%',
                left: 0,
                marginTop: '8px',
                background: colors.background,
                borderRadius: '8px',
                padding: '16px',
                boxShadow: '0 8px 24px rgba(9, 64, 103, 0.12)',
                color: colors.paragraph,
                fontSize: '14px',
                border: `1px solid ${colors.borderLight}`
              }}>
                Đang tìm kiếm...
              </div>
            )}
          </div>

          {/* Navigation */}
          <nav style={{ 
            display: 'flex', 
            gap: '24px',
            fontSize: '14px', 
            alignItems: 'center',
            fontWeight: '600'
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
                color: colors.paragraph,
                transition: 'color 0.2s',
                whiteSpace: 'nowrap'
              }}
              onMouseOver={(e) => e.currentTarget.style.color = colors.button}
              onMouseOut={(e) => e.currentTarget.style.color = colors.paragraph}
            >
              Upload
            </Link>
            
            {isAdmin ? (
            <Link
              to="/admin"
              style={{
                padding: '8px 16px',
                borderRadius: '6px',
                background: colors.warning,
                color: '#000',
                fontWeight: '700',
                fontSize: '13px',
                textDecoration: 'none',
                whiteSpace: 'nowrap',
                transition: 'transform 0.2s'
              }}
              onMouseOver={(e) => e.currentTarget.style.transform = 'scale(1.05)'}
              onMouseOut={(e) => e.currentTarget.style.transform = 'scale(1)'}
            >
              Quản lý
            </Link>

            ) : (
              isLoggedIn && (
                <div 
                  onClick={() => navigate('/recharge')}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    padding: '8px 16px',
                    background: colors.highlight,
                    borderRadius: '6px',
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                    whiteSpace: 'nowrap',
                    color: colors.buttonText,
                    fontWeight: '700'
                  }}
                  onMouseOver={(e) => {
                    e.currentTarget.style.background = colors.buttonHover;
                    e.currentTarget.style.transform = 'scale(1.05)';
                  }}
                  onMouseOut={(e) => {
                    e.currentTarget.style.background = colors.highlight;
                    e.currentTarget.style.transform = 'scale(1)';
                  }}
                  title="Nhấn để nạp tiền"
                >
                  <span style={{ fontSize: '14px' }}>{coins} DP</span>
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
                color: colors.paragraph,
                transition: 'color 0.2s',
                whiteSpace: 'nowrap'
              }}
              onMouseOver={(e) => e.currentTarget.style.color = colors.button}
              onMouseOut={(e) => e.currentTarget.style.color = colors.paragraph}
            >
              Đã lưu
            </Link>
            
            {isLoggedIn ? (
              <div
                style={{ position: 'relative', display: 'inline-block' }}
                ref={userMenuRef}
              >
                <span
                  style={{
                    display: 'inline-block',
                    width: 40,
                    height: 40,
                    borderRadius: '50%',
                    background: (localStorage.getItem('avatarUrl') ?
                      `url(${localStorage.getItem('avatarUrl')}) center/cover no-repeat`
                      : colors.button
                    ),
                    color: colors.buttonText,
                    fontWeight: '700',
                    fontSize: '16px',
                    textAlign: 'center',
                    verticalAlign: 'middle',
                    lineHeight: '40px',
                    cursor: 'pointer',
                    border: `2px solid ${colors.borderLight}`,
                    boxShadow: '0 2px 8px rgba(9, 64, 103, 0.1)',
                    transition: 'all 0.2s'
                  }}
                  onClick={() => setShowDropdown(prev => !prev)}
                  onMouseOver={(e) => e.currentTarget.style.transform = 'scale(1.05)'}
                  onMouseOut={(e) => e.currentTarget.style.transform = 'scale(1)'}
                  title={username}
                >
                  {!localStorage.getItem('avatarUrl') && (username ? username[0].toUpperCase() : 'U')}
                </span>
                {showDropdown && (
                  <div style={{
                    position: 'absolute',
                    top: '110%',
                    right: 0,
                    background: colors.background,
                    border: `1px solid ${colors.borderLight}`,
                    borderRadius: '8px',
                    marginTop: '8px',
                    minWidth: '180px',
                    boxShadow: '0 8px 24px rgba(9, 64, 103, 0.12)',
                    zIndex: 1000,
                    overflow: 'hidden'
                  }}>
                    <div style={{ 
                      padding: '12px 16px', 
                      borderBottom: `1px solid ${colors.borderLight}`, 
                      color: colors.headline, 
                      fontWeight: '700',
                      fontSize: '14px'
                    }}>
                      {username}
                    </div>
                    <Link to="/profile" style={{
                      display: 'block',
                      padding: '12px 16px',
                      textDecoration: 'none',
                      color: colors.paragraph,
                      borderBottom: `1px solid ${colors.borderLight}`,
                      transition: 'background 0.2s',
                      fontSize: '14px',
                      fontWeight: '500'
                    }}
                      onClick={() => setShowDropdown(false)}
                      onMouseOver={e => e.currentTarget.style.background = colors.inputBg}
                      onMouseOut={e => e.currentTarget.style.background = 'transparent'}
                    >Hồ sơ</Link>
                    <button
                      onClick={handleLogout}
                      style={{
                        width: '100%',
                        padding: '12px 16px',
                        textAlign: 'left',
                        background: 'none',
                        border: 'none',
                        cursor: 'pointer',
                        color: colors.tertiary,
                        fontSize: '14px',
                        fontFamily: 'Montserrat, sans-serif',
                        transition: 'background 0.2s',
                        fontWeight: '500'
                      }}
                      onMouseOver={e => e.target.style.background = colors.inputBg}
                      onMouseOut={e => e.target.style.background = 'transparent'}
                    >Đăng xuất
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <Link 
                to="/login" 
                style={{ 
                  textDecoration: 'none', 
                  color: colors.paragraph,
                  transition: 'color 0.2s',
                  fontWeight: '600',
                  whiteSpace: 'nowrap'
                }}
                onMouseOver={(e) => e.currentTarget.style.color = colors.button}
                onMouseOut={(e) => e.currentTarget.style.color = colors.paragraph}
              >
                Đăng nhập
              </Link>
            )}
          </nav>
        </header>
        
        {/* Menu Categories */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: '14px 0',
          fontSize: '13px',
          fontWeight: '600',
          color: colors.headline,
          borderTop: `1px solid ${colors.borderLight}`
        }}>
          {menuItems.map(item => (
            <div
              key={item}
              style={{ 
                position: 'relative',
                display: 'inline-block'
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
                  transition: 'color 0.2s',
                  whiteSpace: 'nowrap'
                }}
                onMouseOver={(e) => e.currentTarget.style.color = colors.button}
                onMouseOut={(e) => e.currentTarget.style.color = colors.headline}
              >
                {item}
              </Link>
              
              {activeDropdown === item && menuDropdowns[item] && (
                <div 
                  onMouseEnter={() => setActiveDropdown(item)}
                  onMouseLeave={() => setActiveDropdown(null)}
                  style={{
                    position: 'absolute',
                    top: '100%',
                    left: menuItems.indexOf(item) >= 3 ? 'auto' : 0,
                    right: menuItems.indexOf(item) >= 3 ? 0 : 'auto',
                    paddingTop: '8px',
                    marginTop: '0px',
                  }}>
                  <div style={{
                    background: colors.background,
                    border: `1px solid ${colors.borderLight}`,
                    borderRadius: '8px',
                    padding: '20px',
                    minWidth: '600px',
                    boxShadow: '0 8px 24px rgba(9, 64, 103, 0.12)',
                    display: 'flex',
                    gap: '30px'
                  }}>
                    {Object.entries(menuDropdowns[item]).map(([category, items]) => (
                      <div key={category} style={{ flex: 1 }}>
                        <div style={{
                          fontWeight: '700',
                          marginBottom: '12px',
                          color: colors.headline,
                          fontSize: '13px'
                        }}>
                          {category}
                        </div>
                        {items.map(subItem => (
                          <div
                            key={subItem}
                            style={{
                              padding: '8px 0',
                              cursor: 'pointer',
                              color: colors.paragraph,
                              fontSize: '12px',
                              fontWeight: '500',
                              transition: 'color 0.2s'
                            }}
                            onClick={() => handleSubItemClick(subItem)}
                            onMouseOver={(e) => e.currentTarget.style.color = colors.button}
                            onMouseOut={(e) => e.currentTarget.style.color = colors.paragraph}
                          >
                            {subItem}
                          </div>
                        ))}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}