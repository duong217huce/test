import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from './Header';
import { colors } from '../theme/colors';
import { showToast } from '../utils/toast';

function DocumentCard({ doc, onClick }) {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <div
      onClick={() => onClick(doc._id)}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      style={{
        background: isHovered ? '#3da9fc' : colors.background2,
        borderRadius: '12px',
        overflow: 'hidden',
        cursor: 'pointer',
        transition: 'all 0.3s ease',
        boxShadow: isHovered ? '0 8px 16px rgba(0,0,0,0.12)' : '0 2px 8px rgba(0,0,0,0.06)',
        border: '2px solid #094067',
        transform: isHovered ? 'translateY(-4px)' : 'translateY(0)'
      }}
    >
      {/* Document Thumbnail */}
      <div style={{
        width: '100%',
        height: '160px',
        background: isHovered ? '#2d8ecf' : colors.background3,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: '48px',
        transition: 'all 0.3s ease'
      }}>
        📄
      </div>

      {/* Document Info */}
      <div style={{ padding: '16px' }}>
        {/* Title */}
        <h3 style={{
          color: isHovered ? '#fff' : colors.text,
          fontSize: '14px',
          fontWeight: '600',
          marginBottom: '8px',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          display: '-webkit-box',
          WebkitLineClamp: 2,
          WebkitBoxOrient: 'vertical',
          lineHeight: '1.4',
          minHeight: '40px',
          transition: 'all 0.3s ease'
        }}>
          {doc.title}
        </h3>

        {/* Category Badge with Subject/Field */}
        <div style={{
          display: 'inline-block',
          background: isHovered ? 'rgba(255,255,255,0.2)' : colors.background3,
          color: isHovered ? '#fff' : colors.text2,
          padding: '4px 10px',
          borderRadius: '6px',
          fontSize: '11px',
          fontWeight: '500',
          marginBottom: '12px',
          transition: 'all 0.3s ease'
        }}>
          {doc.grade && doc.subject 
            ? `${doc.grade} - ${doc.subject}`
            : doc.field 
            ? doc.field
            : doc.category}
        </div>

        {/* Stats */}
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '8px',
          marginTop: '12px',
          paddingTop: '12px',
          borderTop: `1px solid ${isHovered ? 'rgba(255,255,255,0.3)' : colors.background3}`,
          fontSize: '12px',
          color: isHovered ? '#fff' : colors.text2,
          transition: 'all 0.3s ease'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span>👁️ {doc.views || 0}</span>
            <span>⭐ {doc.averageRating?.toFixed(1) || '0.0'}</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span>📥 {doc.downloads || 0}</span>
            <span></span>
          </div>
        </div>

        {/* Paid Badge */}
        {doc.isPaid && (
          <div style={{
            marginTop: '10px',
            background: isHovered ? 'rgba(255,255,255,0.3)' : `linear-gradient(135deg, ${colors.accent} 0%, #ff6b7a 100%)`,
            color: '#fff',
            padding: '6px 10px',
            borderRadius: '6px',
            fontSize: '12px',
            fontWeight: '600',
            textAlign: 'center',
            transition: 'all 0.3s ease'
          }}>
            {doc.price} DP
          </div>
        )}
      </div>
    </div>
  );
}

export default function HomePage() {
  const navigate = useNavigate();
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDocuments();
  }, []);

  const fetchDocuments = async () => {
    setLoading(true);
    try {
      const response = await fetch('http://localhost:5000/api/documents');
      const data = await response.json();
      setDocuments(data);
    } catch (error) {
      console.error('Error fetching documents:', error);
      showToast('Không thể tải tài liệu', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleDocumentClick = (id) => {
    navigate(`/document/${id}`);
  };

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
        
        {/* Welcome Message */}
        <div style={{
          marginBottom: '50px',
          textAlign: 'center'
        }}>
          <h1 style={{
            color: colors.text,
            fontSize: '32px',
            fontWeight: '600',
            margin: 0
          }}>
            Chào mừng đến với EduConnect, hôm nay chúng ta sẽ học gì nào
          </h1>
        </div>

        {/* Featured Documents Section Title */}
        <h2 style={{
          color: colors.text,
          fontSize: '28px',
          fontWeight: '600',
          marginBottom: '30px',
          textAlign: 'left'
        }}>
          Tài liệu nổi bật
        </h2>

        {/* Documents Grid - 6 per row */}
        {loading ? (
          <div style={{ 
            textAlign: 'center', 
            padding: '60px', 
            color: colors.text2 
          }}>
            Đang tải tài liệu...
          </div>
        ) : documents.length === 0 ? (
          <div style={{ 
            textAlign: 'center', 
            padding: '60px', 
            color: colors.text2 
          }}>
            Chưa có tài liệu nào
          </div>
        ) : (
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(6, 1fr)',
            gap: '20px'
          }}>
            {documents.map(doc => (
              <DocumentCard 
                key={doc._id} 
                doc={doc} 
                onClick={handleDocumentClick}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
