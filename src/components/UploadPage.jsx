import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from './Header';
import { refreshUserData } from '../utils/userUtils';

const gradeOptions = [
  'Lớp 1', 'Lớp 2', 'Lớp 3', 'Lớp 4', 'Lớp 5',
  'Lớp 6', 'Lớp 7', 'Lớp 8', 'Lớp 9',
  'Lớp 10', 'Lớp 11', 'Lớp 12',
  'Đại học'
];

// Môn học cơ bản (Lớp 1-5)
const basicSubjects = ['Toán', 'Văn', 'Tiếng Anh', 'Lịch sử', 'Địa lý'];

// Môn học THCS/THPT (Lớp 6-12)
const advancedSubjects = [
  'Toán', 'Văn', 'Tiếng Anh', 'Vật lý', 'Hóa học', 'Sinh học',
  'Lịch sử', 'Địa lý', 'Tin học', 'GDCD'
];

// Lĩnh vực chuyên môn (Chỉ Đại học)
const professionalSubjects = [
  'Lập trình', 'Kinh tế', 'Luật', 'Y học', 
  'Kiến trúc', 'Marketing', 'Tài chính', 'Kế toán'
];

export default function UploadPage() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    file: null,
    coverImage: null, // ✅ THÊM
    grade: '',
    subject: ''
  });
  const [uploading, setUploading] = useState(false);
  const [availableSubjects, setAvailableSubjects] = useState([]);
  const [coverPreview, setCoverPreview] = useState(null); // ✅ THÊM

  // ✅ Cập nhật danh sách môn học khi thay đổi cấp học
  useEffect(() => {
    if (!formData.grade) {
      setAvailableSubjects([]);
      return;
    }

    const gradeNumber = parseInt(formData.grade.replace('Lớp ', ''));

    if (formData.grade === 'Đại học') {
      // Đại học: hiển thị tất cả
      setAvailableSubjects([...advancedSubjects, ...professionalSubjects]);
    } else if (gradeNumber >= 1 && gradeNumber <= 5) {
      // Lớp 1-5: chỉ môn cơ bản
      setAvailableSubjects(basicSubjects);
      // Nếu đã chọn môn không hợp lệ, reset
      if (formData.subject && !basicSubjects.includes(formData.subject)) {
        setFormData(prev => ({ ...prev, subject: '' }));
      }
    } else if (gradeNumber >= 6 && gradeNumber <= 12) {
      // Lớp 6-12: môn nâng cao
      setAvailableSubjects(advancedSubjects);
      // Nếu đã chọn môn chuyên môn, reset
      if (formData.subject && professionalSubjects.includes(formData.subject)) {
        setFormData(prev => ({ ...prev, subject: '' }));
      }
    }
  }, [formData.grade]);

  // ✅ Kiểm tra khi chọn môn học chuyên môn → tự động set Đại học
  const handleSubjectChange = (e) => {
    const selectedSubject = e.target.value;
    
    if (professionalSubjects.includes(selectedSubject)) {
      // Nếu chọn môn chuyên môn → tự động chọn Đại học
      setFormData(prev => ({
        ...prev,
        subject: selectedSubject,
        grade: 'Đại học'
      }));
    } else {
      setFormData(prev => ({ ...prev, subject: selectedSubject }));
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFormData(prev => ({ ...prev, file }));
    }
  };

  // ✅ THÊM: Xử lý upload ảnh bìa
  const handleCoverImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Kiểm tra file có phải ảnh không
      if (!file.type.startsWith('image/')) {
        alert('Vui lòng chọn file ảnh!');
        return;
      }
      
      // Kiểm tra kích thước (tối đa 5MB)
      if (file.size > 5 * 1024 * 1024) {
        alert('Kích thước ảnh không được vượt quá 5MB!');
        return;
      }

      setFormData(prev => ({ ...prev, coverImage: file }));

      // Preview ảnh
      const reader = new FileReader();
      reader.onload = (evt) => {
        setCoverPreview(evt.target.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const handleDrop = (e) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file) {
      setFormData(prev => ({ ...prev, file }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validation
    if (!formData.grade && !formData.subject) {
      alert('Vui lòng chọn ít nhất Cấp học hoặc Môn học/Lĩnh vực!');
      return;
    }
    if (!formData.file) {
      alert('Vui lòng chọn file để upload!');
      return;
    }
    if (!formData.title || !formData.description) {
      alert('Vui lòng nhập đầy đủ tiêu đề và nội dung tóm tắt!');
      return;
    }

    const selectedInfo = [
      formData.grade,
      formData.subject
    ].filter(Boolean).join(' - ');

    // Tạo form data
    const apiData = new FormData();
    apiData.append('title', formData.title);
    apiData.append('description', formData.description);
    apiData.append('category', formData.grade || formData.subject);
    apiData.append('tags', [formData.grade, formData.subject].filter(Boolean).join(','));
    apiData.append('fileType', formData.file.type);
    apiData.append('fileSize', formData.file.size);
    apiData.append('isPaid', false);
    apiData.append('price', 0);
    apiData.append('file', formData.file);
    
    // ✅ THÊM: Upload ảnh bìa
    if (formData.coverImage) {
      apiData.append('coverImage', formData.coverImage);
    }

    const token = localStorage.getItem('token');

    if (!token) {
      alert('Bạn cần đăng nhập để upload tài liệu!');
      navigate('/login');
      return;
    }

    setUploading(true);

    try {
      const response = await fetch('http://localhost:5000/api/documents', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: apiData
      });

      const data = await response.json();

      if (response.ok) {
        // ✅ SỬ DỤNG HELPER ĐỂ CẬP NHẬT DP
        await refreshUserData();
        
        const newCoins = parseInt(localStorage.getItem('userCoins') || '0');
        
        alert(`Tài liệu đã được upload thành công!\nDanh mục: ${selectedInfo}\n\n✅ Bạn nhận được 10 DP!\nSố dư hiện tại: ${newCoins} DP`);
        
        navigate('/');
        window.location.reload(); // Reload để cập nhật Header
      } else {
        alert(data.message || 'Upload thất bại!');
      }
    } catch (error) {
      console.error('Lỗi:', error);
      alert('Không thể upload tài liệu! Vui lòng kiểm tra kết nối server.');
    } finally {
      setUploading(false);
    }
  };

  const handleCancel = () => {
    navigate(-1);
  };

  return (
    <div style={{ minHeight: '100vh', background: '#fffffe', fontFamily: 'Arial, sans-serif' }}>
      <Header />
      <div style={{ height: '130px' }}></div>
      
      <div style={{ maxWidth: '900px', margin: '0 auto', padding: '20px' }}>
        <h1 style={{
          color: '#133a5c',
          fontSize: '28px',
          marginBottom: '30px',
          fontWeight: 'bold'
        }}>
          Upload tài liệu
        </h1>

        <form onSubmit={handleSubmit} style={{
          background: '#fff',
          borderRadius: '8px',
          padding: '30px',
          boxShadow: '0 2px 8px rgba(0,0,0,0.06)'
        }}>
          {/* Tiêu đề tài liệu */}
          <div style={{ marginBottom: '25px' }}>
            <label style={{
              display: 'block',
              marginBottom: '8px',
              color: '#133a5c',
              fontSize: '15px',
              fontWeight: 'normal'
            }}>
              Tiêu đề tài liệu <span style={{ color: '#e84c61' }}>(*)</span>
            </label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleInputChange}
              placeholder="VD: Giáo trình Toán lớp 12 - Chương 1"
              required
              style={{
                width: '100%',
                padding: '12px',
                fontSize: '14px',
                border: '1px solid #ccc',
                borderRadius: '6px',
                outline: 'none',
                boxSizing: 'border-box'
              }}
            />
          </div>

          {/* Nội dung tóm tắt */}
          <div style={{ marginBottom: '25px' }}>
            <label style={{
              display: 'block',
              marginBottom: '8px',
              color: '#133a5c',
              fontSize: '15px',
              fontWeight: 'normal'
            }}>
              Nội dung tóm tắt tài liệu <span style={{ color: '#e84c61' }}>(*)</span>
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              required
              rows="6"
              placeholder="Mô tả ngắn gọn về nội dung tài liệu..."
              style={{
                width: '100%',
                padding: '12px',
                fontSize: '14px',
                border: '1px solid #ccc',
                borderRadius: '6px',
                outline: 'none',
                resize: 'vertical',
                fontFamily: 'Arial, sans-serif',
                boxSizing: 'border-box'
              }}
            />
          </div>

          {/* ✅ THÊM: Upload ảnh bìa */}
          <div style={{ marginBottom: '25px' }}>
            <label style={{
              display: 'block',
              marginBottom: '8px',
              color: '#133a5c',
              fontSize: '15px',
              fontWeight: 'normal'
            }}>
              Ảnh bìa tài liệu <span style={{ color: '#888', fontSize: '13px' }}>(Không bắt buộc)</span>
            </label>
            
            <div style={{ display: 'flex', gap: '20px', alignItems: 'flex-start' }}>
              {/* Preview ảnh */}
              {coverPreview && (
                <div style={{
                  width: '200px',
                  height: '280px',
                  border: '2px solid #4ba3d6',
                  borderRadius: '8px',
                  overflow: 'hidden',
                  flexShrink: 0
                }}>
                  <img 
                    src={coverPreview} 
                    alt="Preview" 
                    style={{
                      width: '100%',
                      height: '100%',
                      objectFit: 'cover'
                    }}
                  />
                </div>
              )}

              {/* Upload button */}
              <div style={{ flex: 1 }}>
                <input
                  id="coverImageInput"
                  type="file"
                  onChange={handleCoverImageChange}
                  accept="image/*"
                  style={{ display: 'none' }}
                />
                <button
                  type="button"
                  onClick={() => document.getElementById('coverImageInput').click()}
                  style={{
                    padding: '12px 24px',
                    background: '#4ba3d6',
                    color: '#fff',
                    border: 'none',
                    borderRadius: '6px',
                    fontSize: '14px',
                    fontWeight: 'bold',
                    cursor: 'pointer',
                    marginBottom: '10px'
                  }}
                >
                  {coverPreview ? '📷 Thay đổi ảnh bìa' : '📷 Chọn ảnh bìa'}
                </button>
                <div style={{ fontSize: '12px', color: '#888', marginTop: '8px' }}>
                  • Định dạng: JPG, PNG, GIF<br/>
                  • Kích thước tối đa: 5MB<br/>
                  • Tỷ lệ đề xuất: 2:3 (VD: 400x600px)
                </div>
              </div>
            </div>
          </div>

          {/* Cấp học và Môn học */}
          <div style={{ marginBottom: '25px' }}>
            <div style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: '20px'
            }}>
              {/* Cấp học */}
              <div>
                <label style={{
                  display: 'block',
                  marginBottom: '8px',
                  color: '#133a5c',
                  fontSize: '15px',
                  fontWeight: 'normal'
                }}>
                  Cấp học <span style={{ color: '#e84c61' }}>(*)</span>
                </label>
                <select
                  name="grade"
                  value={formData.grade}
                  onChange={handleSelectChange}
                  style={{
                    width: '100%',
                    padding: '12px',
                    fontSize: '14px',
                    border: '1px solid #ccc',
                    borderRadius: '6px',
                    outline: 'none',
                    background: '#fff',
                    cursor: 'pointer',
                    color: formData.grade ? '#133a5c' : '#999',
                    boxSizing: 'border-box'
                  }}
                >
                  <option value="" disabled>Chọn cấp học</option>
                  {gradeOptions.map(grade => (
                    <option key={grade} value={grade}>{grade}</option>
                  ))}
                </select>
              </div>

              {/* Môn học */}
              <div>
                <label style={{
                  display: 'block',
                  marginBottom: '8px',
                  color: '#133a5c',
                  fontSize: '15px',
                  fontWeight: 'normal'
                }}>
                  Môn học/Lĩnh vực <span style={{ color: '#e84c61' }}>(*)</span>
                </label>
                <select
                  name="subject"
                  value={formData.subject}
                  onChange={handleSubjectChange}
                  disabled={!formData.grade}
                  style={{
                    width: '100%',
                    padding: '12px',
                    fontSize: '14px',
                    border: '1px solid #ccc',
                    borderRadius: '6px',
                    outline: 'none',
                    background: formData.grade ? '#fff' : '#f5f5f5',
                    cursor: formData.grade ? 'pointer' : 'not-allowed',
                    color: formData.subject ? '#133a5c' : '#999',
                    boxSizing: 'border-box'
                  }}
                >
                  <option value="" disabled>
                    {formData.grade ? 'Chọn môn học/lĩnh vực' : 'Vui lòng chọn cấp học trước'}
                  </option>
                  {availableSubjects.map(subject => (
                    <option key={subject} value={subject}>{subject}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Hiển thị đã chọn */}
            {(formData.grade || formData.subject) && (
              <div style={{
                marginTop: '12px',
                padding: '10px',
                background: '#f5f9fc',
                borderRadius: '6px',
                fontSize: '13px',
                color: '#2d4a67'
              }}>
                <strong>Đã chọn:</strong>{' '}
                {formData.grade && <span style={{ color: '#4ba3d6', fontWeight: 'bold' }}>{formData.grade}</span>}
                {formData.grade && formData.subject && ' • '}
                {formData.subject && <span style={{ color: '#4ba3d6', fontWeight: 'bold' }}>{formData.subject}</span>}
              </div>
            )}
            
            <div style={{
              fontSize: '12px',
              color: '#888',
              marginTop: '8px'
            }}>
              💡 Lưu ý: Lớp 1-5 chỉ hiển thị môn cơ bản. Môn chuyên môn chỉ dành cho Đại học.
            </div>
          </div>

          {/* Upload file area */}
          <div style={{ marginBottom: '30px' }}>
            <div
              onDragOver={handleDragOver}
              onDrop={handleDrop}
              style={{
                border: '2px dashed #ccc',
                borderRadius: '8px',
                padding: '40px',
                textAlign: 'center',
                cursor: 'pointer',
                transition: 'all 0.3s',
                position: 'relative'
              }}
              onClick={() => document.getElementById('fileInput').click()}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = '#4ba3d6';
                e.currentTarget.style.background = '#f5f9fc';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = '#ccc';
                e.currentTarget.style.background = 'transparent';
              }}
            >
              <input
                id="fileInput"
                type="file"
                onChange={handleFileChange}
                accept=".pdf,.doc,.docx,.ppt,.pptx,.xls,.xlsx,.txt"
                style={{ display: 'none' }}
              />
              
              {formData.file ? (
                <div>
                  <div style={{
                    fontSize: '40px',
                    marginBottom: '10px',
                    color: '#4ba3d6'
                  }}>
                    📄
                  </div>
                  <div style={{
                    fontSize: '15px',
                    color: '#133a5c',
                    fontWeight: 'bold',
                    marginBottom: '5px'
                  }}>
                    {formData.file.name}
                  </div>
                  <div style={{ fontSize: '13px', color: '#888' }}>
                    {(formData.file.size / 1024 / 1024).toFixed(2)} MB
                  </div>
                </div>
              ) : (
                <div>
                  <div style={{
                    fontSize: '40px',
                    marginBottom: '10px',
                    color: '#ccc'
                  }}>
                    📁
                  </div>
                  <button
                    type="button"
                    style={{
                      background: '#0d7a4f',
                      color: '#fff',
                      border: 'none',
                      borderRadius: '6px',
                      padding: '10px 24px',
                      fontSize: '14px',
                      fontWeight: 'bold',
                      cursor: 'pointer',
                      marginBottom: '12px'
                    }}
                  >
                    Upload tài liệu
                  </button>
                  <div style={{
                    fontSize: '13px',
                    color: '#888',
                    marginTop: '10px'
                  }}>
                    Kéo & thả tài liệu vào đây hoặc bấm để chọn
                  </div>
                  <div style={{
                    fontSize: '12px',
                    color: '#aaa',
                    marginTop: '8px'
                  }}>
                    Định dạng: PDF, DOC, DOCX, PPT, PPTX, XLS, XLSX, TXT
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Thông báo thưởng điểm */}
          <div style={{
            background: '#fff3cd',
            border: '1px solid #ffc107',
            borderRadius: '6px',
            padding: '12px 16px',
            marginBottom: '25px',
            fontSize: '14px',
            color: '#856404'
          }}>
            💎 <strong>Thưởng:</strong> Bạn sẽ nhận được <strong>10 DP</strong> khi upload thành công!
          </div>

          {/* Buttons */}
          <div style={{
            display: 'flex',
            justifyContent: 'flex-end',
            gap: '15px'
          }}>
            <button
              type="button"
              onClick={handleCancel}
              disabled={uploading}
              style={{
                padding: '10px 30px',
                background: '#fff',
                color: '#2d4a67',
                border: '1px solid #ccc',
                borderRadius: '6px',
                fontSize: '14px',
                cursor: uploading ? 'not-allowed' : 'pointer',
                fontWeight: 'normal',
                opacity: uploading ? 0.6 : 1
              }}
            >
              Hủy
            </button>
            <button
              type="submit"
              disabled={uploading}
              style={{
                padding: '10px 30px',
                background: uploading ? '#ccc' : '#0d7a4f',
                color: '#fff',
                border: 'none',
                borderRadius: '6px',
                fontSize: '14px',
                fontWeight: 'bold',
                cursor: uploading ? 'not-allowed' : 'pointer'
              }}
            >
              {uploading ? 'Đang upload...' : 'Upload'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
