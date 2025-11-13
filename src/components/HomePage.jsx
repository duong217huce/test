import React, { useMemo } from 'react';
import { Link } from 'react-router-dom';
import Header from './Header';

// Mock data đầy đủ với rating và review count
const allDocuments = [
  // Giáo dục phổ thông
  { id: 1, title: 'Toán nâng cao lớp 10', pages: 245, author: 'Nguyễn Văn A', rating: 4.8, totalRatings: 156, category: 'education' },
  { id: 2, title: 'Vật lý đại cương', pages: 320, author: 'Trần Thị B', rating: 4.7, totalRatings: 142, category: 'education' },
  { id: 3, title: 'Hóa học hữu cơ lớp 11', pages: 180, author: 'Lê Văn C', rating: 4.9, totalRatings: 201, category: 'education' },
  { id: 4, title: 'Sinh học THPT', pages: 200, author: 'Phạm Thị D', rating: 4.6, totalRatings: 128, category: 'education' },
  { id: 5, title: 'English Grammar 12', pages: 150, author: 'Hoàng Văn E', rating: 4.5, totalRatings: 95, category: 'education' },
  { id: 6, title: 'Lịch sử Việt Nam', pages: 280, author: 'Võ Thị F', rating: 4.8, totalRatings: 134, category: 'education' },
  { id: 7, title: 'Địa lý lớp 12', pages: 190, author: 'Đỗ Văn G', rating: 4.4, totalRatings: 89, category: 'education' },
  { id: 8, title: 'Toán lớp 9', pages: 220, author: 'Bùi Thị H', rating: 4.7, totalRatings: 167, category: 'education' },
  
  // Văn học
  { id: 11, title: 'Truyện Kiều', pages: 180, author: 'Nguyễn Du', rating: 5.0, totalRatings: 523, category: 'literature' },
  { id: 12, title: 'Số Đỏ', pages: 250, author: 'Vũ Trọng Phụng', rating: 4.9, totalRatings: 412, category: 'literature' },
  { id: 13, title: 'Chiến tranh và Hòa bình', pages: 800, author: 'Leo Tolstoy', rating: 4.8, totalRatings: 678, category: 'literature' },
  { id: 14, title: 'Đắc Nhân Tâm', pages: 320, author: 'Dale Carnegie', rating: 4.7, totalRatings: 892, category: 'literature' },
  { id: 15, title: 'Harry Potter', pages: 450, author: 'J.K. Rowling', rating: 4.9, totalRatings: 1245, category: 'literature' },
  { id: 16, title: 'Nhà Giả Kim', pages: 200, author: 'Paulo Coelho', rating: 4.6, totalRatings: 567, category: 'literature' },
  { id: 17, title: 'Lão Hạc', pages: 120, author: 'Nam Cao', rating: 4.8, totalRatings: 234, category: 'literature' },
  { id: 18, title: '1984', pages: 350, author: 'George Orwell', rating: 4.7, totalRatings: 789, category: 'literature' },
  { id: 19, title: 'Dế Mèn Phiêu Lưu Ký', pages: 180, author: 'Tô Hoài', rating: 4.5, totalRatings: 156, category: 'literature' },
  { id: 20, title: 'Tôi Thấy Hoa Vàng Trên Cỏ Xanh', pages: 280, author: 'Nguyễn Nhật Ánh', rating: 4.8, totalRatings: 445, category: 'literature' },
  { id: 21, title: 'Chí Phèo', pages: 100, author: 'Nam Cao', rating: 4.6, totalRatings: 198, category: 'literature' },
  { id: 22, title: 'Vợ Nhặt', pages: 90, author: 'Kim Lân', rating: 4.7, totalRatings: 167, category: 'literature' },
  
  // Luận văn
  { id: 31, title: 'Nghiên cứu AI trong giáo dục', pages: 150, author: 'TS. Nguyễn I', rating: 4.9, totalRatings: 87, category: 'thesis' },
  { id: 32, title: 'Phân tích kinh tế Việt Nam', pages: 200, author: 'ThS. Trần K', rating: 4.7, totalRatings: 134, category: 'thesis' },
  { id: 33, title: 'Luận văn Machine Learning', pages: 180, author: 'TS. Lê L', rating: 4.8, totalRatings: 156, category: 'thesis' },
  { id: 34, title: 'Nghiên cứu về blockchain', pages: 220, author: 'PGS. Phạm M', rating: 4.6, totalRatings: 98, category: 'thesis' },
  { id: 35, title: 'Phát triển bền vững', pages: 250, author: 'GS. Hoàng N', rating: 4.5, totalRatings: 76, category: 'thesis' },
  { id: 36, title: 'Quản trị doanh nghiệp', pages: 190, author: 'ThS. Võ O', rating: 4.7, totalRatings: 112, category: 'thesis' },
  { id: 37, title: 'Marketing số', pages: 160, author: 'TS. Đỗ P', rating: 4.8, totalRatings: 145, category: 'thesis' },
  { id: 38, title: 'Luật doanh nghiệp', pages: 280, author: 'PGS. Bùi Q', rating: 4.4, totalRatings: 89, category: 'thesis' },
];

