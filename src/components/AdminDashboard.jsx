import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from './Header';
import { colors } from '../theme/colors';
import { showToast } from '../utils/toast';

export default function AdminDashboard() {
  const navigate = useNavigate();
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  
  // Filter states
  const [filterType, setFilterType] = useState('month'); // day, week, month, year
  const [customDate, setCustomDate] = useState('');
  
  // Statistics states
  const [stats, setStats] = useState({
    totalDocuments: 0,
    topCategory: '',
    topSubject: '',
    topGrade: '',
    mostCommentedDoc: null,
    highestRatedDoc: null
  });
  
  // User management states
  const [showUserList, setShowUserList] = useState(false);
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [editingCoins, setEditingCoins] = useState(false);
  const [newCoins, setNewCoins] = useState(0);
  const [userDocuments, setUserDocuments] = useState([]);

  useEffect(() => {
    const admin = localStorage.getItem('isAdmin') === 'true';
    if (!admin) {
      showToast('Bạn không có quyền truy cập trang này', 'error');
      navigate('/');
      return;
    }
    setIsAdmin(true);
    fetchStatistics();
  }, [navigate]);

  useEffect(() => {
    if (isAdmin) {
      fetchStatistics();
    }
  }, [filterType, customDate, isAdmin]);

  const fetchStatistics = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const params = new URLSearchParams({
        filterType,
        date: customDate || new Date().toISOString()
      });
      
      const response = await fetch(`http://localhost:5000/api/admin/statistics?${params}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      const data = await response.json();
      setStats(data);
    } catch (error) {
      console.error('Error fetching statistics:', error);
      showToast('Không thể tải thống kê', 'error');
    } finally {
      setLoading(false);
    }
  };

  const fetchUsers = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5000/api/admin/users', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      setUsers(data);
      setShowUserList(true);
    } catch (error) {
      console.error('Error fetching users:', error);
      showToast('Không thể tải danh sách người dùng', 'error');
    }
  };

  const fetchUserDocuments = async (userId) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:5000/api/admin/users/${userId}/documents`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      setUserDocuments(data);
    } catch (error) {
      console.error('Error fetching user documents:', error);
      showToast('Không thể tải tài liệu của người dùng', 'error');
    }
  };

  const handleUserClick = (user) => {
    setSelectedUser(user);
    setNewCoins(user.coins || 0);
    fetchUserDocuments(user._id);
  };

  const handleUpdateCoins = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:5000/api/admin/users/${selectedUser._id}/coins`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ coins: newCoins })
      });

      if (response.ok) {
        showToast('Cập nhật DP thành công', 'success');
        setEditingCoins(false);
        setSelectedUser({ ...selectedUser, coins: newCoins });
        fetchUsers();
      } else {
        showToast('Cập nhật DP thất bại', 'error');
      }
    } catch (error) {
      console.error('Error updating coins:', error);
      showToast('Có lỗi xảy ra', 'error');
    }
  };

  const getFilterLabel = () => {
    switch(filterType) {
      case 'day': return 'Hôm nay';
      case 'week': return 'Tuần này';
      case 'month': return 'Tháng này';
      case 'year': return 'Năm này';
      default: return 'Tháng này';
    }
  };

  if (!isAdmin) return null;

  return (
    <div style={{
      minHeight: '100vh',
      background: colors.background,
      fontFamily: 'Montserrat'
    }}>
      <Header />
      <div style={{ height: '130px' }}></div>

      <div style={{
        maxWidth: '1400px',
        margin: '0 auto',
        padding: '40px 80px'
      }}>
        {/* Header Section */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '40px'
        }}>
          <h1 style={{
            color: colors.text,
            fontSize: '32px',
            fontWeight: '600',
            margin: 0
          }}>
            Admin Dashboard
          </h1>

          <button
            onClick={() => {
              setShowUserList(!showUserList);
              if (!showUserList) {
                fetchUsers();
                setSelectedUser(null);
              }
            }}
            style={{
              padding: '12px 24px',
              background: colors.accent2,
              color: colors.text,
              border: 'none',
              borderRadius: '8px',
              fontSize: '15px',
              fontWeight: '600',
              cursor: 'pointer',
              transition: 'all 0.3s ease'
            }}
            onMouseEnter={(e) => e.target.style.transform = 'scale(1.05)'}
            onMouseLeave={(e) => e.target.style.transform = 'scale(1)'}
          >
            {showUserList ? 'Xem thống kê' : 'Danh sách người dùng'}
          </button>
        </div>

        {!showUserList ? (
          <>
            {/* Filter Section */}
            <div style={{
              background: colors.background2,
              padding: '24px',
              borderRadius: '12px',
              marginBottom: '30px',
              border: `1px solid ${colors.background3}`
            }}>
              <h3 style={{
                color: colors.text,
                fontSize: '18px',
                fontWeight: '600',
                marginBottom: '16px'
              }}>
                Bộ lọc thời gian
              </h3>

              <div style={{
                display: 'flex',
                gap: '12px',
                alignItems: 'center'
              }}>
                {['day', 'week', 'month', 'year'].map(type => (
                  <button
                    key={type}
                    onClick={() => setFilterType(type)}
                    style={{
                      padding: '10px 20px',
                      background: filterType === type ? colors.accent2 : colors.background3,
                      color: filterType === type ? colors.text : colors.text2,
                      border: 'none',
                      borderRadius: '8px',
                      fontSize: '14px',
                      fontWeight: filterType === type ? '600' : '500',
                      cursor: 'pointer',
                      transition: 'all 0.3s ease'
                    }}
                  >
                    {type === 'day' && 'Ngày'}
                    {type === 'week' && 'Tuần'}
                    {type === 'month' && 'Tháng'}
                    {type === 'year' && 'Năm'}
                  </button>
                ))}

                <input
                  type="date"
                  value={customDate}
                  onChange={(e) => setCustomDate(e.target.value)}
                  style={{
                    padding: '10px 16px',
                    background: colors.background3,
                    color: colors.text,
                    border: 'none',
                    borderRadius: '8px',
                    fontSize: '14px',
                    fontFamily: 'Montserrat',
                    outline: 'none'
                  }}
                />
              </div>
            </div>

            {/* Statistics Cards */}
            {loading ? (
              <div style={{
                textAlign: 'center',
                padding: '60px',
                color: colors.text2
              }}>
                Đang tải thống kê...
              </div>
            ) : (
              <>
                {/* Main Stats Grid */}
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(4, 1fr)',
                  gap: '20px',
                  marginBottom: '30px'
                }}>
                  <StatCard
                    title="Tài liệu đăng tải"
                    value={stats.totalDocuments}
                    subtitle={getFilterLabel()}
                  />
                  <StatCard
                    title="Chủ đề phổ biến"
                    value={stats.topCategory || 'N/A'}
                    subtitle="Nhiều tài liệu nhất"
                  />
                  <StatCard
                    title="Môn học phổ biến"
                    value={stats.topSubject || 'N/A'}
                    subtitle="Được đăng nhiều nhất"
                  />
                  <StatCard
                    title="Cấp độ phổ biến"
                    value={stats.topGrade || 'N/A'}
                    subtitle="Được đăng nhiều nhất"
                  />
                </div>

                {/* Top Documents */}
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(2, 1fr)',
                  gap: '20px'
                }}>
                  {/* Most Commented */}
                  <div style={{
                    background: colors.background2,
                    padding: '24px',
                    borderRadius: '12px',
                    border: `1px solid ${colors.background3}`
                  }}>
                    <h3 style={{
                      color: colors.text,
                      fontSize: '18px',
                      fontWeight: '600',
                      marginBottom: '16px'
                    }}>
                      Nhiều bình luận nhất
                    </h3>
                    {stats.mostCommentedDoc ? (
                      <DocumentCard doc={stats.mostCommentedDoc} type="comments" />
                    ) : (
                      <p style={{ color: colors.text2, fontSize: '14px' }}>
                        Chưa có dữ liệu
                      </p>
                    )}
                  </div>

                  {/* Highest Rated */}
                  <div style={{
                    background: colors.background2,
                    padding: '24px',
                    borderRadius: '12px',
                    border: `1px solid ${colors.background3}`
                  }}>
                    <h3 style={{
                      color: colors.text,
                      fontSize: '18px',
                      fontWeight: '600',
                      marginBottom: '16px'
                    }}>
                      Đánh giá cao nhất
                    </h3>
                    {stats.highestRatedDoc ? (
                      <DocumentCard doc={stats.highestRatedDoc} type="rating" />
                    ) : (
                      <p style={{ color: colors.text2, fontSize: '14px' }}>
                        Chưa có dữ liệu
                      </p>
                    )}
                  </div>
                </div>
              </>
            )}
          </>
        ) : (
          /* User Management Section */
          <div style={{
            display: 'grid',
            gridTemplateColumns: selectedUser ? '1fr 2fr' : '1fr',
            gap: '30px'
          }}>
            {/* User List */}
            <div style={{
              background: colors.background2,
              padding: '24px',
              borderRadius: '12px',
              border: `1px solid ${colors.background3}`,
              maxHeight: '800px',
              overflowY: 'auto'
            }}>
              <h3 style={{
                color: colors.text,
                fontSize: '18px',
                fontWeight: '600',
                marginBottom: '20px'
              }}>
                Danh sách người dùng ({users.length})
              </h3>

              {users.map(user => (
                <div
                  key={user._id}
                  onClick={() => handleUserClick(user)}
                  style={{
                    padding: '16px',
                    marginBottom: '12px',
                    background: selectedUser?._id === user._id ? colors.background3 : 'transparent',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                    border: `1px solid ${selectedUser?._id === user._id ? colors.accent2 : 'transparent'}`
                  }}
                  onMouseEnter={(e) => {
                    if (selectedUser?._id !== user._id) {
                      e.currentTarget.style.background = colors.background3;
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (selectedUser?._id !== user._id) {
                      e.currentTarget.style.background = 'transparent';
                    }
                  }}
                >
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px'
                  }}>
                    <div style={{
                      width: '40px',
                      height: '40px',
                      borderRadius: '50%',
                      background: colors.accent2,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: colors.text,
                      fontWeight: '600',
                      fontSize: '16px'
                    }}>
                      {user.username ? user.username[0].toUpperCase() : 'U'}
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{
                        color: colors.text,
                        fontWeight: '600',
                        fontSize: '14px'
                      }}>
                        {user.fullName || user.username}
                      </div>
                      <div style={{
                        color: colors.text2,
                        fontSize: '12px'
                      }}>
                        {user.email}
                      </div>
                    </div>
                    <div style={{
                      background: colors.accent3,
                      color: colors.text,
                      padding: '4px 8px',
                      borderRadius: '6px',
                      fontSize: '12px',
                      fontWeight: '600'
                    }}>
                      {user.coins || 0} DP
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* User Detail */}
            {selectedUser && (
              <div style={{
                background: colors.background2,
                padding: '24px',
                borderRadius: '12px',
                border: `1px solid ${colors.background3}`
              }}>
                <h3 style={{
                  color: colors.text,
                  fontSize: '18px',
                  fontWeight: '600',
                  marginBottom: '20px'
                }}>
                  Chi tiết người dùng
                </h3>

                {/* User Info */}
                <div style={{ marginBottom: '30px' }}>
                  <InfoRow label="Tên đăng nhập" value={selectedUser.username} />
                  <InfoRow label="Họ và tên" value={selectedUser.fullName || 'Chưa cập nhật'} />
                  <InfoRow label="Email" value={selectedUser.email} />
                  <InfoRow label="Cấp học" value={selectedUser.educationLevel || 'Chưa cập nhật'} />
                  <InfoRow label="Lớp" value={selectedUser.class || 'Chưa cập nhật'} />
                  <InfoRow label="Chuyên ngành" value={selectedUser.major || 'Chưa cập nhật'} />
                  
                  {/* Coins Management */}
                  <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    padding: '12px 0',
                    borderBottom: `1px solid ${colors.background3}`
                  }}>
                    <span style={{
                      color: colors.text2,
                      fontSize: '14px',
                      fontWeight: '500'
                    }}>
                      DP
                    </span>
                    {editingCoins ? (
                      <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                        <input
                          type="number"
                          value={newCoins}
                          onChange={(e) => setNewCoins(parseInt(e.target.value) || 0)}
                          style={{
                            width: '100px',
                            padding: '6px 12px',
                            background: colors.background3,
                            color: colors.text,
                            border: 'none',
                            borderRadius: '6px',
                            fontSize: '14px',
                            fontFamily: 'Montserrat',
                            outline: 'none'
                          }}
                        />
                        <button
                          onClick={handleUpdateCoins}
                          style={{
                            padding: '6px 12px',
                            background: colors.accent2,
                            color: colors.text,
                            border: 'none',
                            borderRadius: '6px',
                            fontSize: '12px',
                            fontWeight: '600',
                            cursor: 'pointer'
                          }}
                        >
                          Lưu
                        </button>
                        <button
                          onClick={() => {
                            setEditingCoins(false);
                            setNewCoins(selectedUser.coins || 0);
                          }}
                          style={{
                            padding: '6px 12px',
                            background: colors.background3,
                            color: colors.text2,
                            border: 'none',
                            borderRadius: '6px',
                            fontSize: '12px',
                            cursor: 'pointer'
                          }}
                        >
                          Hủy
                        </button>
                      </div>
                    ) : (
                      <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                        <span style={{
                          color: colors.text,
                          fontSize: '15px',
                          fontWeight: '600'
                        }}>
                          {selectedUser.coins || 0} DP
                        </span>
                        <button
                          onClick={() => setEditingCoins(true)}
                          style={{
                            padding: '4px 8px',
                            background: colors.accent2,
                            color: colors.text,
                            border: 'none',
                            borderRadius: '6px',
                            fontSize: '12px',
                            fontWeight: '600',
                            cursor: 'pointer'
                          }}
                        >
                          Sửa
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                {/* User Documents */}
                <div>
                  <h4 style={{
                    color: colors.text,
                    fontSize: '16px',
                    fontWeight: '600',
                    marginBottom: '16px'
                  }}>
                    Tài liệu đã đăng ({userDocuments.length})
                  </h4>
                  
                  <div style={{
                    maxHeight: '400px',
                    overflowY: 'auto'
                  }}>
                    {userDocuments.length > 0 ? (
                      userDocuments.map(doc => (
                        <div
                          key={doc._id}
                          onClick={() => navigate(`/document/${doc._id}`)}
                          style={{
                            padding: '12px',
                            marginBottom: '8px',
                            background: colors.background3,
                            borderRadius: '8px',
                            cursor: 'pointer',
                            transition: 'all 0.2s ease'
                          }}
                          onMouseEnter={(e) => e.currentTarget.style.background = colors.background}
                          onMouseLeave={(e) => e.currentTarget.style.background = colors.background3}
                        >
                          <div style={{
                            color: colors.text,
                            fontWeight: '600',
                            fontSize: '14px',
                            marginBottom: '4px'
                          }}>
                            {doc.title}
                          </div>
                          <div style={{
                            color: colors.text2,
                            fontSize: '12px'
                          }}>
                            {doc.category} • {doc.views || 0} lượt xem • {doc.downloads || 0} lượt tải
                          </div>
                        </div>
                      ))
                    ) : (
                      <p style={{ color: colors.text2, fontSize: '14px' }}>
                        Chưa có tài liệu nào
                      </p>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

// Helper Components
function StatCard({ title, value, subtitle }) {
  return (
    <div style={{
      background: colors.background2,
      padding: '24px',
      borderRadius: '12px',
      border: `1px solid ${colors.background3}`
    }}>
      <div style={{
        color: colors.text2,
        fontSize: '14px',
        fontWeight: '500',
        marginBottom: '8px'
      }}>
        {title}
      </div>
      <div style={{
        color: colors.text,
        fontSize: '28px',
        fontWeight: '600',
        marginBottom: '4px'
      }}>
        {value}
      </div>
      <div style={{
        color: colors.text2,
        fontSize: '12px'
      }}>
        {subtitle}
      </div>
    </div>
  );
}

function DocumentCard({ doc, type }) {
  const navigate = useNavigate();
  
  return (
    <div
      onClick={() => navigate(`/document/${doc._id}`)}
      style={{
        padding: '16px',
        background: colors.background3,
        borderRadius: '8px',
        cursor: 'pointer',
        transition: 'all 0.2s ease'
      }}
      onMouseEnter={(e) => e.currentTarget.style.background = colors.background}
      onMouseLeave={(e) => e.currentTarget.style.background = colors.background3}
    >
      <div style={{
        color: colors.text,
        fontWeight: '600',
        fontSize: '14px',
        marginBottom: '8px'
      }}>
        {doc.title}
      </div>
      <div style={{
        color: colors.text2,
        fontSize: '12px',
        marginBottom: '12px'
      }}>
        {doc.category}
      </div>
      <div style={{
        display: 'flex',
        gap: '16px',
        fontSize: '13px',
        color: colors.text2
      }}>
        <span>👁️ {doc.views || 0}</span>
        {type === 'comments' && <span>💬 {doc.commentCount || 0} bình luận</span>}
        {type === 'rating' && <span>⭐ {doc.averageRating?.toFixed(1) || '0.0'} ({doc.totalRatings || 0} đánh giá)</span>}
      </div>
    </div>
  );
}

function InfoRow({ label, value }) {
  return (
    <div style={{
      display: 'flex',
      justifyContent: 'space-between',
      padding: '12px 0',
      borderBottom: `1px solid ${colors.background3}`
    }}>
      <span style={{
        color: colors.text2,
        fontSize: '14px',
        fontWeight: '500'
      }}>
        {label}
      </span>
      <span style={{
        color: colors.text,
        fontSize: '15px',
        fontWeight: '600'
      }}>
        {value}
      </span>
    </div>
  );
}
