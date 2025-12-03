import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from './Header';
import Footer from './Footer';
import AdminNotificationBell from './AdminNotificationBell';
import { colors } from '../theme/colors';
import { showToast } from '../utils/toast';

export default function AdminDashboard() {
  const navigate = useNavigate();
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  
  const [filterType, setFilterType] = useState('month');
  const [customDate, setCustomDate] = useState('');
  
  const [stats, setStats] = useState({
    totalDocuments: 0,
    topCategory: '',
    topSubject: '',
    topGrade: '',
    mostCommentedDoc: null,
    highestRatedDoc: null
  });
  
  const [showUserList, setShowUserList] = useState(false);
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [editingCoins, setEditingCoins] = useState(false);
  const [newCoins, setNewCoins] = useState(0);
  const [userDocuments, setUserDocuments] = useState([]);

  useEffect(() => {
    const admin = localStorage.getItem('isAdmin') === 'true';
    if (!admin) {
      showToast('Ban khong co quyen', 'error');
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
      console.error('Error:', error);
      showToast('Khong tai duoc', 'error');
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
      console.error('Error:', error);
      showToast('Khong tai duoc', 'error');
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
      console.error('Error:', error);
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
        showToast('Cap nhat thanh cong', 'success');
        setEditingCoins(false);
        setSelectedUser({ ...selectedUser, coins: newCoins });
        fetchUsers();
      } else {
        showToast('Loi', 'error');
      }
    } catch (error) {
      console.error('Error:', error);
      showToast('Loi', 'error');
    }
  };

  const getFilterLabel = () => {
    switch(filterType) {
      case 'day': return 'Hom nay';
      case 'week': return 'Tuan nay';
      case 'month': return 'Thang nay';
      case 'year': return 'Nam nay';
      default: return 'Thang nay';
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

          <div style={{ display: 'flex', gap: '20px', alignItems: 'center' }}>
            <AdminNotificationBell />
            
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
                cursor: 'pointer'
              }}
            >
              {showUserList ? 'Xem thong ke' : 'Nguoi dung'}
            </button>
          </div>
        </div>

        {!showUserList ? (
          <>
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
                Bo loc thoi gian
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
                      cursor: 'pointer'
                    }}
                  >
                    {type === 'day' && 'Ngay'}
                    {type === 'week' && 'Tuan'}
                    {type === 'month' && 'Thang'}
                    {type === 'year' && 'Nam'}
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

            {loading ? (
              <div style={{ textAlign: 'center', padding: '60px', color: colors.text2 }}>
                Dang tai...
              </div>
            ) : (
              <>
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(4, 1fr)',
                  gap: '20px',
                  marginBottom: '30px'
                }}>
                  <StatCard title="Tai lieu" value={stats.totalDocuments} subtitle={getFilterLabel()} />
                  <StatCard title="Chu de" value={stats.topCategory || 'N/A'} subtitle="Pho bien" />
                  <StatCard title="Mon hoc" value={stats.topSubject || 'N/A'} subtitle="Pho bien" />
                  <StatCard title="Cap do" value={stats.topGrade || 'N/A'} subtitle="Pho bien" />
                </div>

                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(2, 1fr)',
                  gap: '20px'
                }}>
                  <div style={{
                    background: colors.background2,
                    padding: '24px',
                    borderRadius: '12px',
                    border: `1px solid ${colors.background3}`
                  }}>
                    <h3 style={{ color: colors.text, fontSize: '18px', fontWeight: '600', marginBottom: '16px' }}>
                      Nhieu binh luan
                    </h3>
                    {stats.mostCommentedDoc ? (
                      <DocumentCard doc={stats.mostCommentedDoc} type="comments" />
                    ) : (
                      <p style={{ color: colors.text2, fontSize: '14px' }}>Chua co</p>
                    )}
                  </div>

                  <div style={{
                    background: colors.background2,
                    padding: '24px',
                    borderRadius: '12px',
                    border: `1px solid ${colors.background3}`
                  }}>
                    <h3 style={{ color: colors.text, fontSize: '18px', fontWeight: '600', marginBottom: '16px' }}>
                      Danh gia cao
                    </h3>
                    {stats.highestRatedDoc ? (
                      <DocumentCard doc={stats.highestRatedDoc} type="rating" />
                    ) : (
                      <p style={{ color: colors.text2, fontSize: '14px' }}>Chua co</p>
                    )}
                  </div>
                </div>
              </>
            )}
          </>
        ) : (
          <div style={{
            display: 'grid',
            gridTemplateColumns: selectedUser ? '1fr 2fr' : '1fr',
            gap: '30px'
          }}>
            <div style={{
              background: colors.background2,
              padding: '24px',
              borderRadius: '12px',
              border: `1px solid ${colors.background3}`,
              maxHeight: '800px',
              overflowY: 'auto'
            }}>
              <h3 style={{ color: colors.text, fontSize: '18px', fontWeight: '600', marginBottom: '20px' }}>
                Nguoi dung ({users.length})
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
                    border: `1px solid ${selectedUser?._id === user._id ? colors.accent2 : 'transparent'}`
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
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
                      <div style={{ color: colors.text, fontWeight: '600', fontSize: '14px' }}>
                        {user.fullName || user.username}
                      </div>
                      <div style={{ color: colors.text2, fontSize: '12px' }}>
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

            {selectedUser && (
              <div style={{
                background: colors.background2,
                padding: '24px',
                borderRadius: '12px',
                border: `1px solid ${colors.background3}`
              }}>
                <h3 style={{ color: colors.text, fontSize: '18px', fontWeight: '600', marginBottom: '20px' }}>
                  Chi tiet
                </h3>

                <div style={{ marginBottom: '30px' }}>
                  <InfoRow label="Username" value={selectedUser.username} />
                  <InfoRow label="Ho ten" value={selectedUser.fullName || 'Chua cap nhat'} />
                  <InfoRow label="Email" value={selectedUser.email} />
                  <InfoRow label="Cap hoc" value={selectedUser.educationLevel || 'Chua cap nhat'} />
                  <InfoRow label="Lop" value={selectedUser.class || 'Chua cap nhat'} />
                  <InfoRow label="Nganh" value={selectedUser.major || 'Chua cap nhat'} />
                  
                  <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    padding: '12px 0',
                    borderBottom: `1px solid ${colors.background3}`
                  }}>
                    <span style={{ color: colors.text2, fontSize: '14px', fontWeight: '500' }}>DP</span>
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
                        <button onClick={handleUpdateCoins} style={{
                          padding: '6px 12px',
                          background: colors.accent2,
                          color: colors.text,
                          border: 'none',
                          borderRadius: '6px',
                          fontSize: '12px',
                          fontWeight: '600',
                          cursor: 'pointer'
                        }}>Luu</button>
                        <button onClick={() => { setEditingCoins(false); setNewCoins(selectedUser.coins || 0); }} style={{
                          padding: '6px 12px',
                          background: colors.background3,
                          color: colors.text2,
                          border: 'none',
                          borderRadius: '6px',
                          fontSize: '12px',
                          cursor: 'pointer'
                        }}>Huy</button>
                      </div>
                    ) : (
                      <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                        <span style={{ color: colors.text, fontSize: '15px', fontWeight: '600' }}>
                          {selectedUser.coins || 0} DP
                        </span>
                        <button onClick={() => setEditingCoins(true)} style={{
                          padding: '4px 8px',
                          background: colors.accent2,
                          color: colors.text,
                          border: 'none',
                          borderRadius: '6px',
                          fontSize: '12px',
                          fontWeight: '600',
                          cursor: 'pointer'
                        }}>Sua</button>
                      </div>
                    )}
                  </div>
                </div>

                <div>
                  <h4 style={{ color: colors.text, fontSize: '16px', fontWeight: '600', marginBottom: '16px' }}>
                    Tai lieu ({userDocuments.length})
                  </h4>
                  
                  <div style={{ maxHeight: '400px', overflowY: 'auto' }}>
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
                            cursor: 'pointer'
                          }}
                        >
                          <div style={{ color: colors.text, fontWeight: '600', fontSize: '14px', marginBottom: '4px' }}>
                            {doc.title}
                          </div>
                          <div style={{ color: colors.text2, fontSize: '12px' }}>
                            {doc.category} - {doc.views || 0} xem - {doc.downloads || 0} tai
                          </div>
                        </div>
                      ))
                    ) : (
                      <p style={{ color: colors.text2, fontSize: '14px' }}>Chua co</p>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
      <Footer />
    </div>
  );
}