export default function HomePage() {
  // Sort documents by rating (high to low), then by totalRatings
  const sortedDocs = useMemo(() => {
    return [...allDocuments].sort((a, b) => {
      if (b.rating !== a.rating) {
        return b.rating - a.rating;
      }
      return b.totalRatings - a.totalRatings;
    });
  }, []);

  // Get top documents by category
  const topEducation = sortedDocs.filter(doc => doc.category === 'education').slice(0, 6);
  const topLiterature = sortedDocs.filter(doc => doc.category === 'literature').slice(0, 12);
  const topThesis = sortedDocs.filter(doc => doc.category === 'thesis').slice(0, 6);

  return (
    <div style={{ minHeight: '100vh', background: '#fffffe', fontFamily: 'Arial, sans-serif' }}>
      <Header />
      <div style={{ height: '130px' }}></div>
      
      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '20px' }}>
        {/* Tài liệu nổi bật (Giáo dục phổ thông) */}
        <h2 style={{ color: '#133a5c', marginBottom: '20px', fontSize: '20px' }}>
          Tài liệu nổi bật
        </h2>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))',
          gap: '20px',
          marginBottom: '50px'
        }}>
          {topEducation.map((doc) => (
            <Link 
              key={doc.id}
              to={`/document/${doc.id}`}
              style={{ textDecoration: 'none', color: 'inherit' }}
            >
              <div style={{
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
              }}>
                <div style={{
                  background: '#b4cbe0',
                  width: '100%',
                  height: '180px',
                  borderRadius: '7px 7px 0 0',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#fff',
                  fontSize: '14px'
                }}>
                  📚
                </div>
                <div style={{ padding: '12px' }}>
                  <div style={{ fontWeight: 'bold', color: '#133a5c', marginBottom: '8px', fontSize: '14px' }}>
                    {doc.title}
                  </div>
                  <div style={{ fontSize: '12px', color: '#888', marginBottom: '4px' }}>
                    📄 {doc.pages} trang
                  </div>
                  <div style={{ fontSize: '11px', color: '#888', marginBottom: '6px' }}>
                    👤 {doc.author}
                  </div>
                  <div style={{ fontSize: '12px', color: '#ff8c00', fontWeight: 'bold' }}>
                    ⭐ {doc.rating} ({doc.totalRatings} đánh giá)
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>

        {/* Văn học nổi bật */}
        <h2 style={{ color: '#133a5c', marginBottom: '20px', fontSize: '20px' }}>
          Văn học nổi bật
        </h2>
        <div style={{ 
          display: 'flex', 
          gap: '20px',
          overflowX: 'auto',
          paddingBottom: '10px',
          marginBottom: '50px'
        }}>
          {topLiterature.map((doc) => (
            <Link
              key={doc.id}
              to={`/document/${doc.id}`}
              style={{ flex: '0 0 220px', textDecoration: 'none', color: 'inherit' }}
            >
              <div style={{
                background: '#fff',
                borderRadius: '7px',
                boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
                cursor: 'pointer',
                transition: 'transform 0.2s'
              }}
              onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-4px)'}
              onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}>
                <div style={{
                  background: '#b4cbe0',
                  width: '100%',
                  height: '180px',
                  borderRadius: '7px 7px 0 0',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#fff',
                  fontSize: '40px'
                }}>
                  📖
                </div>
                <div style={{ padding: '12px' }}>
                  <div style={{ fontWeight: 'bold', color: '#133a5c', marginBottom: '8px', fontSize: '14px' }}>
                    {doc.title}
                  </div>
                  <div style={{ fontSize: '12px', color: '#888', marginBottom: '4px' }}>
                    📄 {doc.pages} trang
                  </div>
                  <div style={{ fontSize: '11px', color: '#888', marginBottom: '6px' }}>
                    ✍️ {doc.author}
                  </div>
                  <div style={{ fontSize: '12px', color: '#ff8c00', fontWeight: 'bold' }}>
                    ⭐ {doc.rating} ({doc.totalRatings})
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>

        {/* Luận văn nổi bật */}
        <h2 style={{ color: '#133a5c', marginBottom: '20px', fontSize: '20px' }}>
          Luận văn nổi bật
        </h2>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))',
          gap: '20px'
        }}>
          {topThesis.map((doc) => (
            <Link
              key={doc.id}
              to={`/document/${doc.id}`}
              style={{ textDecoration: 'none', color: 'inherit' }}
            >
              <div style={{
                background: '#fff',
                borderRadius: '7px',
                boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
                cursor: 'pointer',
                transition: 'transform 0.2s'
              }}
              onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-4px)'}
              onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}>
                <div style={{
                  background: '#b4cbe0',
                  width: '100%',
                  height: '180px',
                  borderRadius: '7px 7px 0 0',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#fff',
                  fontSize: '40px'
                }}>
                  🎓
                </div>
                <div style={{ padding: '12px' }}>
                  <div style={{ fontWeight: 'bold', color: '#133a5c', marginBottom: '8px', fontSize: '14px' }}>
                    {doc.title}
                  </div>
                  <div style={{ fontSize: '12px', color: '#888', marginBottom: '4px' }}>
                    📄 {doc.pages} trang
                  </div>
                  <div style={{ fontSize: '11px', color: '#888', marginBottom: '6px' }}>
                    👨‍🎓 {doc.author}
                  </div>
                  <div style={{ fontSize: '12px', color: '#ff8c00', fontWeight: 'bold' }}>
                    ⭐ {doc.rating} ({doc.totalRatings})
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
