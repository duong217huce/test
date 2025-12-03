import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import Header from './Header';
import Footer from './Footer';

// ✅ Component hiển thị ảnh bìa tài liệu
function DocumentCover({ coverImage, title }) {
  const [imageError, setImageError] = useState(false);

  if (coverImage && !imageError) {
    return (
      <div style={{
        width: '100%',
        height: '140px',
        borderRadius: '8px',
        overflow: 'hidden',
        marginBottom: '15px'
      }}>
        <img 
          src={coverImage}
          alt={title}
          onError={() => setImageError(true)}
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'cover'
          }}
        />
      </div>
    );
  }
  
  return (
    <div style={{ fontSize: '40px', marginBottom: '15px', textAlign: 'center' }}>
      📄
    </div>
  );
}

export default function SearchPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const query = searchParams.get('q') || '';

  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (query) {
      fetchSearchResults();
    }
  }, [query]);

  const fetchSearchResults = async () => {
    setLoading(true);
    try {
      const res = await fetch(
        `http://localhost:5000/api/documents/search?q=${encodeURIComponent(query)}&limit=50`
      );
      const data = await res.json();
      setDocuments(data);
    } catch (err) {
      console.error('❌ Error fetching search results:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', background: '#fffffe' }}>
      <Header />
      <div style={{ height: '130px' }}></div>

      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '20px' }}>
        <h2 style={{ color: '#133a5c', marginBottom: '10px' }}>
          Kết quả tìm kiếm cho: "{query}"
        </h2>
        <p style={{ color: '#666', marginBottom: '30px' }}>
          {loading ? 'Đang tìm kiếm...' : `Tìm thấy ${documents.length} kết quả`}
        </p>

        {loading ? (
          <div style={{ textAlign: 'center', padding: '60px', color: '#888' }}>
            Đang tải...
          </div>
        ) : documents.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '60px' }}>
            <div style={{ fontSize: '64px', marginBottom: '20px' }}>🔍</div>
            <h3 style={{ color: '#666', marginBottom: '10px' }}>
              Không tìm thấy kết quả
            </h3>
            <p style={{ color: '#888' }}>
              Thử tìm kiếm với từ khóa khác
            </p>
          </div>
        ) : (
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
            gap: '20px'
          }}>
            {documents.map((doc) => (
              <div
                key={doc._id}
                onClick={() => navigate(`/document/${doc._id}`)}
                style={{
                  background: '#fff',
                  borderRadius: '12px',
                  padding: '20px',
                  cursor: 'pointer',
                  transition: 'all 0.3s',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
                  border: '1px solid #eee'
                }}
                onMouseOver={(e) => {
                  e.currentTarget.style.transform = 'translateY(-5px)';
                  e.currentTarget.style.boxShadow = '0 6px 20px rgba(0,0,0,0.12)';
                }}
                onMouseOut={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.08)';
                }}
              >
                <DocumentCover coverImage={doc.coverImage} title={doc.title} />
                <h3 style={{
                  color: '#133a5c',
                  fontSize: '16px',
                  marginBottom: '10px',
                  fontWeight: 'bold',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap'
                }}>
                  {doc.title}
                </h3>
                <p style={{
                  color: '#666',
                  fontSize: '13px',
                  marginBottom: '10px',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  display: '-webkit-box',
                  WebkitLineClamp: 2,
                  WebkitBoxOrient: 'vertical'
                }}>
                  {doc.description}
                </p>
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  fontSize: '12px',
                  color: '#888',
                  marginTop: '15px',
                  paddingTop: '15px',
                  borderTop: '1px solid #eee'
                }}>
                  <span>📁 {doc.category}</span>
                  <span>👁️ {doc.views || 0}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      <Footer />
    </div>
  );
}
    