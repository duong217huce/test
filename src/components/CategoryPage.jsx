import React, { useState, useEffect } from 'react';
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

// Định nghĩa các tag con thuộc về từng menu item cha
const categoryHierarchy = {
  'education': ['Lớp 1', 'Lớp 2', 'Lớp 3', 'Lớp 4', 'Lớp 5', 
                'Lớp 6', 'Lớp 7', 'Lớp 8', 'Lớp 9',
                'Lớp 10', 'Lớp 11', 'Lớp 12', 'Đại học'],
  'professional': ['Tài chính', 'Kế toán', 'Marketing', 'Quản trị',
                   'Lập trình', 'Mạng máy tính', 'An ninh mạng', 'AI/ML',
                   'Nội khoa', 'Ngoại khoa', 'Dược học',
                   'Luật', 'Kiến trúc', 'Nông nghiệp', 'Kinh tế', 'Công nghệ', 'Y học'],
  'literature': ['Thơ', 'Truyện ngắn', 'Tiểu thuyết', 'Văn xuôi',
                 'Châu Âu', 'Châu Á', 'Châu Mỹ',
                 'Truyện tranh', 'Light novel', 'Truyện teen',
                 'Trinh thám', 'Kinh dị', 'Lãng mạn'],
  'templates': ['Tả người', 'Tả cảnh', 'Nghị luận', 'Thuyết minh',
                'Đơn xin việc', 'Sơ yếu lý lịch', 'Giấy ủy quyền',
                'Đơn xin nghỉ học', 'Đơn xin chuyển trường',
                'Hợp đồng', 'Giấy tờ pháp lý'],
  'thesis': ['Cử nhân', 'Thạc sĩ', 'Tiến sĩ',
             'Thực tập', 'Nghiên cứu', 'Tiểu luận',
             'Khoa học tự nhiên', 'Khoa học xã hội',
             'Cách viết', 'Format', 'Trích dẫn'],
  'practice': ['Toán', 'Văn', 'Anh', 'Lý', 'Hóa', 'Sinh',
               'Đề thi thử', 'Luyện thi',
               'TOEIC', 'IELTS', 'HSK', 'JLPT',
               'Luật', 'Hành chính', 'Kinh tế']
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
  const [filteredDocs, setFilteredDocs] = useState([]);
  const [allDocs, setAllDocs] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const defaultActive = categoryConfigs[category]?.sidebar.find(cat => cat.active)?.title || '';
  const [activeCategory, setActiveCategory] = useState(defaultActive);

  // Fetch documents from backend
  useEffect(() => {
    const fetchDocuments = async () => {
      setLoading(true);
      try {
        // Mapping từ URL sang tên category/tag thật
        const categoryMap = {
          'lop-1': 'Lớp 1', 'lop-2': 'Lớp 2', 'lop-3': 'Lớp 3',
          'lop-4': 'Lớp 4', 'lop-5': 'Lớp 5', 'lop-6': 'Lớp 6',
          'lop-7': 'Lớp 7', 'lop-8': 'Lớp 8', 'lop-9': 'Lớp 9',
          'lop-10': 'Lớp 10', 'lop-11': 'Lớp 11', 'lop-12': 'Lớp 12',
          'dai-hoc': 'Đại học', 'toan': 'Toán', 'van': 'Văn',
          'tieng-anh': 'Tiếng Anh', 'vat-ly': 'Vật lý', 'hoa-hoc': 'Hóa học',
          'sinh-hoc': 'Sinh học', 'lich-su': 'Lịch sử', 'dia-ly': 'Địa lý',
          'tin-hoc': 'Tin học', 'gdcd': 'GDCD', 'lap-trinh': 'Lập trình',
          'kinh-te': 'Kinh tế', 'luat': 'Luật', 'y-hoc': 'Y học',
          'kien-truc': 'Kiến trúc', 'marketing': 'Marketing',
          'tai-chinh': 'Tài chính', 'ke-toan': 'Kế toán'
        };

        const categoryName = categoryMap[category] || category;
        
        console.log('🔍 Đang tìm category:', categoryName);
        
        // Lấy TẤT CẢ tài liệu từ backend
        const response = await fetch('http://localhost:5000/api/documents');
        const allData = await response.json();
        
        console.log('📚 Tổng số tài liệu từ API:', allData.length);
        
        // Logic phân cấp: nếu là category cha (education, professional, etc.)
        // thì hiển thị tất cả tài liệu có tags thuộc các category con
        let filtered;
        
        if (categoryHierarchy[category]) {
          // Đây là category cha (VD: education)
          console.log('📂 Category cha, lấy tất cả tags con:', categoryHierarchy[category]);
          
          filtered = allData.filter(doc => {
            // Kiểm tra category trùng với tên cha
            const matchCategory = doc.category === categoryTitles[category];
            
            // Hoặc kiểm tra tags có chứa bất kỳ tag con nào
            const matchTags = doc.tags && doc.tags.some(tag => 
              categoryHierarchy[category].includes(tag)
            );
            
            return matchCategory || matchTags;
          });
        } else {
          // Đây là category con cụ thể (VD: Lớp 1)
          console.log('📄 Category con chi tiết');
          
          filtered = allData.filter(doc => {
            const matchCategory = doc.category === categoryName;
            const matchTags = doc.tags && doc.tags.some(tag => tag === categoryName);
            return matchCategory || matchTags;
          });
        }
        
        console.log('✅ Số tài liệu khớp:', filtered.length);
        console.log('📄 Danh sách:', filtered.map(d => ({ 
          title: d.title, 
          category: d.category, 
          tags: d.tags 
        })));
        
        setAllDocs(filtered);
        setFilteredDocs(filtered);
      } catch (error) {
        console.error('❌ Lỗi khi tải tài liệu:', error);
        setAllDocs([]);
        setFilteredDocs([]);
      } finally {
        setLoading(false);
      }
    };

    fetchDocuments();
  }, [category]);

  const handleFilterChange = (key, value) => {
    setSelectedFilters(prev => ({ ...prev, [key]: value }));
  };

  const handleApply = () => {
    let filtered = [...allDocs];
    
    // Filter theo tags
    if (selectedFilters.grade && selectedFilters.grade !== 'Tất cả') {
      filtered = filtered.filter(doc => 
        doc.tags && doc.tags.includes(selectedFilters.grade)
      );
    }
    
    if (selectedFilters.subject && selectedFilters.subject !== 'Tất cả') {
      filtered = filtered.filter(doc => 
        doc.tags && doc.tags.includes(selectedFilters.subject)
      );
    }
    
    if (selectedFilters.field && selectedFilters.field !== 'Tất cả') {
      filtered = filtered.filter(doc => 
        doc.tags && doc.tags.includes(selectedFilters.field)
      );
    }
    
    // Filter theo keyword
    if (searchKeyword.trim()) {
      const keyword = searchKeyword.toLowerCase();
      filtered = filtered.filter(doc => 
        doc.title.toLowerCase().includes(keyword) ||
        doc.description.toLowerCase().includes(keyword) ||
        (doc.uploadedBy?.username && doc.uploadedBy.username.toLowerCase().includes(keyword))
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
    setFilteredDocs(allDocs);
  };

  const handleClearFilters = () => {
    setSelectedFilters({});
    setSearchKeyword('');
    setFilteredDocs(allDocs);
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
        
        {loading ? (
          <div style={{ textAlign: 'center', padding: '60px', color: '#888' }}>
            Đang tải tài liệu...
          </div>
        ) : (
          categoryConfigs[category]?.sidebar ? (
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

                {filteredDocs.length === 0 ? (
                  <div style={{
                    textAlign: 'center',
                    padding: '60px 20px',
                    background: '#fff',
                    borderRadius: '8px',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.06)'
                  }}>
                    <div style={{ fontSize: '50px', marginBottom: '15px' }}>📭</div>
                    <h3 style={{ color: '#133a5c', marginBottom: '10px' }}>
                      Chưa có tài liệu nào
                    </h3>
                    <p style={{ color: '#888' }}>
                      Hãy là người đầu tiên chia sẻ tài liệu cho danh mục này!
                    </p>
                  </div>
                ) : (
                  <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
                    gap: '20px'
                  }}>
                    {filteredDocs.map((doc) => (
                      <Link
                        to={`/document/${doc._id}`}
                        key={doc._id}
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
                            📄
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
                              {doc.category}
                            </div>
                            <div style={{
                              fontSize: '11px',
                              color: '#888'
                            }}>
                              Đăng tải bởi: {doc.uploadedBy?.username || 'Unknown'}
                            </div>
                          </div>
                        </div>
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div>
              {filteredDocs.length === 0 ? (
                <div style={{
                  textAlign: 'center',
                  padding: '60px 20px',
                  background: '#fff',
                  borderRadius: '8px',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.06)'
                }}>
                  <div style={{ fontSize: '50px', marginBottom: '15px' }}>📭</div>
                  <h3 style={{ color: '#133a5c', marginBottom: '10px' }}>
                    Chưa có tài liệu nào
                  </h3>
                  <p style={{ color: '#888' }}>
                    Hãy là người đầu tiên chia sẻ tài liệu cho danh mục này!
                  </p>
                </div>
              ) : (
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))',
                  gap: '20px'
                }}>
                  {filteredDocs.map((doc) => (
                    <Link
                      to={`/document/${doc._id}`}
                      key={doc._id}
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
                          📄
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
                            {doc.category}
                          </div>
                          <div style={{
                            fontSize: '11px',
                            color: '#888'
                          }}>
                            Đăng tải bởi: {doc.uploadedBy?.username || 'Unknown'}
                          </div>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </div>
          )
        )}
      </div>
    </div>
  );
}
