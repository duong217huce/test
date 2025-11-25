import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Header from './Header';

export default function HomePage() {
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDocs = async () => {
      setLoading(true);
      try {
        const response = await fetch('http://localhost:5000/api/documents');
        const data = await response.json();
        setDocuments(data);
      } catch (e) {
        console.error('❌ Error fetching documents:', e);
        setDocuments([]);
      } finally {
        setLoading(false);
      }
    };
    fetchDocs();
  }, []);

  return (
    <div style={{ minHeight: '100vh', background: '#fffffe', fontFamily: 'Arial, sans-serif' }}>
      <Header />
      
      {/* Spacer cho header */}
      <div style={{ height: '130px' }}></div>

      {/* Hero Section */}
      <div style={{
        background: 'linear-gradient(135deg, #4ba3d6 0%, #0d7a4f 100%)',
        padding: '80px 20px',
        textAlign: 'center',
        color: '#fff'
      }}>
        <h1 style={{ fontSize: '48px', marginBottom: '20px', fontWeight: 'bold' }}>
          Chào mừng đến với EDUCONNECT
        </h1>
        <p style={{ fontSize: '20px', opacity: 0.9, marginBottom: '30px' }}>
          Nền tảng chia sẻ tài liệu học tập miễn phí cho mọi người
        </p>
        <div style={{ fontSize: '16px', opacity: 0.85 }}>
          📚 Hơn {documents.length} tài liệu đang chờ bạn khám phá
        </div>
      </div>

      {/* Featured Documents */}
      <div style={{
        maxWidth: '1200px',
        margin: '0 auto',
        padding: '60px 20px'
      }}>
        <h2 style={{ 
          color: '#133a5c', 
          marginBottom: '30px', 
          fontSize: '28px', 
          textAlign: 'center',
          fontWeight: 'bold'
        }}>
          📌 Tài liệu nổi bật
        </h2>
        
        {loading ? (
          <div style={{ textAlign: 'center', padding: '60px', color: '#888' }}>
            Đang tải tài liệu...
          </div>
        ) : (
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))',
            gap: '20px'
          }}>
            {documents.slice(0, 12).map((doc) => (
              <Link 
                key={doc._id} 
                to={`/document/${doc._id}`} 
                style={{ textDecoration: 'none', color: 'inherit' }}
              >
                <div style={{
                  background: '#fff',
                  borderRadius: '12px',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
                  cursor: 'pointer',
                  transition: 'all 0.3s',
                  overflow: 'hidden'
                }}
                onMouseOver={(e) => {
                  e.currentTarget.style.transform = 'translateY(-5px)';
                  e.currentTarget.style.boxShadow = '0 6px 20px rgba(0,0,0,0.12)';
                }}
                onMouseOut={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.06)';
                }}
                >
                  <div style={{
                    background: 'linear-gradient(135deg, #b4cbe0 0%, #8eb4d4 100%)',
                    width: '100%',
                    height: '180px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#fff',
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
                    <div style={{ fontSize: '12px', color: '#888', marginBottom: '6px' }}>
                      📄 {doc.fileSize ? (doc.fileSize / 1024).toFixed(1) + " KB" : "N/A"}
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
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>

      {/* Call to Action */}
      <div style={{
        background: '#f5f5f5',
        padding: '60px 20px',
        textAlign: 'center'
      }}>
        <h3 style={{ color: '#133a5c', fontSize: '24px', marginBottom: '15px' }}>
          Chia sẻ tài liệu của bạn
        </h3>
        <p style={{ color: '#666', marginBottom: '25px', fontSize: '16px' }}>
          Cùng nhau xây dựng cộng đồng học tập miễn phí
        </p>
        <Link 
          to="/upload"
          style={{
            display: 'inline-block',
            padding: '15px 40px',
            background: 'linear-gradient(135deg, #4ba3d6 0%, #0d7a4f 100%)',
            color: '#fff',
            textDecoration: 'none',
            borderRadius: '25px',
            fontSize: '16px',
            fontWeight: 'bold',
            transition: 'transform 0.2s',
            boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
          }}
          onMouseOver={(e) => e.currentTarget.style.transform = 'scale(1.05)'}
          onMouseOut={(e) => e.currentTarget.style.transform = 'scale(1)'}
        >
          📤 Đăng tài liệu ngay
        </Link>
      </div>

      {/* Footer */}
      <div style={{
        background: '#133a5c',
        color: '#fff',
        textAlign: 'center',
        padding: '40px 20px'
      }}>
        <p style={{ fontSize: '16px', opacity: 0.9 }}>
          © 2025 EDUCONNECT - Nền tảng chia sẻ tài liệu học tập
        </p>
      </div>
    </div>
  );
}
