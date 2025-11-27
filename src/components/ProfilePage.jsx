import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Header from './Header';
import { refreshUserData } from '../utils/userUtils';

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
const hocCapList = ['', 'Tiểu học', 'THCS', 'THPT', 'Đại học', 'Sau đại học'];

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
    avatar: '',
    hocCap: '',
    lop: '',
    chuyenNganh: ''
  });
  const [uploadedDocs, setUploadedDocs] = useState([]);
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false); // THÊM
  const fileInputRef = useRef(null);

  useEffect(() => {
    const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true';
    if (!isLoggedIn) {
      alert('Vui lòng đăng nhập để xem trang cá nhân');
      navigate('/login');
      return;
    }
    const storedUser = JSON.parse(localStorage.getItem('user') || '{}');
    setUserData({
      username: storedUser.username || '',
      fullName: storedUser.fullName || '',
      email: storedUser.email || '',
      phone: storedUser.phone || '',
      joinDate: new Date(storedUser.createdAt || Date.now()).toLocaleDateString('vi-VN'),
      totalUploads: 0,
      totalDownloads: 0,
      totalViews: 0,
      bio: storedUser.bio || '',
      avatar: localStorage.getItem('avatarUrl') || '',
      hocCap: storedUser.hocCap || '',
      lop: storedUser.lop || '',
      chuyenNganh: storedUser.chuyenNganh || ''
    });
    fetchUploadedDocs();
  }, [navigate]);

  const fetchUploadedDocs = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      if (!token || !(user._id || user.id)) {
        setUploadedDocs([]);
        setLoading(false);
        return;
      }
      const response = await fetch('http://localhost:5000/api/documents', {
        headers: { Authorization: `Bearer ${token}` }
      });
      const allDocs = await response.json();
      const myDocs = allDocs.filter(doc =>
        doc.uploadedBy && (doc.uploadedBy._id === user._id || doc.uploadedBy._id === user.id || doc.uploadedBy === user.id)
      );
      setUploadedDocs(myDocs);
      setUserData(prev => ({
        ...prev,
        totalUploads: myDocs.length,
        totalDownloads: myDocs.reduce((sum, doc) => sum + (doc.downloads || 0), 0),
        totalViews: myDocs.reduce((sum, doc) => sum + (doc.views || 0), 0)
      }));
    } catch {
      setUploadedDocs([]);
    } finally {
      setLoading(false);
    }
  };

  const handleAvatarChange = async (e) => {
  const file = e.target.files[0];
  if (!file) return;

  try {
    const formData = new FormData();
    formData.append('avatar', file);

    const token = localStorage.getItem('token');
    const response = await fetch('http://localhost:5000/api/users/avatar', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`
      },
      body: formData
    });

    if (!response.ok) {
      throw new Error('Upload failed');
    }

    const data = await response.json();
    const fullAvatarUrl = `http://localhost:5000${data.avatarUrl}`;
    
    console.log('✅ Avatar uploaded:', fullAvatarUrl);
    
    // Cập nhật state
    setUserData(prev => ({ ...prev, avatar: fullAvatarUrl }));
    
    // Cập nhật localStorage
    const currentUser = JSON.parse(localStorage.getItem('user') || '{}');
    currentUser.avatar = data.avatarUrl;
    localStorage.setItem('user', JSON.stringify(currentUser));
    
    alert('Đã cập nhật ảnh đại diện!');
  } catch (error) {
    console.error('❌ Error uploading avatar:', error);
    alert('Có lỗi khi upload ảnh đại diện!');
  }
  };

  const handleEdit = async () => {
  if (isEditing) {
    if (isSaving) {
      console.log('⚠️ Đang lưu...');
      return;
    }
    setIsSaving(true);
    try {
      const token = localStorage.getItem('token');
      const dataToSend = {
        fullName: userData.fullName,
        hocCap: userData.hocCap,
        lop: userData.lop,
        chuyenNganh: userData.chuyenNganh,
        phone: userData.phone,
        bio: userData.bio
      };

      const response = await fetch('http://localhost:5000/api/users/me', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(dataToSend)
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to update');
      }

      // ✅ SỬ DỤNG HELPER
      await refreshUserData();
      
      // ✅ Fetch lại để cập nhật UI
      const updatedUser = await response.json();
      setUserData(prev => ({
        ...prev,
        fullName: updatedUser.fullName,
        hocCap: updatedUser.hocCap,
        lop: updatedUser.lop,
        chuyenNganh: updatedUser.chuyenNganh,
        phone: updatedUser.phone,
        bio: updatedUser.bio
      }));
      
      alert('✅ Đã lưu thông tin hồ sơ!');
      setIsEditing(false);
    } catch (err) {
      console.error('❌ Error updating profile:', err);
      alert('Có lỗi khi lưu thông tin: ' + err.message);
    } finally {
      setIsSaving(false);
    }
  } else {
    setIsEditing(true);
  }
  };

  return (
    <div style={{ minHeight: '100vh', background: '#fffffe', fontFamily: 'Arial, sans-serif' }}>
      <Header />
      <div style={{ height: '130px' }}></div>
      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '20px' }}>
        <div style={{ display: 'flex', gap: '30px' }}>
          {/* SIDEBAR */}
          <aside style={{ width: '300px', flexShrink: 0 }}>
            <div style={{
              background: '#fff', borderRadius: '8px', padding: '30px',
              boxShadow: '0 2px 8px rgba(0,0,0,0.06)', textAlign: 'center', position: 'sticky', top: '150px'
            }}>
              {/* Avatar */}
              <div style={{
                width: '120px', height: '120px', borderRadius: '50%', background: '#b4cbe0',
                margin: '0 auto 20px', display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '48px', color: '#fff', overflow: 'hidden'
              }}>
                {userData.avatar ?
                  (<img src={userData.avatar} alt="Avatar" style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '50%' }} />)
                  : "👤"}
              </div>
              {isEditing &&
                <div style={{ marginBottom: 15 }}>
                  <input
                    type="file"
                    ref={fileInputRef}
                    accept="image/*"
                    style={{ display: 'block', margin: '0 auto' }}
                    onChange={handleAvatarChange}
                  />
                </div>
              }
              <h2 style={{ color: '#133a5c', fontSize: '22px', marginBottom: '5px' }}>
                {userData.fullName || userData.username}
              </h2>
              <p style={{ color: '#888', fontSize: '14px', marginBottom: '20px' }}>
                @{userData.username}
              </p>
              <div style={{
                display: 'flex', justifyContent: 'space-around',
                padding: '20px 0', borderTop: '1px solid #eee', borderBottom: '1px solid #eee',
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
              <p style={{ fontSize: '13px', color: '#888', marginBottom: '20px' }}>
                Tham gia: {userData.joinDate}
              </p>
              {/* Button chỉnh sửa/lưu */}
              <button
                onClick={handleEdit}
                disabled={isSaving}
                style={{
                  width: '100%',
                  padding: '12px',
                  background: isSaving ? '#ccc' : isEditing ? '#0d7a4f' : '#4ba3d6',
                  color: '#fff',
                  border: 'none',
                  borderRadius: '6px',
                  fontSize: '14px',
                  fontWeight: 'bold',
                  cursor: isSaving ? 'not-allowed' : 'pointer',
                  marginBottom: '10px'
                }}
              >
                {isSaving ? '⏳ Đang lưu...' : (isEditing ? '💾 Lưu thay đổi' : '✏️ Chỉnh sửa')}
              </button>
            </div>
          </aside>
          {/* MAIN CONTENT */}
          <div style={{ flex: 1 }}>
            <div style={{
              display: 'flex', gap: '20px', marginBottom: '30px', borderBottom: '2px solid #eee'
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
            {activeTab === 'info' ? (
              <div style={{
                background: '#fff',
                borderRadius: '8px',
                padding: '30px',
                boxShadow: '0 2px 8px rgba(0,0,0,0.06)'
              }}>
                <h3 style={{ color: '#133a5c', marginBottom: '20px' }}>Thông tin cá nhân</h3>
                <InfoField
                  label="Tên đăng nhập"
                  value={userData.username}
                  isEditing={false}
                />
                <InfoField
                  label="Họ và tên"
                  value={userData.fullName}
                  isEditing={isEditing}
                  onChange={val => setUserData(prev => ({ ...prev, fullName: val }))}
                />
                <InfoField
                  label="Email"
                  value={userData.email}
                  isEditing={false}
                  onChange={val => setUserData(prev => ({ ...prev, email: val }))}
                />
                <InfoField
                  label="Số điện thoại"
                  value={userData.phone}
                  isEditing={isEditing}
                  onChange={val => setUserData(prev => ({ ...prev, phone: val }))}
                />
                <div style={{ marginBottom: '20px' }}>
                  <label style={{
                    display: 'block',
                    marginBottom: '8px',
                    color: '#133a5c',
                    fontSize: '14px',
                    fontWeight: '500'
                  }}>Cấp học</label>
                  {isEditing ? (
                    <select
                      value={userData.hocCap}
                      onChange={e => setUserData(prev => ({ ...prev, hocCap: e.target.value }))}
                      style={{
                        width: '100%',
                        padding: '12px',
                        fontSize: '14px',
                        border: '1px solid #ccc',
                        borderRadius: '6px',
                        outline: 'none'
                      }}
                    >
                      {hocCapList.map(option => (
                        <option key={option} value={option}>{option === '' ? '--Chọn--' : option}</option>
                      ))}
                    </select>
                  ) : (
                    <div style={{
                      padding: '12px',
                      background: '#f5f5f5',
                      borderRadius: '6px',
                      color: '#2d4a67',
                      fontSize: '14px'
                    }}>
                      {userData.hocCap || 'Chưa cập nhật'}
                    </div>
                  )}
                </div>
                <InfoField
                  label="Lớp"
                  value={userData.lop}
                  isEditing={isEditing}
                  onChange={val => setUserData(prev => ({ ...prev, lop: val }))}
                  placeholder="Nhập lớp đang học"
                />
                <InfoField
                  label="Chuyên ngành"
                  value={userData.chuyenNganh}
                  isEditing={isEditing}
                  onChange={val => setUserData(prev => ({ ...prev, chuyenNganh: val }))}
                  placeholder="Nếu bạn là sinh viên"
                />
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
                      value={userData.bio}
                      rows="4"
                      onChange={e => setUserData(prev => ({ ...prev, bio: e.target.value }))}
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
              <div>
                {loading ? (
                  <div style={{ textAlign: 'center', padding: '60px', color: '#888' }}>Đang tải tài liệu...</div>
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
                          onMouseEnter={e => {
                            e.currentTarget.style.transform = 'translateY(-4px)';
                            e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.12)';
                          }}
                          onMouseLeave={e => {
                            e.currentTarget.style.transform = 'translateY(0)';
                            e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.06)';
                          }}
                        >
                          <div style={cardStyle}>📄</div>
                          <div style={{ padding: '15px' }}>
                            <div style={{
                              fontWeight: 'bold',
                              color: '#133a5c',
                              fontSize: '15px',
                              marginBottom: '10px',
                              lineHeight: '1.3'
                            }}>{doc.title}</div>
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

function InfoField({ label, value, isEditing, onChange = () => {}, placeholder }) {
  return (
    <div style={{ marginBottom: '20px' }}>
      <label style={{
        display: 'block', marginBottom: '8px', color: '#133a5c',
        fontSize: '14px', fontWeight: '500'
      }}>
        {label}
      </label>
      {isEditing ? (
        <input
          type="text"
          value={value}
          placeholder={placeholder || ''}
          onChange={e => onChange(e.target.value)}
          style={{
            width: '100%', padding: '12px', fontSize: '14px',
            border: '1px solid #ccc', borderRadius: '6px', outline: 'none', boxSizing: 'border-box'
          }}
        />
      ) : (
        <div style={{
          padding: '12px', background: '#f5f5f5', borderRadius: '6px',
          color: '#2d4a67', fontSize: '14px'
        }}>
          {value || 'Chưa cập nhật'}
        </div>
      )}
    </div>
  );
}
