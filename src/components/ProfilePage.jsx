import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Header from './Header';

const cardStyle = {
  background: '#b4cbe0',
  width: '100%',
  height: '140px',
  borderRadius: '7px 7px 0 0',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  color: '#fff',
  fontSize: '14px'
};

export default function ProfilePage() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('info');
  const [userData, setUserData] = useState({
    username: '',
    fullName: '',
    email: '',
    phone: '',
    joinDate: '',
    totalUploads: 0,
    totalDownloads: 0,
    totalViews: 0,
    bio: '',
    avatar: null
  });
  const [uploadedDocs, setUploadedDocs] = useState([]);
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if user is logged in
    const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true';
    if (!isLoggedIn) {
      alert('Vui lòng đăng nhập để xem trang cá nhân');
      navigate('/login');
      return;
    }

    // Get user data from localStorage
    const storedUser = JSON.parse(localStorage.getItem('user') || '{}');
    const storedUsername = localStorage.getItem('username');
    const storedFullName = localStorage.getItem('fullName');
    
    setUserData({
      username: storedUsername || storedUser.username || '',
      fullName: storedFullName || storedUser.fullName || '',
      email: storedUser.email || '',
      phone: localStorage.getItem('phone') || '',
      joinDate: new Date(storedUser.createdAt || Date.now()).toLocaleDateString('vi-VN'),
      totalUploads: 0,
      totalDownloads: 0,
      totalViews: 0,
      bio: 'Thành viên của EDUCONNECT',
      avatar: null
    });

    // Fetch uploaded documents
    fetchUploadedDocs();
  }, [navigate]);

  const fetchUploadedDocs = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      
      if (!token || !user.id) {
        setUploadedDocs([]);
        setLoading(false);
        return;
      }

      const response = await fetch('http://localhost:5000/api/documents', {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      
      const allDocs = await response.json();
      
      // Filter documents uploaded by current user
      const myDocs = allDocs.filter(doc => 
        doc.uploadedBy && (doc.uploadedBy._id === user.id || doc.uploadedBy === user.id)
      );
      
      setUploadedDocs(myDocs);
      
      // Update stats
      const totalDownloads = myDocs.reduce((sum, doc) => sum + (doc.downloads || 0), 0);
      const totalViews = myDocs.reduce((sum, doc) => sum + (doc.views || 0), 0);
      
      setUserData(prev => ({
        ...prev,
        totalUploads: myDocs.length,
        totalDownloads,
        totalViews
      }));
    } catch (error) {
      console.error('Lỗi khi tải tài liệu:', error);
      setUploadedDocs([]);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = () => {
    setIsEditing(!isEditing);
    if (isEditing) {
      alert('Đã lưu thông tin cá nhân');
    }
  };

  return (
    <div style={{ minHeight: '100vh', background: '#fffffe', fontFamily: 'Arial, sans-serif' }}>
      <Header />
      <div style={{ height: '130px' }}></div>
      
      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '20px' }}>
        <div style={{ display: 'flex', gap: '30px' }}>
          {/* Left sidebar - User info card */}
          <aside style={{
            width: '300px',
            flexShrink: 0
          }}>
            <div style={{
              background: '#fff',
              borderRadius: '8px',
              padding: '30px',
              boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
              textAlign: 'center',
              position: 'sticky',
              top: '150px'
            }}>
              {/* Avatar */}
              <div style={{
                width: '120px',
                height: '120px',
                borderRadius: '50%',
                background: '#b4cbe0',
                margin: '0 auto 20px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '48px',
                color: '#fff'
              }}>
                {userData.avatar ? (
                  <img src={userData.avatar} alt="Avatar" style={{ width: '100%', height: '100%', borderRadius: '50%' }} />
                ) : (
                  '👤'
                )}
              </div>

              {/* User name */}
              <h2 style={{
                color: '#133a5c',
                fontSize: '22px',
                marginBottom: '5px'
              }}>
                {userData.fullName || userData.username}
              </h2>
              <p style={{
                color: '#888',
                fontSize: '14px',
                marginBottom: '20px'
              }}>
                @{userData.username}
              </p>

              {/* Stats */}
              <div style={{
                display: 'flex',
                justifyContent: 'space-around',
                padding: '20px 0',
                borderTop: '1px solid #eee',
                borderBottom: '1px solid #eee',
                marginBottom: '20px'
              }}>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: '20px', fontWeight: 'bold', color: '#133a5c' }}>
                    {userData.totalUploads}
                  </div>
                  <div style={{ fontSize: '12px', color: '#888' }}>Tải lên</div>
                </div>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: '20px', fontWeight: 'bold', color: '#133a5c' }}>
                    {userData.totalDownloads}
                  </div>
                  <div style={{ fontSize: '12px', color: '#888' }}>Lượt tải</div>
                </div>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: '20px', fontWeight: 'bold', color: '#133a5c' }}>
                    {userData.totalViews}
                  </div>
                  <div style={{ fontSize: '12px', color: '#888' }}>Lượt xem</div>
                </div>
              </div>

              {/* Member since */}
              <p style={{
                fontSize: '13px',
                color: '#888',
                marginBottom: '20px'
              }}>
                Tham gia: {userData.joinDate}
              </p>

              {/* Edit button */}
              <button
                onClick={handleEdit}
                style={{
                  width: '100%',
                  padding: '12px',
                  background: isEditing ? '#0d7a4f' : '#4ba3d6',
                  color: '#fff',
                  border: 'none',
                  borderRadius: '6px',
                  fontSize: '14px',
                  fontWeight: 'bold',
                  cursor: 'pointer',
                  marginBottom: '10px'
                }}
              >
                {isEditing ? '💾 Lưu thay đổi' : '✏️ Chỉnh sửa'}
              </button>
            </div>
          </aside>

          {/* Main content */}
          <div style={{ flex: 1 }}>
            {/* Tabs */}
            <div style={{
              display: 'flex',
              gap: '20px',
              marginBottom: '30px',
              borderBottom: '2px solid #eee'
            }}>
              <button
                onClick={() => setActiveTab('info')}
                style={{
                  padding: '12px 24px',
                  background: 'none',
                  border: 'none',
                  borderBottom: activeTab === 'info' ? '3px solid #4ba3d6' : '3px solid transparent',
                  color: activeTab === 'info' ? '#133a5c' : '#888',
                  fontSize: '16px',
                  fontWeight: activeTab === 'info' ? 'bold' : 'normal',
                  cursor: 'pointer',
                  transition: 'all 0.2s'
                }}
              >
                Thông tin cá nhân
              </button>
              <button
                onClick={() => setActiveTab('uploads')}
                style={{
                  padding: '12px 24px',
                  background: 'none',
                  border: 'none',
                  borderBottom: activeTab === 'uploads' ? '3px solid #4ba3d6' : '3px solid transparent',
                  color: activeTab === 'uploads' ? '#133a5c' : '#888',
                  fontSize: '16px',
                  fontWeight: activeTab === 'uploads' ? 'bold' : 'normal',
                  cursor: 'pointer',
                  transition: 'all 0.2s'
                }}
              >
                Tài liệu đã tải lên ({uploadedDocs.length})
              </button>
            </div>

            {/* Tab content */}
            {activeTab === 'info' ? (
              // Personal info tab
              <div style={{
                background: '#fff',
                borderRadius: '8px',
                padding: '30px',
                boxShadow: '0 2px 8px rgba(0,0,0,0.06)'
              }}>
                <h3 style={{ color: '#133a5c', marginBottom: '20px' }}>Thông tin cá nhân</h3>
                
                <InfoField label="Tên đăng nhập" value={userData.username} isEditing={false} />
                <InfoField label="Họ và tên" value={userData.fullName} isEditing={isEditing} />
                <InfoField label="Email" value={userData.email} isEditing={isEditing} />
                <InfoField label="Số điện thoại" value={userData.phone} isEditing={isEditing} />
                
                <div style={{ marginTop: '20px' }}>
                  <label style={{
                    display: 'block',
                    marginBottom: '8px',
                    color: '#133a5c',
                    fontSize: '14px',
                    fontWeight: '500'
                  }}>
                    Giới thiệu
                  </label>
                  {isEditing ? (
                    <textarea
                      defaultValue={userData.bio}
                      rows="4"
                      style={{
                        width: '100%',
                        padding: '12px',
                        fontSize: '14px',
                        border: '1px solid #ccc',
                        borderRadius: '6px',
                        outline: 'none',
                        resize: 'vertical',
                        fontFamily: 'Arial, sans-serif',
                        boxSizing: 'border-box'
                      }}
                    />
                  ) : (
                    <p style={{ color: '#2d4a67', fontSize: '14px', lineHeight: '1.6' }}>
                      {userData.bio}
                    </p>
                  )}
                </div>
              </div>
            ) : (
              // Uploads tab
              <div>
                {loading ? (
                  <div style={{ textAlign: 'center', padding: '60px', color: '#888' }}>
                    Đang tải tài liệu...
                  </div>
                ) : uploadedDocs.length > 0 ? (
                  <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))',
                    gap: '20px'
                  }}>
                    {uploadedDocs.map((doc) => (
                      <Link
                        to={`/document/${doc._id}`}
                        key={doc._id}
                        style={{
                          textDecoration: 'none',
                          color: 'inherit'
                        }}
                      >
                        <div
                          style={{
                            background: '#fff',
                            borderRadius: '7px',
                            boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
                            cursor: 'pointer',
                            transition: 'transform 0.2s, box-shadow 0.2s'
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.transform = 'translateY(-4px)';
                            e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.12)';
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.transform = 'translateY(0)';
                            e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.06)';
                          }}
                        >
                          <div style={cardStyle}>
                            📄
                          </div>
                          <div style={{ padding: '15px' }}>
                            <div style={{
                              fontWeight: 'bold',
                              color: '#133a5c',
                              fontSize: '15px',
                              marginBottom: '10px',
                              lineHeight: '1.3'
                            }}>
                              {doc.title}
                            </div>
                            
                            <div style={{ fontSize: '12px', color: '#2d4a67', marginBottom: '8px' }}>
                              <span style={{ color: '#888' }}>📊</span> {doc.downloads || 0} lượt tải • {doc.views || 0} lượt xem
                            </div>
                            
                            <div style={{
                              fontSize: '11px',
                              color: '#888',
                              paddingTop: '8px',
                              borderTop: '1px solid #eee'
                            }}>
                              Đăng ngày: {new Date(doc.uploadDate).toLocaleDateString('vi-VN')}
                            </div>
                          </div>
                        </div>
                      </Link>
                    ))}
                  </div>
                ) : (
                  <div style={{
                    textAlign: 'center',
                    padding: '60px 20px',
                    background: '#fff',
                    borderRadius: '8px',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.06)'
                  }}>
                    <div style={{ fontSize: '50px', marginBottom: '15px' }}>📤</div>
                    <h3 style={{ color: '#133a5c', marginBottom: '10px' }}>
                      Chưa có tài liệu nào
                    </h3>
                    <p style={{ color: '#888', marginBottom: '20px' }}>
                      Bắt đầu chia sẻ tài liệu của bạn
                    </p>
                    <Link
                      to="/upload"
                      style={{
                        display: 'inline-block',
                        padding: '12px 30px',
                        background: '#0d7a4f',
                        color: '#fff',
                        textDecoration: 'none',
                        borderRadius: '6px',
                        fontWeight: 'bold'
                      }}
                    >
                      Upload tài liệu
                    </Link>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// Helper component for info fields
function InfoField({ label, value, isEditing }) {
  return (
    <div style={{ marginBottom: '20px' }}>
      <label style={{
        display: 'block',
        marginBottom: '8px',
        color: '#133a5c',
        fontSize: '14px',
        fontWeight: '500'
      }}>
        {label}
      </label>
      {isEditing ? (
        <input
          type="text"
          defaultValue={value}
          style={{
            width: '100%',
            padding: '12px',
            fontSize: '14px',
            border: '1px solid #ccc',
            borderRadius: '6px',
            outline: 'none',
            boxSizing: 'border-box'
          }}
        />
      ) : (
        <div style={{
          padding: '12px',
          background: '#f5f5f5',
          borderRadius: '6px',
          color: '#2d4a67',
          fontSize: '14px'
        }}>
          {value}
        </div>
      )}
    </div>
  );
}
