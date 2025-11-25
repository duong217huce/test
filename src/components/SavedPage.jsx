import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import Header from './Header';

export default function SavedPage() {
  const navigate = useNavigate();
  const [savedDocuments, setSavedDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    const loggedIn = localStorage.getItem('isLoggedIn') === 'true';
    setIsLoggedIn(loggedIn);

    if (!loggedIn) {
      alert('Vui lòng đăng nhập để xem tài liệu đã lưu!');
      navigate('/login');
      return;
    }

    fetchSavedDocuments();
  }, []);

  const fetchSavedDocuments = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('http://localhost:5000/api/users/saved', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (res.ok) {
        const data = await res.json();
        setSavedDocuments(data);
        console.log('📚 Saved documents loaded:', data.length);
      } else {
        console.error('❌ Error fetching saved documents');
        setSavedDocuments([]);
      }
    } catch (err) {
      console.error('❌ Error:', err);
      setSavedDocuments([]);
    } finally {
      setLoading(false);
    }
  };

  const handleUnsave = async (docId) => {
    if (!window.confirm('Bạn có chắc muốn bỏ lưu tài liệu này?')) return;

    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`http://localhost:5000/api/users/saved/${docId}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (res.ok) {
        // Refresh danh sách
        fetchSavedDocuments();
      }
    } catch (err) {
      console.error('❌ Error unsaving document:', err);
    }
  };

  if (!isLoggedIn) {
    return null;
  }

  return (
    <div style={{ minHeight: '100vh', background: '#fffffe', fontFamily: 'Arial, sans-serif' }}>
      <Header />
      <div style={{ height: '130px' }}></div>

      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '40px 20px' }}>
        <h2 style={{ color: '#133a5c', marginBottom: '10px', fontSize: '28px' }}>
          🔖 Tài liệu đã lưu
        </h2>
        <p style={{ color: '#666', marginBottom: '30px' }}>
          {loading ? 'Đang tải...' : `Bạn có ${savedDocuments.length} tài liệu đã lưu`}
        </p>

        {loading ? (
          <div style={{ textAlign: 'center', padding: '60px', color: '#888' }}>
            Đang tải...
          </div>
        ) : savedDocuments.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '60px' }}>
            <div style={{ fontSize: '64px', marginBottom: '20px' }}>📭</div>
            <h3 style={{ color: '#666', marginBottom: '10px' }}>
              Chưa có tài liệu nào được lưu
            </h3>
            <p style={{ color: '#888', marginBottom: '20px' }}>
              Lưu tài liệu yêu thích để dễ dàng truy cập sau này
            </p>
            <Link 
              to="/"
              style={{
                display: 'inline-block',
                padding: '12px 30px',
                background: '#4ba3d6',
                color: '#fff',
                textDecoration: 'none',
                borderRadius: '6px',
                fontWeight: 'bold'
              }}
            >
              Khám phá tài liệu
            </Link>
          </div>
        ) : (
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))',
            gap: '20px'
          }}>
            {savedDocuments.map((doc) => (
              <div
                key={doc._id}
                style={{
                  background: '#fff',
                  borderRadius: '12px',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
                  overflow: 'hidden',
                  position: 'relative'
                }}
              >
                <Link 
                  to={`/document/${doc._id}`}
                  style={{ textDecoration: 'none', color: 'inherit' }}
                >
                  <div style={{
                    background: 'linear-gradient(135deg, #b4cbe0 0%, #8eb4d4 100%)',
                    width: '100%',
                    height: '180px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '48px'
                  }}>
                    📚
                  </div>
                  <div style={{ padding: '15px' }}>
                    <div style={{ 
                      fontWeight: 'bold', 
                      color: '#133a5c', 
                      marginBottom: '10px', 
                      fontSize: '15px',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap'
                    }}>
                      {doc.title}
                    </div>
                    <div style={{ fontSize: '12px', color: '#888', marginBottom: '6px' }}>
                      📁 {doc.category}
                    </div>
                    <div style={{ fontSize: '11px', color: '#888', marginBottom: '8px' }}>
                      👤 {(doc.uploadedBy && doc.uploadedBy.username) || 'Ẩn danh'}
                    </div>
                    <div style={{ 
                      display: 'flex', 
                      justifyContent: 'space-between', 
                      alignItems: 'center',
                      paddingTop: '8px',
                      borderTop: '1px solid #eee'
                    }}>
                      <div style={{ fontSize: '12px', color: '#ff8c00', fontWeight: 'bold' }}>
                        ⭐ {doc.averageRating || "0"}
                      </div>
                      <div style={{ fontSize: '12px', color: '#666' }}>
                        👁️ {doc.views || 0}
                      </div>
                    </div>
                  </div>
                </Link>
                
                {/* Nút bỏ lưu */}
                <button
                  onClick={(e) => {
                    e.preventDefault();
                    handleUnsave(doc._id);
                  }}
                  style={{
                    position: 'absolute',
                    top: '10px',
                    right: '10px',
                    background: 'rgba(255,255,255,0.9)',
                    border: 'none',
                    borderRadius: '50%',
                    width: '35px',
                    height: '35px',
                    cursor: 'pointer',
                    fontSize: '18px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    boxShadow: '0 2px 6px rgba(0,0,0,0.15)',
                    transition: 'transform 0.2s'
                  }}
                  onMouseOver={(e) => e.currentTarget.style.transform = 'scale(1.1)'}
                  onMouseOut={(e) => e.currentTarget.style.transform = 'scale(1)'}
                  title="Bỏ lưu"
                >
                  ❌
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
