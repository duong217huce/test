import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import Header from './Header';
import Footer from './Footer';
import FilterBar from './FilterBar';
import { filterConfigs } from '../data/filterConfigs';
import { colors } from '../theme/colors';

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

// ✅ Component hiển thị ảnh bìa tài liệu
function DocumentCover({ coverImage, title }) {
  const [imageError, setImageError] = React.useState(false);
  
  const containerStyle = {
    background: '#b4cbe0',
    width: '100%',
    height: '180px',
    borderRadius: '7px 7px 0 0',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: '#fff',
    fontSize: '48px',
    overflow: 'hidden'
  };

  if (coverImage && !imageError) {
    return (
      <div style={containerStyle}>
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
  
  return <div style={containerStyle}>📄</div>;
}

export default function CategoryPage() {
  const { category } = useParams();
  const [selectedFilters, setSelectedFilters] = useState({});
  const [searchKeyword, setSearchKeyword] = useState('');
  const [filteredDocs, setFilteredDocs] = useState([]);
  const [allDocs, setAllDocs] = useState([]);
  const [loading, setLoading] = useState(true);

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
      } catch (error) {
        console.error('❌ Lỗi khi tải tài liệu:', error);
        setAllDocs([]);
        setFilteredDocs([]);
      } finally {
        setLoading(false);
      }
    };

    fetchDocuments();
    // Reset filters khi category thay đổi
    setSelectedFilters({});
    setSearchKeyword('');
  }, [category]);

  // Function để lọc tài liệu
  const applyFilters = React.useCallback(() => {
    if (allDocs.length === 0) {
      setFilteredDocs([]);
      return;
    }

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
  }, [allDocs, selectedFilters, searchKeyword]);

  // Tự động lọc khi allDocs thay đổi (sau khi fetch)
  useEffect(() => {
    applyFilters();
  }, [allDocs, applyFilters]);

  // Tự động lọc khi selectedFilters thay đổi
  useEffect(() => {
    applyFilters();
  }, [selectedFilters, applyFilters]);

  // Tự động lọc khi searchKeyword thay đổi (với debounce)
  useEffect(() => {
    if (searchKeyword.trim() === '') {
      // Nếu search rỗng, chỉ áp dụng filters khác
      applyFilters();
      return;
    }

    // Debounce cho tìm kiếm (300ms giống Header)
    const timer = setTimeout(() => {
      applyFilters();
    }, 300);

    return () => clearTimeout(timer);
  }, [searchKeyword, applyFilters]);

  const handleFilterChange = (key, value) => {
    setSelectedFilters(prev => ({ ...prev, [key]: value }));
  };

  const handleApply = () => {
    // Không cần làm gì vì đã tự động lọc
    applyFilters();
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
      
      <div style={{ maxWidth: '1400px', margin: '0 auto', padding: '40px 80px' }}>
        <h1 style={{
          color: colors.headline,
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
          showApplyButton={false}
        />
        
        {loading ? (
          <div style={{ textAlign: 'center', padding: '60px', color: colors.text2 }}>
            Đang tải tài liệu...
          </div>
        ) : (
          <div>
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
                    color: colors.paragraph
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
                      <DocumentCover coverImage={doc.coverImage} title={doc.title} />
                      <div style={{ padding: '12px' }}>
                        <div style={{
                          fontWeight: 'bold',
                          color: colors.headline,
                          fontSize: '14px',
                          marginBottom: '8px'
                        }}>
                          {doc.title}
                        </div>
                        <div style={{
                          fontSize: '12px',
                          color: colors.paragraph,
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
        )}
      </div>
      <Footer />
    </div>
  );
}