import React from 'react';
import Header from './Header';

const sections = [
  { title: 'Tài liệu nổi bật' },
  { title: 'Văn học nổi bật' },
  { title: 'Luận văn nổi bật' }
];

const docCards = Array(4).fill({
  img: '',
  title: 'Tên tài liệu',
  pages: 'Số trang',
  desc: 'Dòng mô tả'
});

const cardStyle = {
  background: '#b4cbe0',
  width: '220px',
  height: '150px',
  borderRadius: '7px 7px 0 0',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  color: '#fff',
  fontSize: '16px'
};

export default function HomePage() {
  return (
    <div style={{ background: '#fffffe', minHeight: '100vh', fontFamily: 'Arial, sans-serif' }}>
      <Header />

      {/* Spacer để content không bị che bởi fixed header */}
      <div style={{ height: '130px' }}></div>

      {/* Main Content */}
      <div style={{
        maxWidth: '1200px',
        margin: '0 auto',
        padding: '0 16px'
      }}>
        <main>
          {sections.map(section => (
            <div key={section.title} style={{ marginBottom: '40px' }}>
              <div style={{ fontWeight: 'bold', fontSize: '18px', margin: '30px 0 18px', color: '#133a5c' }}>
                {section.title}
              </div>
              <div style={{ display: 'flex', gap: '30px', flexWrap: 'wrap', justifyContent: 'center' }}>
                {docCards.map((card, idx) => (
                  <div key={idx} style={{
                    background: '#fff',
                    borderRadius: '7px',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
                    width: '220px',
                    marginBottom: '24px',
                    cursor: 'pointer'
                  }}>
                    <div style={cardStyle}>
                      Ảnh bìa tài liệu
                    </div>
                    <div style={{ padding: '12px 14px' }}>
                      <div style={{ fontWeight: 'bold', color: '#133a5c' }}>{card.title}</div>
                      <div style={{ fontSize: '13px', color: '#2d4a67', marginTop: '7px' }}>
                        {card.pages} <br />
                        {card.desc}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </main>
      </div>
    </div>
  );
}
