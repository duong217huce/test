import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import Header from './Header';
import FilterBar from './FilterBar';
import { filterConfigs } from '../data/filterConfigs';

const categoryTitles = {
  'education': 'Giáo dục phổ thông',
  'professional': 'Tài liệu chuyên môn',
  'literature': 'Văn học - Truyện chữ',
  'templates': 'Văn mẫu - Biểu mẫu',
  'thesis': 'Luận văn - Báo Cáo',
  'practice': 'Ôn tập trắc nghiệm'
};

const categoryConfigs = {
  education: {
    sidebar: [
      { title: 'Tài liệu mới', active: false },
      { title: 'SGK Tiểu học', active: false },
      { title: 'SGK THCS', active: false },
      { title: 'SGK THPT', active: true },
      { title: 'Giáo trình đại cương', active: false }
    ]
  },
  professional: {
    sidebar: [
      { title: 'Kinh tế', active: true },
      { title: 'Công nghệ', active: false },
      { title: 'Y học', active: false },
      { title: 'Luật', active: false },
      { title: 'Kiến trúc', active: false }
    ]
  },
  literature: {
    sidebar: [
      { title: 'Văn học Việt Nam', active: true },
      { title: 'Văn học nước ngoài', active: false },
      { title: 'Truyện', active: false },
      { title: 'Thơ', active: false },
      { title: 'Tiểu thuyết', active: false }
    ]
  },
  templates: {
    sidebar: [
      { title: 'Văn mẫu', active: true },
      { title: 'Biểu mẫu hành chính', active: false },
      { title: 'Biểu mẫu học tập', active: false },
      { title: 'Hợp đồng', active: false }
    ]
  },
  thesis: {
    sidebar: [
      { title: 'Luận văn cử nhân', active: true },
      { title: 'Luận văn thạc sĩ', active: false },
      { title: 'Luận văn tiến sĩ', active: false },
      { title: 'Báo cáo thực tập', active: false },
      { title: 'Đề tài nghiên cứu', active: false }
    ]
  },
  practice: {
    sidebar: [
      { title: 'THPT Quốc gia', active: true },
      { title: 'Đại học', active: false },
      { title: 'Chứng chỉ', active: false },
      { title: 'Thi công chức', active: false }
    ]
  }
};