function StatCard({ title, value, subtitle }) {
  return (
    <div style={{ background: colors.background2, padding: '24px', borderRadius: '12px', border: `1px solid ${colors.background3}` }}>
      <div style={{ color: colors.text2, fontSize: '14px', fontWeight: '500', marginBottom: '8px' }}>{title}</div>
      <div style={{ color: colors.text, fontSize: '28px', fontWeight: '600', marginBottom: '4px' }}>{value}</div>
      <div style={{ color: colors.text2, fontSize: '12px' }}>{subtitle}</div>
    </div>
  );
}

function DocumentCard({ doc, type }) {
  const navigate = useNavigate();
  return (
    <div onClick={() => navigate(`/document/${doc._id}`)} style={{
      padding: '16px',
      background: colors.background3,
      borderRadius: '8px',
      cursor: 'pointer'
    }}>
      <div style={{ color: colors.text, fontWeight: '600', fontSize: '14px', marginBottom: '8px' }}>{doc.title}</div>
      <div style={{ color: colors.text2, fontSize: '12px', marginBottom: '12px' }}>{doc.category}</div>
      <div style={{ display: 'flex', gap: '16px', fontSize: '13px', color: colors.text2 }}>
        <span>{doc.views || 0} xem</span>
        {type === 'comments' && <span>{doc.commentCount || 0} binh luan</span>}
        {type === 'rating' && <span>{doc.averageRating?.toFixed(1) || '0.0'} sao</span>}
      </div>
    </div>
  );
}

function InfoRow({ label, value }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', padding: '12px 0', borderBottom: `1px solid ${colors.background3}` }}>
      <span style={{ color: colors.text2, fontSize: '14px', fontWeight: '500' }}>{label}</span>
      <span style={{ color: colors.text, fontSize: '15px', fontWeight: '600' }}>{value}</span>
    </div>
  );
}
