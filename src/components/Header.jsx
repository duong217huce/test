import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

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
  'Ôn tập trắc nghiệm': '/category/practice'
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
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [username, setUsername] = useState('');
  const [userPoints, setUserPoints] = useState(0);
  const [showDropdown, setShowDropdown] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState(null);

  useEffect(() => {
    const loggedIn = localStorage.getItem('isLoggedIn') === 'true';
    const storedUsername = localStorage.getItem('username') || '';
    const storedPoints = localStorage.getItem('userPoints') || '0';
    
    setIsLoggedIn(loggedIn);
    setUsername(storedUsername);
    setUserPoints(parseInt(storedPoints));
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('isLoggedIn');
    localStorage.removeItem('username');
    
    setIsLoggedIn(false);
    setUsername('');
    setShowDropdown(false);
  };

  const handleProtectedAction = (actionName) => {
    if (!isLoggedIn) {
      alert(`Bạn cần đăng nhập để sử dụng chức năng ${actionName}!`);
    }
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
      <header style={{
        display: 'flex',
        alignItems: 'center',
        padding: '18px 0',
        maxWidth: '1200px',
        margin: '0 auto',
        paddingLeft: '16px',
        paddingRight: '16px'
      }}>
        <Link to="/" style={{ color: '#e84c61', fontWeight: 'bold', fontSize: '22px', marginRight: '32px', textDecoration: 'none' }}>
          EDUCONNECT
        </Link>
        <div style={{ flex: 1 }}>
          <input
            type="text"
            placeholder="Tìm kiếm..."
            style={{
              height: '32px',
              width: '350px',
              fontSize: '16px',
              borderRadius: '6px',
              border: '1px solid #ccc',
              paddingLeft: '14px'
            }}
          />
          <span style={{
            position: 'relative',
            left: '-32px',
            cursor: 'pointer',
            fontSize: '20px'
          }}>🔍</span>
        </div>
        <nav style={{ display: 'flex', gap: '32px', marginLeft: '60px', fontSize: '17px', alignItems: 'center' }}>
          <Link 
            to="/upload"
            onClick={(e) => {
              if (!isLoggedIn) {
                e.preventDefault();
                handleProtectedAction('Upload');
              }
            }}
            style={{ textDecoration: 'none', color: 'inherit', cursor: 'pointer' }}
          >
            Upload
          </Link>
          
          {/* DP Points Display */}
          {isLoggedIn && (
            <div 
              onClick={() => alert('Tính năng nạp điểm đang được phát triển!')}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '6px 16px',
                background: '#fff3cd',
                borderRadius: '20px',
                border: '2px solid #ffc107',
                cursor: 'pointer',
                transition: 'all 0.2s'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = '#ffecb3';
                e.currentTarget.style.transform = 'scale(1.05)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = '#fff3cd';
                e.currentTarget.style.transform = 'scale(1)';
              }}
              title="Click để nạp điểm"
            >
              <span style={{ fontSize: '18px' }}>💎</span>
              <span style={{ 
                fontWeight: 'bold', 
                color: '#ff8c00',
                fontSize: '16px'
              }}>
                {userPoints} DP
              </span>
              <span style={{ fontSize: '12px', color: '#888' }}>+</span>
            </div>
          )}
          
          <Link 
            to="/saved"
            onClick={(e) => {
              if (!isLoggedIn) {
                e.preventDefault();
                handleProtectedAction('Saved');
              }
            }}
            style={{ textDecoration: 'none', color: 'inherit', cursor: 'pointer' }}
          >
            Saved
          </Link>
          
          {isLoggedIn ? (
            <div 
              style={{ 
                position: 'relative', 
                display: 'inline-block',
                paddingBottom: '8px'
              }}
              onMouseEnter={() => setShowDropdown(true)}
              onMouseLeave={() => setShowDropdown(false)}
            >
              <span style={{ cursor: 'pointer', fontWeight: 'bold' }}>
                Tài khoản
              </span>
              {showDropdown && (
                <div style={{
                  position: 'absolute',
                  top: '100%',
                  right: 0,
                  background: '#fff',
                  border: '1px solid #ccc',
                  borderRadius: '4px',
                  marginTop: '0px',
                  paddingTop: '8px',
                  minWidth: '180px',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                  zIndex: 1000
                }}>
                  <div style={{ padding: '12px 16px', borderBottom: '1px solid #eee', color: '#133a5c' }}>
                    <strong>{username}</strong>
                  </div>
                  <Link to="/profile" style={{ 
                    display: 'block', 
                    padding: '10px 16px', 
                    textDecoration: 'none', 
                    color: '#333',
                    borderBottom: '1px solid #eee'
                  }}>
                    Hồ sơ
                  </Link>
                  <a href="#" style={{ 
                    display: 'block', 
                    padding: '10px 16px', 
                    textDecoration: 'none', 
                    color: '#333',
                    borderBottom: '1px solid #eee'
                  }}>
                    Cài đặt
                  </a>
                  <button
                    onClick={handleLogout}
                    style={{
                      width: '100%',
                      padding: '10px 16px',
                      textAlign: 'left',
                      background: 'none',
                      border: 'none',
                      cursor: 'pointer',
                      color: '#e84c61',
                      fontSize: '17px',
                      fontFamily: 'Arial, sans-serif'
                    }}
                    onMouseEnter={(e) => e.target.style.background = '#f5f5f5'}
                    onMouseLeave={(e) => e.target.style.background = 'none'}
                  >
                    Đăng xuất
                  </button>
                </div>
              )}
            </div>
          ) : (
            <Link to="/login" style={{ textDecoration: 'none', color: 'inherit' }}>
              Đăng nhập
            </Link>
          )}
        </nav>
      </header>
      
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        gap: '36px',
        padding: '10px 0',
        fontSize: '16px',
        fontWeight: 'bold',
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
                color: 'inherit'
              }}
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
                border: '1px solid #ccc',
                borderRadius: '6px',
                marginTop: '0px',
                paddingTop: '12px',
                paddingBottom: '20px',
                paddingLeft: '20px',
                paddingRight: '20px',
                minWidth: '600px',
                boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
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
                      fontSize: '15px'
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
                          fontSize: '14px',
                          fontWeight: 'normal'
                        }}
                        onMouseEnter={(e) => e.target.style.color = '#e84c61'}
                        onMouseLeave={(e) => e.target.style.color = '#2d4a67'}
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
