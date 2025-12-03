import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from './Header';
import Footer from './Footer';
import { colors } from '../theme/colors';
import { showToast } from '../utils/toast';

function DocumentCard({ doc, onClick }) {
  const [isHovered, setIsHovered] = useState(false);
  const [imageError, setImageError] = useState(false);

  // ✅ Kiểm tra và lấy URL ảnh bìa
  const hasCoverImage = doc.coverImage && !imageError;

  return (
    <div
      onClick={() => onClick(doc._id)}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      style={{
        background: isHovered ? colors.button : colors.background2,
        borderRadius: '12px',
        overflow: 'hidden',
        cursor: 'pointer',
        transition: 'all 0.3s ease',
        boxShadow: isHovered ? '0 8px 16px rgba(0,0,0,0.12)' : '0 2px 8px rgba(0,0,0,0.06)',
        border: `2px solid ${colors.headline}`,
        transform: isHovered ? 'translateY(-4px)' : 'translateY(0)'
      }}
    >
      {/* Document Thumbnail */}
      <div style={{
        width: '100%',
        height: '160px',
        background: isHovered ? colors.buttonHover : colors.background3,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: '48px',
        transition: 'all 0.3s ease',
        overflow: 'hidden',
        position: 'relative'
      }}>
        {hasCoverImage ? (
          <img 
            src={doc.coverImage}
            alt={doc.title}
            onError={() => setImageError(true)}
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'cover',
              transition: 'transform 0.3s ease',
              transform: isHovered ? 'scale(1.05)' : 'scale(1)'
            }}
          />
        ) : (
          <span style={{ 
            opacity: isHovered ? 0.8 : 1,
            transition: 'opacity 0.3s ease'
          }}>
            📄
          </span>
        )}
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

        {/* Category Badge - Hiển thị cấp học và môn học/lĩnh vực cùng nhau */}
        <div style={{
          marginBottom: '12px'
        }}>
          {(doc.grade || doc.subject || doc.field || doc.category) && (
            <span style={{
              display: 'inline-block',
              background: isHovered ? 'rgba(255,255,255,0.2)' : colors.background3,
              color: isHovered ? '#fff' : colors.button,
              padding: '4px 10px',
              borderRadius: '6px',
              fontSize: '11px',
              fontWeight: '500',
              transition: 'all 0.3s ease'
            }}>
              {doc.grade && doc.subject 
                ? `${doc.grade} - ${doc.subject}`
                : doc.grade && doc.field
                ? `${doc.grade} - ${doc.field}`
                : doc.grade
                ? doc.grade
                : doc.subject
                ? doc.subject
                : doc.field
                ? doc.field
                : doc.category}
            </span>
          )}
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
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span>👁️ {doc.views || 0}</span>
            <span>📥 {doc.downloads || 0}</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span>⭐ {doc.averageRating?.toFixed(1) || '0.0'}</span>
            <span>💬 {doc.commentCount || 0}</span>
          </div>
        </div>

        {/* Paid Badge */}
        {doc.isPaid && (
          <div style={{
            marginTop: '10px',
            background: isHovered ? 'rgba(255,255,255,0.3)' : `linear-gradient(135deg, ${colors.accent} 0%, ${colors.tertiary} 100%)`,
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
  const [featuredDocs, setFeaturedDocs] = useState([]);
  const [recentDocs, setRecentDocs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDocuments();
  }, []);

  const fetchDocuments = async () => {
    setLoading(true);
    try {
      const response = await fetch('http://localhost:5000/api/documents');
      const data = await response.json();
      
      // Tài liệu nổi bật: sắp xếp theo lượt xem (giảm dần), nếu bằng nhau thì theo rating
      const featured = [...data]
        .sort((a, b) => {
          const viewsDiff = (b.views || 0) - (a.views || 0);
          if (viewsDiff !== 0) return viewsDiff;
          return (b.averageRating || 0) - (a.averageRating || 0);
        })
        .slice(0, 12);
      
      // Tài liệu mới cập nhật: sắp xếp theo ngày tạo (mới nhất trước)
      const recent = [...data]
        .sort((a, b) => new Date(b.createdAt || b.uploadDate) - new Date(a.createdAt || a.uploadDate))
        .slice(0, 12);
      
      setFeaturedDocs(featured);
      setRecentDocs(recent);
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
            Chúc một ngày tốt lành! Cố lên nào chiến binh!
          </h1>
        </div>

        {loading ? (
          <div style={{ 
            textAlign: 'center', 
            padding: '60px', 
            color: colors.text2 
          }}>
            Đang tải tài liệu...
          </div>
        ) : (
          <>
            {/* Tài liệu nổi bật Section */}
            <section style={{ marginBottom: '60px' }}>
              <h2 style={{
                color: colors.text,
                fontSize: '28px',
                fontWeight: '600',
                marginBottom: '30px',
                textAlign: 'left'
              }}>
                🔥 Tài liệu nổi bật
              </h2>

              {featuredDocs.length === 0 ? (
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
                  {featuredDocs.map(doc => (
                    <DocumentCard 
                      key={doc._id} 
                      doc={doc} 
                      onClick={handleDocumentClick}
                    />
                  ))}
                </div>
              )}
            </section>

            {/* Tài liệu mới cập nhật Section */}
            <section style={{ marginBottom: '60px' }}>
              <h2 style={{
                color: colors.text,
                fontSize: '28px',
                fontWeight: '600',
                marginBottom: '30px',
                textAlign: 'left'
              }}>
                🆕 Tài liệu mới cập nhật
              </h2>

              {recentDocs.length === 0 ? (
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
                  {recentDocs.map(doc => (
                    <DocumentCard 
                      key={doc._id} 
                      doc={doc} 
                      onClick={handleDocumentClick}
                    />
                  ))}
                </div>
              )}
            </section>
          </>
        )}
      </div>

      <Footer />
    </div>
  );
}