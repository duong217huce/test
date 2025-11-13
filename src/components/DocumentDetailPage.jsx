import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Header from './Header';

// Mock data chi tiết (sẽ lấy từ API sau)
const mockDocumentDetails = {
  id: 1,
  title: 'Giáo trình Toán cao cấp A1',
  description: 'Giáo trình Toán cao cấp A1 được biên soạn cho sinh viên năm thứ nhất các trường đại học kỹ thuật. Nội dung bao gồm: Vi phân hàm một biến, tích phân hàm một biến, chuỗi số và chuỗi hàm.',
  pages: 245,
  fileSize: '12.5 MB',
  uploadDate: '15/10/2024',
  uploadedBy: 'Nguyễn Văn A',
  grade: 'Đại học',
  subject: 'Toán',
  downloads: 1234,
  views: 5678,
  rating: 4.5,
  totalRatings: 89,
  isPrivate: false,
  fileUrl: '/sample.pdf', // URL để download hoặc view
  tags: ['Toán cao cấp', 'Vi phân', 'Tích phân', 'Đại học']
};

export default function DocumentDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [isSaved, setIsSaved] = useState(false);
  const [userRating, setUserRating] = useState(0);

  // Trong thực tế sẽ fetch từ API dựa trên id
  const document = { ...mockDocumentDetails, id: parseInt(id) };


  const handleSave = () => {
    setIsSaved(!isSaved);
    alert(isSaved ? 'Đã bỏ lưu tài liệu' : 'Đã lưu tài liệu');
  };

  const handleDownload = () => {
    alert('Downloading file...');
    // Logic download sẽ được implement sau
  };

  const handleRate = (rating) => {
    setUserRating(rating);
    alert(`Bạn đã đánh giá ${rating} sao`);
  };

  return (
    <div style={{ minHeight: '100vh', background: '#fffffe', fontFamily: 'Arial, sans-serif' }}>
      <Header />
      <div style={{ height: '130px' }}></div>
      
      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '20px' }}>
        {/* Breadcrumb */}
        <div style={{
          fontSize: '13px',
          color: '#888',
          marginBottom: '20px'
        }}>
          <span 
            onClick={() => navigate('/')}
            style={{ cursor: 'pointer', color: '#4ba3d6' }}
          >
            Trang chủ
          </span>
          {' > '}
          <span 
            onClick={() => navigate(-1)}
            style={{ cursor: 'pointer', color: '#4ba3d6' }}
          >
            {document.grade}
          </span>
          {' > '}
          <span>{document.title}</span>
        </div>

        <div style={{ display: 'flex', gap: '30px' }}>
          {/* Left column - Document preview */}
          <div style={{ flex: '2' }}>
            {/* Document preview area */}
            <div style={{
              background: '#f5f5f5',
              borderRadius: '8px',
              padding: '40px',
              textAlign: 'center',
              marginBottom: '20px',
              minHeight: '500px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexDirection: 'column',
              border: '1px solid #ddd'
            }}>
              <div style={{ fontSize: '80px', marginBottom: '20px' }}>📄</div>
              <div style={{ fontSize: '16px', color: '#666', marginBottom: '20px' }}>
                Preview tài liệu
              </div>
              <button
                onClick={handleDownload}
                style={{
                  padding: '12px 30px',
                  background: '#0d7a4f',
                  color: '#fff',
                  border: 'none',
                  borderRadius: '6px',
                  fontSize: '15px',
                  fontWeight: 'bold',
                  cursor: 'pointer'
                }}
              >
                📥 Tải xuống ({document.fileSize})
              </button>
            </div>

            {/* Description */}
            <div style={{
              background: '#fff',
              borderRadius: '8px',
              padding: '20px',
              boxShadow: '0 2px 8px rgba(0,0,0,0.06)'
            }}>
              <h3 style={{ color: '#133a5c', marginBottom: '15px' }}>Mô tả</h3>
              <p style={{ color: '#2d4a67', lineHeight: '1.6', fontSize: '14px' }}>
                {document.description}
              </p>
            </div>
          </div>

          {/* Right column - Document info */}
          <div style={{ flex: '1' }}>
            <div style={{
              background: '#fff',
              borderRadius: '8px',
              padding: '25px',
              boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
              position: 'sticky',
              top: '150px'
            }}>
              {/* Title */}
              <h2 style={{
                color: '#133a5c',
                fontSize: '22px',
                marginBottom: '15px',
                lineHeight: '1.4'
              }}>
                {document.title}
              </h2>

              {/* Stats */}
              <div style={{
                display: 'flex',
                gap: '20px',
                marginBottom: '20px',
                paddingBottom: '20px',
                borderBottom: '1px solid #eee'
              }}>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: '20px', fontWeight: 'bold', color: '#133a5c' }}>
                    {document.downloads}
                  </div>
                  <div style={{ fontSize: '12px', color: '#888' }}>Lượt tải</div>
                </div>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: '20px', fontWeight: 'bold', color: '#133a5c' }}>
                    {document.views}
                  </div>
                  <div style={{ fontSize: '12px', color: '#888' }}>Lượt xem</div>
                </div>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: '20px', fontWeight: 'bold', color: '#133a5c' }}>
                    {document.pages}
                  </div>
                  <div style={{ fontSize: '12px', color: '#888' }}>Trang</div>
                </div>
              </div>

              {/* Info */}
              <div style={{ marginBottom: '20px' }}>
                <InfoRow label="Người đăng" value={document.uploadedBy} />
                <InfoRow label="Ngày đăng" value={document.uploadDate} />
                <InfoRow label="Cấp học" value={document.grade} />
                <InfoRow label="Môn học" value={document.subject} />
                <InfoRow label="Kích thước" value={document.fileSize} />
              </div>

              {/* Rating */}
              <div style={{
                marginBottom: '20px',
                paddingBottom: '20px',
                borderBottom: '1px solid #eee'
              }}>
                <div style={{ fontSize: '14px', color: '#133a5c', marginBottom: '10px', fontWeight: 'bold' }}>
                  Đánh giá
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px' }}>
                  <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#133a5c' }}>
                    {document.rating}
                  </div>
                  <div>
                    {'⭐'.repeat(Math.floor(document.rating))}
                    {document.rating % 1 !== 0 && '⭐'}
                  </div>
                  <div style={{ fontSize: '12px', color: '#888' }}>
                    ({document.totalRatings} đánh giá)
                  </div>
                </div>
                
                {/* User rating */}
                <div style={{ fontSize: '13px', color: '#666', marginBottom: '8px' }}>
                  Đánh giá của bạn:
                </div>
                <div style={{ display: 'flex', gap: '5px' }}>
                  {[1, 2, 3, 4, 5].map(star => (
                    <span
                      key={star}
                      onClick={() => handleRate(star)}
                      style={{
                        fontSize: '24px',
                        cursor: 'pointer',
                        color: star <= userRating ? '#ffd700' : '#ddd'
                      }}
                    >
                      ⭐
                    </span>
                  ))}
                </div>
              </div>

              {/* Tags */}
              <div style={{ marginBottom: '20px' }}>
                <div style={{ fontSize: '14px', color: '#133a5c', marginBottom: '10px', fontWeight: 'bold' }}>
                  Tags
                </div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                  {document.tags.map(tag => (
                    <span
                      key={tag}
                      style={{
                        background: '#e8f4f8',
                        color: '#133a5c',
                        padding: '5px 12px',
                        borderRadius: '15px',
                        fontSize: '12px',
                        cursor: 'pointer'
                      }}
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>

              {/* Action buttons */}
              <button
                onClick={handleSave}
                style={{
                  width: '100%',
                  padding: '12px',
                  background: isSaved ? '#e8f4f8' : '#fff',
                  color: isSaved ? '#133a5c' : '#2d4a67',
                  border: '1px solid #4ba3d6',
                  borderRadius: '6px',
                  fontSize: '14px',
                  fontWeight: 'bold',
                  cursor: 'pointer',
                  marginBottom: '10px'
                }}
              >
                {isSaved ? '✓ Đã lưu' : '🔖 Lưu tài liệu'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Helper component
function InfoRow({ label, value }) {
  return (
    <div style={{
      display: 'flex',
      justifyContent: 'space-between',
      marginBottom: '12px',
      fontSize: '14px'
    }}>
      <span style={{ color: '#888' }}>{label}:</span>
      <span style={{ color: '#133a5c', fontWeight: '500' }}>{value}</span>
    </div>
  );
}
