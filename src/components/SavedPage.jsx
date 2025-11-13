import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import Header from './Header';

// Mock data tài liệu đã lưu
const mockSavedDocuments = [
  {
    id: 1,
    title: 'Giáo trình Toán cao cấp A1',
    pages: 245,
    author: 'Nguyễn Văn A',
    grade: 'Đại học',
    subject: 'Toán',
    savedDate: '15/11/2024',
    image: 'Ảnh bìa tài liệu'
  },
  {
    id: 2,
    title: 'Vật lý đại cương',
    pages: 180,
    author: 'Trần Thị B',
    grade: 'Đại học',
    subject: 'Vật lý',
    savedDate: '12/11/2024',
    image: 'Ảnh bìa tài liệu'
  },
  {
    id: 3,
    title: 'Ngữ văn lớp 12',
    pages: 320,
    author: 'Lê Văn C',
    grade: 'Lớp 12',
    subject: 'Văn',
    savedDate: '10/11/2024',
    image: 'Ảnh bìa tài liệu'
  },
  {
    id: 4,
    title: 'Hóa học hữu cơ',
    pages: 200,
    author: 'Phạm Thị D',
    grade: 'Lớp 11',
    subject: 'Hóa học',
    savedDate: '08/11/2024',
    image: 'Ảnh bìa tài liệu'
  },
  {
    id: 5,
    title: 'Lập trình C++ cơ bản',
    pages: 150,
    author: 'Hoàng Văn E',
    grade: 'Đại học',
    subject: 'Lập trình',
    savedDate: '05/11/2024',
    image: 'Ảnh bìa tài liệu'
  }
];

const cardStyle = {
  background: '#b4cbe0',
  width: '100%',
  height: '180px',
  borderRadius: '7px 7px 0 0',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  color: '#fff',
  fontSize: '14px'
};

export default function SavedPage() {
  const [savedDocs, setSavedDocs] = useState(mockSavedDocuments);
  const [filter, setFilter] = useState('all'); // all, recent, oldest

  const handleRemove = (docId) => {
    if (window.confirm('Bạn có chắc muốn xóa tài liệu này khỏi danh sách đã lưu?')) {
      setSavedDocs(savedDocs.filter(doc => doc.id !== docId));
      alert('Đã xóa tài liệu khỏi danh sách');
    }
  };

  const handleSort = (sortType) => {
    setFilter(sortType);
    let sorted = [...savedDocs];
    
    if (sortType === 'recent') {
      // Sort by date (newest first) - mock sorting
      sorted.reverse();
    } else if (sortType === 'oldest') {
      // Sort by date (oldest first)
      sorted.sort((a, b) => a.id - b.id);
    }
    
    setSavedDocs(sorted);
  };

  return (
    <div style={{ minHeight: '100vh', background: '#fffffe', fontFamily: 'Arial, sans-serif' }}>
      <Header />
      <div style={{ height: '130px' }}></div>
      
      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '20px' }}>
        {/* Page Header */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '30px'
        }}>
          <div>
            <h1 style={{
              color: '#133a5c',
              fontSize: '28px',
              marginBottom: '8px',
              fontWeight: 'bold'
            }}>
              Tài liệu đã lưu
            </h1>
            <p style={{
              color: '#888',
              fontSize: '14px'
            }}>
              {savedDocs.length} tài liệu
            </p>
          </div>

          {/* Sort options */}
          <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
            <span style={{ fontSize: '14px', color: '#888' }}>Sắp xếp:</span>
            <select
              value={filter}
              onChange={(e) => handleSort(e.target.value)}
              style={{
                padding: '8px 12px',
                fontSize: '14px',
                border: '1px solid #ccc',
                borderRadius: '6px',
                outline: 'none',
                cursor: 'pointer',
                background: '#fff'
              }}
            >
              <option value="all">Tất cả</option>
              <option value="recent">Mới nhất</option>
              <option value="oldest">Cũ nhất</option>
            </select>
          </div>
        </div>

        {/* Documents Grid */}
        {savedDocs.length > 0 ? (
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))',
            gap: '20px'
          }}>
            {savedDocs.map((doc) => (
              <div
                key={doc.id}
                style={{
                  position: 'relative',
                  background: '#fff',
                  borderRadius: '7px',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
                  transition: 'transform 0.2s, box-shadow 0.2s'
                }}
              >
                {/* Remove button */}
                <button
                  onClick={(e) => {
                    e.preventDefault();
                    handleRemove(doc.id);
                  }}
                  style={{
                    position: 'absolute',
                    top: '10px',
                    right: '10px',
                    background: 'rgba(255, 255, 255, 0.9)',
                    border: 'none',
                    borderRadius: '50%',
                    width: '30px',
                    height: '30px',
                    cursor: 'pointer',
                    fontSize: '18px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    zIndex: 10,
                    color: '#e84c61',
                    boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                  }}
                  title="Xóa khỏi danh sách"
                >
                  ×
                </button>

                <Link
                  to={`/document/${doc.id}`}
                  style={{
                    textDecoration: 'none',
                    color: 'inherit',
                    display: 'block'
                  }}
                >
                  <div style={cardStyle}>
                    {doc.image}
                  </div>
                  <div style={{ padding: '12px' }}>
                    <div style={{
                      fontWeight: 'bold',
                      color: '#133a5c',
                      fontSize: '14px',
                      marginBottom: '8px',
                      lineHeight: '1.3'
                    }}>
                      {doc.title}
                    </div>
                    <div style={{
                      fontSize: '12px',
                      color: '#2d4a67',
                      marginBottom: '4px'
                    }}>
                      <span style={{ color: '#888' }}>Số trang:</span> {doc.pages}
                    </div>
                    <div style={{
                      fontSize: '12px',
                      color: '#2d4a67',
                      marginBottom: '4px'
                    }}>
                      <span style={{ color: '#888' }}>Cấp học:</span> {doc.grade}
                    </div>
                    <div style={{
                      fontSize: '11px',
                      color: '#888',
                      marginTop: '8px',
                      paddingTop: '8px',
                      borderTop: '1px solid #eee'
                    }}>
                      Lưu ngày: {doc.savedDate}
                    </div>
                  </div>
                </Link>
              </div>
            ))}
          </div>
        ) : (
          // Empty state
          <div style={{
            textAlign: 'center',
            padding: '80px 20px',
            background: '#fff',
            borderRadius: '8px',
            boxShadow: '0 2px 8px rgba(0,0,0,0.06)'
          }}>
            <div style={{ fontSize: '60px', marginBottom: '20px' }}>📚</div>
            <h3 style={{ color: '#133a5c', marginBottom: '10px' }}>
              Chưa có tài liệu nào được lưu
            </h3>
            <p style={{ color: '#888', marginBottom: '20px' }}>
              Bắt đầu lưu các tài liệu yêu thích để xem sau
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
        )}
      </div>
    </div>
  );
}
