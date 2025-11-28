import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from './Header';

const gradeOptions = [
  'Lớp 1', 'Lớp 2', 'Lớp 3', 'Lớp 4', 'Lớp 5',
  'Lớp 6', 'Lớp 7', 'Lớp 8', 'Lớp 9',
  'Lớp 10', 'Lớp 11', 'Lớp 12', 'Đại học'
];

const subjectOptions = [
  'Toán', 'Văn', 'Tiếng Anh', 'Vật lý', 'Hóa học', 'Sinh học',
  'Lịch sử', 'Địa lý', 'Tin học', 'GDCD',
  'Lập trình', 'Kinh tế', 'Luật', 'Y học', 'Kiến trúc'
];

export default function CreateQuizPage() {
  const navigate = useNavigate();
  const [currentTab, setCurrentTab] = useState(1);
  const [coverPreview, setCoverPreview] = useState(null);
  const [saving, setSaving] = useState(false);
  
  const [quizData, setQuizData] = useState({
    title: '',
    description: '',
    coverImage: null,
    grade: '',
    subject: '',
    duration: 60,
    password: '',
    sections: [
      {
        name: 'Phần 1',
        questions: []
      }
    ]
  });

  const [currentSection, setCurrentSection] = useState(0);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(null);
  const [currentQuestion, setCurrentQuestion] = useState({
    content: '',
    type: 'single',
    topic: '',
    answers: [
      { content: '', isCorrect: false },
      { content: '', isCorrect: false },
      { content: '', isCorrect: false }
    ]
  });

  // ==================== TAB 1 FUNCTIONS ====================

  const handleCoverImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        alert('Vui lòng chọn file ảnh!');
        return;
      }
      if (file.size > 5 * 1024 * 1024) {
        alert('Kích thước ảnh không được vượt quá 5MB!');
        return;
      }

      setQuizData(prev => ({ ...prev, coverImage: file }));

      const reader = new FileReader();
      reader.onload = (evt) => setCoverPreview(evt.target.result);
      reader.readAsDataURL(file);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setQuizData(prev => ({ ...prev, [name]: value }));
  };

  const validateTab1 = () => {
    if (!quizData.title.trim()) {
      alert('Vui lòng nhập tên đề thi!');
      return false;
    }
    if (!quizData.grade) {
      alert('Vui lòng chọn trình độ!');
      return false;
    }
    if (!quizData.subject) {
      alert('Vui lòng chọn môn học!');
      return false;
    }
    if (!quizData.duration || quizData.duration <= 0) {
      alert('Vui lòng nhập thời gian làm bài hợp lệ!');
      return false;
    }
    return true;
  };

  // ==================== TAB 2 FUNCTIONS ====================

  // Thêm phần thi mới
  const handleAddSection = () => {
    const newSection = {
      name: `Phần ${quizData.sections.length + 1}`,
      questions: []
    };
    setQuizData(prev => ({
      ...prev,
      sections: [...prev.sections, newSection]
    }));
    setCurrentSection(quizData.sections.length);
  };

  // Xóa phần thi
  const handleDeleteSection = (index) => {
    if (quizData.sections.length === 1) {
      alert('Phải có ít nhất 1 phần thi!');
      return;
    }
    if (window.confirm('Bạn có chắc muốn xóa phần này?')) {
      const newSections = quizData.sections.filter((_, i) => i !== index);
      setQuizData(prev => ({ ...prev, sections: newSections }));
      if (currentSection >= newSections.length) {
        setCurrentSection(newSections.length - 1);
      }
    }
  };

  // Sửa tên phần thi
  const handleRenamSection = (index) => {
    const newName = prompt('Nhập tên phần thi:', quizData.sections[index].name);
    if (newName && newName.trim()) {
      const newSections = [...quizData.sections];
      newSections[index].name = newName.trim();
      setQuizData(prev => ({ ...prev, sections: newSections }));
    }
  };

  // Thêm câu hỏi mới
  const handleAddQuestion = () => {
    setCurrentQuestion({
      content: '',
      type: 'single',
      topic: '',
      answers: [
        { content: '', isCorrect: false },
        { content: '', isCorrect: false },
        { content: '', isCorrect: false }
      ]
    });
    setCurrentQuestionIndex(null);
  };

  // Chọn câu hỏi để chỉnh sửa
  const handleSelectQuestion = (questionIndex) => {
    const question = quizData.sections[currentSection].questions[questionIndex];
    setCurrentQuestion({ ...question });
    setCurrentQuestionIndex(questionIndex);
  };

  // Cập nhật nội dung câu hỏi
  const handleQuestionChange = (field, value) => {
    setCurrentQuestion(prev => ({ ...prev, [field]: value }));
  };

  // Cập nhật đáp án
  const handleAnswerChange = (index, field, value) => {
    const newAnswers = [...currentQuestion.answers];
    newAnswers[index][field] = value;
    setCurrentQuestion(prev => ({ ...prev, answers: newAnswers }));
  };

  // Đánh dấu đáp án đúng
  const handleToggleCorrect = (index) => {
    const newAnswers = [...currentQuestion.answers];
    
    if (currentQuestion.type === 'single') {
      // Chỉ 1 đáp án đúng
      newAnswers.forEach((ans, i) => {
        ans.isCorrect = i === index;
      });
    } else {
      // Nhiều đáp án
      newAnswers[index].isCorrect = !newAnswers[index].isCorrect;
    }
    
    setCurrentQuestion(prev => ({ ...prev, answers: newAnswers }));
  };

  // Thêm đáp án
  const handleAddAnswer = () => {
    setCurrentQuestion(prev => ({
      ...prev,
      answers: [...prev.answers, { content: '', isCorrect: false }]
    }));
  };

  // Xóa đáp án
  const handleRemoveAnswer = (index) => {
    if (currentQuestion.answers.length <= 2) {
      alert('Phải có ít nhất 2 đáp án!');
      return;
    }
    const newAnswers = currentQuestion.answers.filter((_, i) => i !== index);
    setCurrentQuestion(prev => ({ ...prev, answers: newAnswers }));
  };

  // Lưu câu hỏi
  const handleSaveQuestion = () => {
    if (!currentQuestion.content.trim()) {
      alert('Vui lòng nhập nội dung câu hỏi!');
      return;
    }

    const hasEmptyAnswer = currentQuestion.answers.some(ans => !ans.content.trim());
    if (hasEmptyAnswer) {
      alert('Vui lòng điền đầy đủ nội dung các đáp án!');
      return;
    }

    const hasCorrectAnswer = currentQuestion.answers.some(ans => ans.isCorrect);
    if (!hasCorrectAnswer) {
      alert('Vui lòng chọn ít nhất 1 đáp án đúng!');
      return;
    }

    const newSections = [...quizData.sections];
    
    if (currentQuestionIndex !== null) {
      // Cập nhật câu hỏi hiện tại
      newSections[currentSection].questions[currentQuestionIndex] = { ...currentQuestion };
    } else {
      // Thêm câu hỏi mới
      newSections[currentSection].questions.push({ ...currentQuestion });
    }

    setQuizData(prev => ({ ...prev, sections: newSections }));
    
    alert('✅ Đã lưu câu hỏi!');
  };

  // Xóa câu hỏi
  const handleDeleteQuestion = (questionIndex) => {
    if (window.confirm('Bạn có chắc muốn xóa câu hỏi này?')) {
      const newSections = [...quizData.sections];
      newSections[currentSection].questions.splice(questionIndex, 1);
      setQuizData(prev => ({ ...prev, sections: newSections }));
      
      if (currentQuestionIndex === questionIndex) {
        handleAddQuestion();
      }
    }
  };

  // Submit toàn bộ quiz
  const handleSubmitQuiz = async (isDraft = false) => {
    if (!validateTab1()) {
      setCurrentTab(1);
      return;
    }

    const totalQuestions = quizData.sections.reduce((sum, s) => sum + s.questions.length, 0);
    if (totalQuestions === 0) {
      alert('Vui lòng thêm ít nhất 1 câu hỏi!');
      return;
    }

    setSaving(true);

    try {
      const token = localStorage.getItem('token');
      
      const formData = new FormData();
      formData.append('title', quizData.title);
      formData.append('description', quizData.description);
      formData.append('grade', quizData.grade);
      formData.append('subject', quizData.subject);
      formData.append('duration', quizData.duration);
      formData.append('password', quizData.password);
      formData.append('sections', JSON.stringify(quizData.sections));
      formData.append('isPublished', !isDraft);
      
      if (quizData.coverImage) {
        formData.append('coverImage', quizData.coverImage);
      }

      const response = await fetch('http://localhost:5000/api/quizzes', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      });

      if (response.ok) {
        alert(`✅ ${isDraft ? 'Đã lưu nháp' : 'Đã tạo đề thi'} thành công!`);
        navigate('/quiz');
      } else {
        const error = await response.json();
        alert(`Lỗi: ${error.message}`);
      }
    } catch (error) {
      console.error('Error creating quiz:', error);
      alert('Có lỗi xảy ra khi tạo đề thi!');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', background: '#fffffe' }}>
      <Header />
      <div style={{ height: '130px' }}></div>

      <div style={{ maxWidth: '1400px', margin: '0 auto', padding: '20px' }}>
        <h1 style={{ color: '#133a5c', fontSize: '28px', marginBottom: '30px', fontWeight: 'bold' }}>
          Tạo đề thi mới
        </h1>

        {/* Tabs */}
        <div style={{ display: 'flex', gap: '20px', marginBottom: '30px', borderBottom: '2px solid #e0e0e0' }}>
          <button
            onClick={() => setCurrentTab(1)}
            style={{
              padding: '12px 24px',
              background: currentTab === 1 ? '#4ba3d6' : 'transparent',
              color: currentTab === 1 ? '#fff' : '#666',
              border: 'none',
              borderBottom: currentTab === 1 ? '3px solid #4ba3d6' : 'none',
              cursor: 'pointer',
              fontSize: '16px',
              fontWeight: currentTab === 1 ? 'bold' : 'normal',
              transition: 'all 0.3s'
            }}
          >
            1. Thông tin cơ bản
          </button>
          <button
            onClick={() => {
              if (validateTab1()) setCurrentTab(2);
            }}
            style={{
              padding: '12px 24px',
              background: currentTab === 2 ? '#4ba3d6' : 'transparent',
              color: currentTab === 2 ? '#fff' : '#666',
              border: 'none',
              borderBottom: currentTab === 2 ? '3px solid #4ba3d6' : 'none',
              cursor: 'pointer',
              fontSize: '16px',
              fontWeight: currentTab === 2 ? 'bold' : 'normal',
              transition: 'all 0.3s'
            }}
          >
            2. Soạn câu hỏi
          </button>
        </div>

        {/* ==================== TAB 1: THÔNG TIN CƠ BẢN ==================== */}
        {currentTab === 1 && (
          <div style={{
            background: '#fff',
            borderRadius: '8px',
            padding: '30px',
            boxShadow: '0 2px 8px rgba(0,0,0,0.06)'
          }}>
            {/* Ảnh bìa */}
            <div style={{ marginBottom: '25px' }}>
              <label style={{ display: 'block', marginBottom: '8px', color: '#133a5c', fontSize: '15px', fontWeight: 'normal' }}>
                Ảnh bìa đề thi
              </label>
              
              <div style={{ display: 'flex', gap: '20px', alignItems: 'flex-start' }}>
                {coverPreview && (
                  <div style={{
                    width: '200px',
                    height: '280px',
                    border: '2px solid #4ba3d6',
                    borderRadius: '8px',
                    overflow: 'hidden',
                    flexShrink: 0
                  }}>
                    <img src={coverPreview} alt="Preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  </div>
                )}

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
                  <div style={{ fontSize: '12px', color: '#888' }}>
                    • Định dạng: JPG, PNG, GIF<br/>
                    • Kích thước tối đa: 5MB
                  </div>
                </div>
              </div>
            </div>

            {/* Tên đề thi */}
            <div style={{ marginBottom: '25px' }}>
              <label style={{ display: 'block', marginBottom: '8px', color: '#133a5c', fontSize: '15px' }}>
                Tên đề thi <span style={{ color: '#e84c61' }}>*</span>
              </label>
              <input
                type="text"
                name="title"
                value={quizData.title}
                onChange={handleInputChange}
                placeholder="VD: Đề thi giữa kỳ Toán 12"
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

            {/* Trình độ và Môn học */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '25px' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '8px', color: '#133a5c', fontSize: '15px' }}>
                  Trình độ <span style={{ color: '#e84c61' }}>*</span>
                </label>
                <select
                  name="grade"
                  value={quizData.grade}
                  onChange={handleInputChange}
                  required
                  style={{
                    width: '100%',
                    padding: '12px',
                    fontSize: '14px',
                    border: '1px solid #ccc',
                    borderRadius: '6px',
                    outline: 'none',
                    background: '#fff',
                    cursor: 'pointer',
                    boxSizing: 'border-box'
                  }}
                >
                  <option value="">Chọn trình độ</option>
                  {gradeOptions.map(grade => (
                    <option key={grade} value={grade}>{grade}</option>
                  ))}
                </select>
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: '8px', color: '#133a5c', fontSize: '15px' }}>
                  Môn học <span style={{ color: '#e84c61' }}>*</span>
                </label>
                <select
                  name="subject"
                  value={quizData.subject}
                  onChange={handleInputChange}
                  required
                  style={{
                    width: '100%',
                    padding: '12px',
                    fontSize: '14px',
                    border: '1px solid #ccc',
                    borderRadius: '6px',
                    outline: 'none',
                    background: '#fff',
                    cursor: 'pointer',
                    boxSizing: 'border-box'
                  }}
                >
                  <option value="">Chọn môn học</option>
                  {subjectOptions.map(subject => (
                    <option key={subject} value={subject}>{subject}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Thời gian làm bài */}
            <div style={{ marginBottom: '25px' }}>
              <label style={{ display: 'block', marginBottom: '8px', color: '#133a5c', fontSize: '15px' }}>
                Thời gian làm bài (phút) <span style={{ color: '#e84c61' }}>*</span>
              </label>
              <input
                type="number"
                name="duration"
                value={quizData.duration}
                onChange={handleInputChange}
                min="1"
                required
                style={{
                  width: '200px',
                  padding: '12px',
                  fontSize: '14px',
                  border: '1px solid #ccc',
                  borderRadius: '6px',
                  outline: 'none'
                }}
              />
            </div>

            {/* Mô tả */}
            <div style={{ marginBottom: '25px' }}>
              <label style={{ display: 'block', marginBottom: '8px', color: '#133a5c', fontSize: '15px' }}>
                Mô tả đề thi
              </label>
              <textarea
                name="description"
                value={quizData.description}
                onChange={handleInputChange}
                rows="5"
                placeholder="Mô tả ngắn gọn về đề thi..."
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

            {/* Mật khẩu */}
            <div style={{ marginBottom: '25px' }}>
              <label style={{ display: 'block', marginBottom: '8px', color: '#133a5c', fontSize: '15px' }}>
                Mật khẩu đề thi (tùy chọn)
              </label>
              <input
                type="password"
                name="password"
                value={quizData.password}
                onChange={handleInputChange}
                placeholder="Để trống nếu không cần mật khẩu"
                style={{
                  width: '300px',
                  padding: '12px',
                  fontSize: '14px',
                  border: '1px solid #ccc',
                  borderRadius: '6px',
                  outline: 'none'
                }}
              />
            </div>

            {/* Buttons */}
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '15px', marginTop: '30px' }}>
              <button
                onClick={() => navigate('/quiz')}
                style={{
                  padding: '12px 30px',
                  background: '#fff',
                  color: '#2d4a67',
                  border: '1px solid #ccc',
                  borderRadius: '6px',
                  fontSize: '14px',
                  cursor: 'pointer'
                }}
              >
                Hủy
              </button>
              <button
                onClick={() => {
                  if (validateTab1()) setCurrentTab(2);
                }}
                style={{
                  padding: '12px 30px',
                  background: '#4ba3d6',
                  color: '#fff',
                  border: 'none',
                  borderRadius: '6px',
                  fontSize: '14px',
                  fontWeight: 'bold',
                  cursor: 'pointer'
                }}
              >
                Tiếp theo →
              </button>
            </div>
          </div>
        )}

        {/* ==================== TAB 2: SOẠN CÂU HỎI ==================== */}
        {currentTab === 2 && (
          <div style={{ display: 'flex', gap: '20px' }}>
            {/* BÊN TRÁI: Danh sách phần thi & câu hỏi */}
            <div style={{ width: '300px', flexShrink: 0 }}>
              {/* Danh sách phần thi */}
              <div style={{
                background: '#fff',
                borderRadius: '8px',
                padding: '20px',
                boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
                marginBottom: '20px'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
                  <h3 style={{ color: '#133a5c', fontSize: '16px', fontWeight: 'bold' }}>
                    Danh sách phần thi
                  </h3>
                  <button
                    onClick={handleAddSection}
                    style={{
                      padding: '6px 12px',
                      background: '#4ba3d6',
                      color: '#fff',
                      border: 'none',
                      borderRadius: '4px',
                      fontSize: '12px',
                      cursor: 'pointer'
                    }}
                  >
                    Thêm mới
                  </button>
                </div>

                {quizData.sections.map((section, index) => (
                  <div
                    key={index}
                    style={{
                      padding: '12px',
                      background: currentSection === index ? '#e3f2fd' : '#f5f5f5',
                      borderRadius: '6px',
                      marginBottom: '10px',
                      cursor: 'pointer',
                      border: currentSection === index ? '2px solid #4ba3d6' : 'none'
                    }}
                    onClick={() => setCurrentSection(index)}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontWeight: 'bold', color: '#133a5c' }}>{section.name}</span>
                      <div style={{ display: 'flex', gap: '5px' }}>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleRenamSection(index);
                          }}
                          style={{
                            padding: '4px 8px',
                            background: '#4ba3d6',
                            color: '#fff',
                            border: 'none',
                            borderRadius: '4px',
                            fontSize: '11px',
                            cursor: 'pointer'
                          }}
                        >
                          ✏️
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteSection(index);
                          }}
                          style={{
                            padding: '4px 8px',
                            background: '#e84c61',
                            color: '#fff',
                            border: 'none',
                            borderRadius: '4px',
                            fontSize: '11px',
                            cursor: 'pointer'
                          }}
                        >
                          🗑️
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Danh mục câu hỏi */}
              <div style={{
                background: '#fff',
                borderRadius: '8px',
                padding: '20px',
                boxShadow: '0 2px 8px rgba(0,0,0,0.06)'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
                  <h3 style={{ color: '#133a5c', fontSize: '16px', fontWeight: 'bold' }}>
                    Danh mục câu hỏi
                  </h3>
                  <button
                    onClick={handleAddQuestion}
                    style={{
                      padding: '6px 12px',
                      background: '#0d7a4f',
                      color: '#fff',
                      border: 'none',
                      borderRadius: '4px',
                      fontSize: '12px',
                      cursor: 'pointer'
                    }}
                  >
                    + Thêm câu hỏi
                  </button>
                </div>

                {quizData.sections[currentSection].questions.length === 0 ? (
                  <div style={{ textAlign: 'center', padding: '20px', color: '#888', fontSize: '13px' }}>
                    Chưa có câu hỏi nào
                  </div>
                ) : (
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '8px' }}>
                    {quizData.sections[currentSection].questions.map((_, qIndex) => (
                      <div
                        key={qIndex}
                        style={{
                          padding: '10px',
                          background: currentQuestionIndex === qIndex ? '#4ba3d6' : '#f5f5f5',
                          color: currentQuestionIndex === qIndex ? '#fff' : '#133a5c',
                          borderRadius: '6px',
                          textAlign: 'center',
                          cursor: 'pointer',
                          fontWeight: 'bold',
                          fontSize: '14px',
                          position: 'relative'
                        }}
                        onClick={() => handleSelectQuestion(qIndex)}
                      >
                        {qIndex + 1}
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteQuestion(qIndex);
                          }}
                          style={{
                            position: 'absolute',
                            top: '-5px',
                            right: '-5px',
                            width: '18px',
                            height: '18px',
                            background: '#e84c61',
                            color: '#fff',
                            border: 'none',
                            borderRadius: '50%',
                            fontSize: '10px',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center'
                          }}
                        >
                          ×
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                <button
                  onClick={() => {
                    // TODO: Implement sắp xếp câu hỏi
                    alert('Chức năng sắp xếp câu hỏi đang phát triển');
                  }}
                  style={{
                    width: '100%',
                    marginTop: '15px',
                    padding: '10px',
                    background: '#fff',
                    color: '#4ba3d6',
                    border: '1px solid #4ba3d6',
                    borderRadius: '6px',
                    fontSize: '13px',
                    cursor: 'pointer'
                  }}
                >
                  🔀 Sắp xếp câu hỏi
                </button>
              </div>
            </div>

            {/* BÊN PHẢI: Chỉnh sửa câu hỏi */}
            <div style={{ flex: 1 }}>
              <div style={{
                background: '#fff',
                borderRadius: '8px',
                padding: '30px',
                boxShadow: '0 2px 8px rgba(0,0,0,0.06)'
              }}>
                <h3 style={{ color: '#133a5c', fontSize: '18px', fontWeight: 'bold', marginBottom: '20px' }}>
                  {currentQuestionIndex !== null ? `Chỉnh sửa câu ${currentQuestionIndex + 1}` : 'Thêm câu hỏi mới'}
                </h3>

                {/* Loại câu hỏi */}
                <div style={{ marginBottom: '20px' }}>
                  <label style={{ display: 'block', marginBottom: '8px', color: '#133a5c', fontSize: '14px', fontWeight: 'bold' }}>
                    Loại câu hỏi
                  </label>
                  <select
                    value={currentQuestion.type}
                    onChange={(e) => handleQuestionChange('type', e.target.value)}
                    style={{
                      width: '250px',
                      padding: '10px',
                      fontSize: '14px',
                      border: '1px solid #ccc',
                      borderRadius: '6px',
                      outline: 'none',
                      background: '#fff',
                      cursor: 'pointer'
                    }}
                  >
                    <option value="single">Một đáp án</option>
                    <option value="multiple">Nhiều đáp án</option>
                  </select>
                </div>

                {/* Soạn câu hỏi */}
                <div style={{ marginBottom: '20px' }}>
                  <label style={{ display: 'block', marginBottom: '8px', color: '#133a5c', fontSize: '14px', fontWeight: 'bold' }}>
                    Soạn câu hỏi <span style={{ color: '#e84c61' }}>*</span>
                  </label>
                  <textarea
                    value={currentQuestion.content}
                    onChange={(e) => handleQuestionChange('content', e.target.value)}
                    placeholder="Nhập nội dung câu hỏi"
                    rows="4"
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

                {/* Chú đề học tập */}
                <div style={{ marginBottom: '20px' }}>
                  <label style={{ display: 'block', marginBottom: '8px', color: '#133a5c', fontSize: '14px' }}>
                    Chú đề học tập (tùy chọn)
                  </label>
                  <input
                    type="text"
                    value={currentQuestion.topic}
                    onChange={(e) => handleQuestionChange('topic', e.target.value)}
                    placeholder="VD: Đại số tích phân, Hóa học hữu cơ..."
                    style={{
                      width: '100%',
                      padding: '10px',
                      fontSize: '14px',
                      border: '1px solid #ccc',
                      borderRadius: '6px',
                      outline: 'none',
                      boxSizing: 'border-box'
                    }}
                  />
                </div>

                {/* Câu trả lời */}
                <div style={{ marginBottom: '20px' }}>
                  <label style={{ display: 'block', marginBottom: '12px', color: '#133a5c', fontSize: '14px', fontWeight: 'bold' }}>
                    Câu trả lời <span style={{ color: '#e84c61' }}>*</span>
                  </label>

                  {currentQuestion.answers.map((answer, index) => (
                    <div key={index} style={{ marginBottom: '15px', display: 'flex', gap: '10px', alignItems: 'flex-start' }}>
                      {/* Radio/Checkbox */}
                      <div style={{ paddingTop: '10px' }}>
                        {currentQuestion.type === 'single' ? (
                          <input
                            type="radio"
                            checked={answer.isCorrect}
                            onChange={() => handleToggleCorrect(index)}
                            style={{ width: '20px', height: '20px', cursor: 'pointer' }}
                          />
                        ) : (
                          <input
                            type="checkbox"
                            checked={answer.isCorrect}
                            onChange={() => handleToggleCorrect(index)}
                            style={{ width: '20px', height: '20px', cursor: 'pointer' }}
                          />
                        )}
                      </div>

                      {/* Đáp án content */}
                      <textarea
                        value={answer.content}
                        onChange={(e) => handleAnswerChange(index, 'content', e.target.value)}
                        placeholder={`Nhập nội dung đáp án ${index + 1}`}
                        rows="2"
                        style={{
                          flex: 1,
                          padding: '10px',
                          fontSize: '14px',
                          border: '1px solid #ccc',
                          borderRadius: '6px',
                          outline: 'none',
                          resize: 'vertical',
                          fontFamily: 'Arial, sans-serif'
                        }}
                      />

                      {/* Xóa đáp án */}
                      <button
                        onClick={() => handleRemoveAnswer(index)}
                        style={{
                          padding: '10px',
                          background: '#e84c61',
                          color: '#fff',
                          border: 'none',
                          borderRadius: '6px',
                          fontSize: '12px',
                          cursor: 'pointer'
                        }}
                      >
                        Xóa
                      </button>
                    </div>
                  ))}

                  <button
                    onClick={handleAddAnswer}
                    style={{
                      padding: '8px 16px',
                      background: '#4ba3d6',
                      color: '#fff',
                      border: 'none',
                      borderRadius: '6px',
                      fontSize: '13px',
                      cursor: 'pointer',
                      marginTop: '10px'
                    }}
                  >
                    + Thêm đáp án
                  </button>
                </div>

                {/* Buttons */}
                <div style={{ display: 'flex', gap: '15px', marginTop: '30px' }}>
                  <button
                    onClick={handleSaveQuestion}
                    style={{
                      padding: '12px 24px',
                      background: '#0d7a4f',
                      color: '#fff',
                      border: 'none',
                      borderRadius: '6px',
                      fontSize: '14px',
                      fontWeight: 'bold',
                      cursor: 'pointer'
                    }}
                  >
                    💾 Lưu câu hỏi
                  </button>
                  <button
                    onClick={() => handleSubmitQuiz(true)}
                    disabled={saving}
                    style={{
                      padding: '12px 24px',
                      background: '#888',
                      color: '#fff',
                      border: 'none',
                      borderRadius: '6px',
                      fontSize: '14px',
                      cursor: saving ? 'not-allowed' : 'pointer',
                      opacity: saving ? 0.6 : 1
                    }}
                  >
                    {saving ? 'Đang lưu...' : '📝 Lưu nháp'}
                  </button>
                  <button
                    onClick={() => {
                      handleSaveQuestion();
                      handleAddQuestion();
                    }}
                    style={{
                      padding: '12px 24px',
                      background: '#4ba3d6',
                      color: '#fff',
                      border: 'none',
                      borderRadius: '6px',
                      fontSize: '14px',
                      fontWeight: 'bold',
                      cursor: 'pointer'
                    }}
                  >
                    💾 Lưu và Tạo mới
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Bottom Actions */}
        {currentTab === 2 && (
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            marginTop: '30px',
            padding: '20px',
            background: '#fff',
            borderRadius: '8px',
            boxShadow: '0 2px 8px rgba(0,0,0,0.06)'
          }}>
            <button
              onClick={() => setCurrentTab(1)}
              style={{
                padding: '12px 30px',
                background: '#fff',
                color: '#2d4a67',
                border: '1px solid #ccc',
                borderRadius: '6px',
                fontSize: '14px',
                cursor: 'pointer'
              }}
            >
              ← Quay lại
            </button>
            
            <div style={{ display: 'flex', gap: '15px' }}>
              <button
                onClick={() => navigate('/quiz')}
                style={{
                  padding: '12px 30px',
                  background: '#fff',
                  color: '#e84c61',
                  border: '1px solid #e84c61',
                  borderRadius: '6px',
                  fontSize: '14px',
                  cursor: 'pointer'
                }}
              >
                Hủy
              </button>
              <button
                onClick={() => handleSubmitQuiz(false)}
                disabled={saving}
                style={{
                  padding: '12px 30px',
                  background: saving ? '#ccc' : '#0d7a4f',
                  color: '#fff',
                  border: 'none',
                  borderRadius: '6px',
                  fontSize: '14px',
                  fontWeight: 'bold',
                  cursor: saving ? 'not-allowed' : 'pointer'
                }}
              >
                {saving ? 'Đang tạo...' : '✅ Hoàn thành'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
