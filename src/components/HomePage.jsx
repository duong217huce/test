import React, { useEffect, useState } from 'react';
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
        setDocuments([]);
      } finally {
        setLoading(false);
      }
    };
    fetchDocs();
  }, []);

  // Sắp xếp tài liệu theo điểm rating hoặc lượt tải (giả sử có trường này)
  const getSorted = (category) =>
    [...documents]
      .filter(doc => doc.category === category)
      .sort((a, b) => (b.averageRating || 0) - (a.averageRating || 0))
      .slice(0, 6);

  return (
    <div style={{ minHeight: '100vh', background: '#fffffe', fontFamily: 'Arial, sans-serif' }}>
      <Header />
      <div style={{ height: '130px' }}></div>
      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '20px' }}>
        <h2 style={{ color: '#133a5c', marginBottom: '20px', fontSize: '20px' }}>
          Tài liệu nổi bật (Mới nhất)
        </h2>
        {loading ? (
          <div style={{ textAlign: 'center', color: '#888' }}>Đang tải...</div>
        ) : (
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))',
            gap: '20px',
            marginBottom: '50px'
          }}>
            {documents.slice(0, 12).map((doc) => (
              <Link key={doc._id} to={`/document/${doc._id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
                <div style={{
                  background: '#fff',
                  borderRadius: '7px',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
                  cursor: 'pointer'
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
                  }}>📚</div>
                  <div style={{ padding: '12px' }}>
                    <div style={{ fontWeight: 'bold', color: '#133a5c', marginBottom: '8px', fontSize: '14px' }}>
                      {doc.title}
                    </div>
                    <div style={{ fontSize: '12px', color: '#888', marginBottom: '4px' }}>
                      📄 {doc.fileSize ? (doc.fileSize / 1024).toFixed(1) + " KB" : ""}
                    </div>
                    <div style={{ fontSize: '11px', color: '#888', marginBottom: '6px' }}>
                      👤 {(doc.uploadedBy && doc.uploadedBy.username) || 'Ẩn danh'}
                    </div>
                    <div style={{ fontSize: '12px', color: '#ff8c00', fontWeight: 'bold' }}>
                      ⭐ {doc.averageRating || "0"}
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