// Mock data với đầy đủ thông tin
const mockDocuments = [
  { id: 1, title: 'Toán nâng cao lớp 10', pages: 245, author: 'Nguyễn Văn A', grade: 'Lớp 10', subject: 'Toán', image: 'Ảnh bìa' },
  { id: 2, title: 'Văn học lớp 11', pages: 180, author: 'Trần Thị B', grade: 'Lớp 11', subject: 'Văn', image: 'Ảnh bìa' },
  { id: 3, title: 'English Grammar 12', pages: 200, author: 'Lê Văn C', grade: 'Lớp 12', subject: 'Tiếng Anh', image: 'Ảnh bìa' },
  { id: 4, title: 'Vật lý đại cương', pages: 320, author: 'Phạm Thị D', grade: 'Lớp 10', subject: 'Vật lý', image: 'Ảnh bìa' },
  { id: 5, title: 'Hóa học hữu cơ', pages: 150, author: 'Hoàng Văn E', grade: 'Lớp 11', subject: 'Hóa học', image: 'Ảnh bìa' },
  { id: 6, title: 'Toán lớp 8', pages: 160, author: 'Võ Thị F', grade: 'Lớp 8', subject: 'Toán', image: 'Ảnh bìa' },
  { id: 7, title: 'Sinh học lớp 9', pages: 140, author: 'Đỗ Văn G', grade: 'Lớp 9', subject: 'Sinh học', image: 'Ảnh bìa' },
  { id: 8, title: 'Lịch sử Việt Nam', pages: 220, author: 'Bùi Thị H', grade: 'Lớp 9', subject: 'Lịch sử', image: 'Ảnh bìa' },
  { id: 9, title: 'Toán lớp 5', pages: 100, author: 'Ngô Văn I', grade: 'Lớp 5', subject: 'Toán', image: 'Ảnh bìa' },
  { id: 10, title: 'Tiếng Việt lớp 3', pages: 90, author: 'Phan Thị K', grade: 'Lớp 3', subject: 'Văn', image: 'Ảnh bìa' },
  { id: 11, title: 'Toán cao cấp A1', pages: 300, author: 'TS. Nguyễn L', grade: 'Đại học', subject: 'Toán', image: 'Ảnh bìa' },
  { id: 12, title: 'Lập trình C++', pages: 250, author: 'ThS. Trần M', grade: 'Đại học', subject: 'Lập trình', image: 'Ảnh bìa' },
  { id: 13, title: 'Kinh tế vi mô', pages: 280, author: 'PGS. Lê N', grade: 'Đại học', subject: 'Kinh tế', image: 'Ảnh bìa' },
  { id: 14, title: 'Vật lý đại cương 1', pages: 350, author: 'GS. Phạm O', grade: 'Đại học', subject: 'Vật lý', image: 'Ảnh bìa' },
  { id: 15, title: 'Cơ sở dữ liệu', pages: 200, author: 'TS. Hoàng P', grade: 'Đại học', subject: 'Tin học', image: 'Ảnh bìa' },
  { id: 16, title: 'Địa lý lớp 12', pages: 190, author: 'Võ Văn Q', grade: 'Lớp 12', subject: 'Địa lý', image: 'Ảnh bìa' },
  { id: 17, title: 'GDCD lớp 10', pages: 120, author: 'Đặng Thị R', grade: 'Lớp 10', subject: 'GDCD', image: 'Ảnh bìa' },
  { id: 18, title: 'Marketing căn bản', pages: 230, author: 'TS. Bùi S', grade: 'Đại học', subject: 'Marketing', image: 'Ảnh bìa' },
  { id: 19, title: 'Luật dân sự', pages: 400, author: 'ThS. Ngô T', grade: 'Đại học', subject: 'Luật', image: 'Ảnh bìa' },
  { id: 20, title: 'Toán lớp 7', pages: 170, author: 'Phan Văn U', grade: 'Lớp 7', subject: 'Toán', image: 'Ảnh bìa' }
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

export default function CategoryPage() {
  const { category } = useParams();
  const [selectedFilters, setSelectedFilters] = useState({});
  const [searchKeyword, setSearchKeyword] = useState('');
  const [filteredDocs, setFilteredDocs] = useState(mockDocuments);
  
  const defaultActive = categoryConfigs[category]?.sidebar.find(cat => cat.active)?.title || '';
  const [activeCategory, setActiveCategory] = useState(defaultActive);

  const handleFilterChange = (key, value) => {
    setSelectedFilters(prev => ({ ...prev, [key]: value }));
  };

  const handleApply = () => {
    let filtered = [...mockDocuments];
    
    if (selectedFilters.grade && selectedFilters.grade !== 'Tất cả') {
      filtered = filtered.filter(doc => doc.grade === selectedFilters.grade);
    }
    
    if (selectedFilters.subject && selectedFilters.subject !== 'Tất cả') {
      filtered = filtered.filter(doc => doc.subject === selectedFilters.subject);
    }
    
    if (selectedFilters.field && selectedFilters.field !== 'Tất cả') {
      filtered = filtered.filter(doc => doc.subject === selectedFilters.field);
    }
    
    if (searchKeyword.trim()) {
      const keyword = searchKeyword.toLowerCase();
      filtered = filtered.filter(doc => 
        doc.title.toLowerCase().includes(keyword) ||
        doc.author.toLowerCase().includes(keyword) ||
        doc.subject.toLowerCase().includes(keyword)
      );
    }
    
    setFilteredDocs(filtered);
    
    if (filtered.length === 0) {
      alert('Không tìm thấy tài liệu phù hợp!');
    }
  };

  const handleSidebarChange = (catTitle) => {
    setActiveCategory(catTitle);
    setSelectedFilters({});
    setSearchKeyword('');
    setFilteredDocs(mockDocuments);
  };

  const handleClearFilters = () => {
    setSelectedFilters({});
    setSearchKeyword('');
    setFilteredDocs(mockDocuments);
  };

  return (
    <div style={{ minHeight: '100vh', background: '#fffffe', fontFamily: 'Arial, sans-serif' }}>
      <Header />
      <div style={{ height: '130px' }}></div>
      
      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '20px' }}>
        <h1 style={{
          color: '#133a5c',
          fontSize: '28px',
          marginBottom: '20px',
          fontWeight: 'bold'
        }}>
          {categoryTitles[category] || 'Danh mục'}
        </h1>

        <FilterBar
          filterConfig={filterConfigs[category]}
          selectedFilters={selectedFilters}
          onFilterChange={handleFilterChange}
          searchKeyword={searchKeyword}
          onSearchChange={setSearchKeyword}
          onApply={handleApply}
        />
        
        {categoryConfigs[category]?.sidebar ? (
          <div style={{ display: 'flex', gap: '20px' }}>
            <aside style={{
              width: '220px',
              flexShrink: 0,
              background: '#fff',
              borderRadius: '8px',
              padding: '15px',
              boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
              height: 'fit-content',
              position: 'sticky',
              top: '150px'
            }}>
              {categoryConfigs[category].sidebar.map((cat, idx) => (
                <div
                  key={idx}
                  onClick={() => handleSidebarChange(cat.title)}
                  style={{
                    padding: '12px 15px',
                    marginBottom: '8px',
                    borderRadius: '6px',
                    cursor: 'pointer',
                    background: activeCategory === cat.title ? '#e8f4f8' : 'transparent',
                    color: activeCategory === cat.title ? '#133a5c' : '#2d4a67',
                    fontWeight: activeCategory === cat.title ? 'bold' : 'normal',
                    fontSize: '15px',
                    transition: 'all 0.2s'
                  }}
                  onMouseEnter={(e) => {
                    if (activeCategory !== cat.title) {
                      e.target.style.background = '#f5f5f5';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (activeCategory !== cat.title) {
                      e.target.style.background = 'transparent';
                    }
                  }}
                >
                  {cat.title}
                </div>
              ))}
            </aside>
            
            <div style={{ flex: 1 }}>
              {/* Filter results info */}
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '20px',
                padding: '15px',
                background: '#f5f9fc',
                borderRadius: '6px'
              }}>
                <div style={{ fontSize: '14px', color: '#2d4a67' }}>
                  Tìm thấy <strong style={{ color: '#133a5c' }}>{filteredDocs.length}</strong> tài liệu
                  {(Object.values(selectedFilters).some(v => v && v !== 'Tất cả') || searchKeyword) && (
                    <span style={{ color: '#888' }}> (đã lọc)</span>
                  )}
                </div>
                
                {(Object.values(selectedFilters).some(v => v && v !== 'Tất cả') || searchKeyword) && (
                  <button
                    onClick={handleClearFilters}
                    style={{
                      padding: '8px 16px',
                      background: '#fff',
                      border: '1px solid #ccc',
                      borderRadius: '6px',
                      fontSize: '13px',
                      cursor: 'pointer',
                      color: '#2d4a67'
                    }}
                  >
                    ✕ Xóa bộ lọc
                  </button>
                )}
              </div>

              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
                gap: '20px'
              }}>
                {filteredDocs.map((doc) => (
                  <Link
                    to={`/document/${doc.id}`}
                    key={doc.id}
                    style={{
                      textDecoration: 'none',
                      color: 'inherit'
                    }}
                  >
                    <div
                      style={{
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
                          marginBottom: '8px'
                        }}>
                          {doc.title}
                        </div>
                        <div style={{
                          fontSize: '12px',
                          color: '#2d4a67',
                          marginBottom: '4px'
                        }}>
                          Số trang: {doc.pages}
                        </div>
                        <div style={{
                          fontSize: '11px',
                          color: '#888'
                        }}>
                          Đăng tải bởi: {doc.author}
                        </div>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          </div>
        ) : (
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))',
            gap: '20px'
          }}>
            {filteredDocs.slice(0, 12).map((doc) => (
              <Link
                to={`/document/${doc.id}`}
                key={doc.id}
                style={{
                  textDecoration: 'none',
                  color: 'inherit'
                }}
              >
                <div
                  style={{
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
                      marginBottom: '8px'
                    }}>
                      {doc.title}
                    </div>
                    <div style={{
                      fontSize: '12px',
                      color: '#2d4a67',
                      marginBottom: '4px'
                    }}>
                      Số trang: {doc.pages}
                    </div>
                    <div style={{
                      fontSize: '11px',
                      color: '#888'
                    }}>
                      Đăng tải bởi: {doc.author}
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
