import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Header from './Header';

export default function QuizDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [quiz, setQuiz] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showModeModal, setShowModeModal] = useState(false);
  const [selectedMode, setSelectedMode] = useState('practice');
  const [settings, setSettings] = useState({
    shuffleQuestions: false,
    shuffleAnswers: false,
    autoAdvance: 0
  });
  const [password, setPassword] = useState('');

  useEffect(() => {
    fetchQuiz();
  }, [id]);

  const fetchQuiz = async () => {
    try {
      const response = await fetch(`http://localhost:5000/api/quizzes/${id}`);
      const data = await response.json();
      setQuiz(data);
    } catch (error) {
      console.error('Error fetching quiz:', error);
      alert('Không thể tải đề thi!');
      navigate('/quiz');
    } finally {
      setLoading(false);
    }
  };

  const handleStartQuiz = () => {
    const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true';
    if (!isLoggedIn) {
      alert('Vui lòng đăng nhập để làm bài!');
      navigate('/login');
      return;
    }
    setShowModeModal(true);
  };

  const handleConfirmStart = async () => {
    try {
      const token = localStorage.getItem('token');

      const response = await fetch(`http://localhost:5000/api/quizzes/${id}/start`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          mode: selectedMode,
          settings,
          password: password || undefined
        })
      });

      const data = await response.json();

      if (response.ok) {
        navigate(`/quiz/${id}/take`, {
          state: {
            attemptId: data.attemptId,
            quiz: data.quiz,
            mode: selectedMode,
            settings
          }
        });
      } else {
        alert(data.message || 'Không thể bắt đầu bài thi!');
      }
    } catch (error) {
      console.error('Error starting quiz:', error);
      alert('Có lỗi xảy ra!');
    }
  };

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', background: '#fffffe' }}>
        <Header />
        <div style={{ height: '130px' }}></div>
        <div style={{ textAlign: 'center', padding: '50px', color: '#888' }}>
          Đang tải...
        </div>
      </div>
    );
  }

  if (!quiz) {
    return null;
  }

  const totalQuestions = quiz.sections.reduce((sum, s) => sum + s.questions.length, 0);

  return (
    <div style={{ minHeight: '100vh', background: '#fffffe' }}>
      <Header />
      <div style={{ height: '130px' }}></div>

      <div style={{ maxWidth: '900px', margin: '0 auto', padding: '20px' }}>
        {/* Cover Image */}
        <div style={{
          width: '100%',
          height: '300px',
          background: quiz.coverImage 
            ? `url(${quiz.coverImage}) center/cover` 
            : 'linear-gradient(135deg, #4ba3d6 0%, #133a5c 100%)',
          borderRadius: '12px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: '#fff',
          fontSize: '80px',
          marginBottom: '30px',
          boxShadow: '0 4px 12px rgba(0,0,0,0.15)'
        }}>
          {!quiz.coverImage && '📝'}
        </div>

        {/* Quiz Info */}
        <div style={{
          background: '#fff',
          borderRadius: '12px',
          padding: '30px',
          boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
          marginBottom: '20px'
        }}>
          <h1 style={{ color: '#133a5c', fontSize: '32px', fontWeight: 'bold', marginBottom: '15px' }}>
            {quiz.title}
          </h1>

          <div style={{ display: 'flex', gap: '10px', marginBottom: '20px' }}>
            <span style={{
              padding: '6px 14px',
              background: '#f0f8ff',
              color: '#4ba3d6',
              borderRadius: '16px',
              fontSize: '14px',
              fontWeight: '500'
            }}>
              {quiz.grade}
            </span>
            <span style={{
              padding: '6px 14px',
              background: '#f0fff4',
              color: '#0d7a4f',
              borderRadius: '16px',
              fontSize: '14px',
              fontWeight: '500'
            }}>
              {quiz.subject}
            </span>
          </div>

          <p style={{ color: '#666', fontSize: '15px', lineHeight: '1.6', marginBottom: '20px' }}>
            {quiz.description || 'Không có mô tả'}
          </p>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(3, 1fr)',
            gap: '20px',
            marginBottom: '25px',
            padding: '20px',
            background: '#f5f9fc',
            borderRadius: '8px'
          }}>
            <div>
              <div style={{ color: '#888', fontSize: '13px', marginBottom: '5px' }}>Tổng số câu</div>
              <div style={{ color: '#133a5c', fontSize: '20px', fontWeight: 'bold' }}>
                📋 {totalQuestions} câu
              </div>
            </div>
            <div>
              <div style={{ color: '#888', fontSize: '13px', marginBottom: '5px' }}>Thời gian</div>
              <div style={{ color: '#133a5c', fontSize: '20px', fontWeight: 'bold' }}>
                ⏱️ {quiz.duration} phút
              </div>
            </div>
            <div>
              <div style={{ color: '#888', fontSize: '13px', marginBottom: '5px' }}>Người tạo</div>
              <div style={{ color: '#133a5c', fontSize: '16px', fontWeight: 'bold' }}>
                👤 {quiz.createdBy?.fullName || quiz.createdBy?.username || 'Ẩn danh'}
              </div>
            </div>
          </div>

          <button
            onClick={handleStartQuiz}
            style={{
              width: '100%',
              padding: '16px',
              background: '#0d7a4f',
              color: '#fff',
              border: 'none',
              borderRadius: '8px',
              fontSize: '18px',
              fontWeight: 'bold',
              cursor: 'pointer',
              boxShadow: '0 4px 12px rgba(13,122,79,0.3)',
              transition: 'all 0.3s'
            }}
            onMouseOver={(e) => {
              e.currentTarget.style.background = '#0a5f3d';
              e.currentTarget.style.transform = 'translateY(-2px)';
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.background = '#0d7a4f';
              e.currentTarget.style.transform = 'translateY(0)';
            }}
          >
            🚀 Bắt đầu làm bài
          </button>
        </div>

        {/* Danh sách phần thi */}
        <div style={{
          background: '#fff',
          borderRadius: '12px',
          padding: '30px',
          boxShadow: '0 2px 8px rgba(0,0,0,0.06)'
        }}>
          <h2 style={{ color: '#133a5c', fontSize: '20px', fontWeight: 'bold', marginBottom: '20px' }}>
            📚 Danh sách phần thi
          </h2>

          {quiz.sections.map((section, index) => (
            <div key={index} style={{
              padding: '15px',
              background: '#f5f9fc',
              borderRadius: '8px',
              marginBottom: '15px',
              borderLeft: '4px solid #4ba3d6'
            }}>
              <div style={{ fontWeight: 'bold', color: '#133a5c', fontSize: '16px', marginBottom: '5px' }}>
                {section.name}
              </div>
              <div style={{ color: '#666', fontSize: '14px' }}>
                {section.questions.length} câu hỏi
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Modal chọn chế độ */}
      {showModeModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0,0,0,0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 2000
        }}>
          <div style={{
            background: '#fff',
            borderRadius: '12px',
            padding: '30px',
            maxWidth: '500px',
            width: '90%',
            boxShadow: '0 8px 32px rgba(0,0,0,0.3)',
            position: 'relative'
          }}>
            <button
              onClick={() => setShowModeModal(false)}
              style={{
                position: 'absolute',
                top: '15px',
                right: '15px',
                background: 'none',
                border: 'none',
                fontSize: '24px',
                cursor: 'pointer',
                color: '#888'
              }}
            >
              ×
            </button>

            <h2 style={{ color: '#133a5c', fontSize: '22px', fontWeight: 'bold', marginBottom: '25px' }}>
              Chọn chế độ luyện thi
            </h2>

            {/* Chế độ */}
            <div style={{ marginBottom: '25px' }}>
              <div style={{ display: 'flex', gap: '15px' }}>
                <label style={{
                  flex: 1,
                  padding: '15px',
                  border: selectedMode === 'practice' ? '2px solid #4ba3d6' : '2px solid #ddd',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  background: selectedMode === 'practice' ? '#f0f8ff' : '#fff',
                  transition: 'all 0.3s'
                }}>
                  <input
                    type="radio"
                    name="mode"
                    value="practice"
                    checked={selectedMode === 'practice'}
                    onChange={(e) => setSelectedMode(e.target.value)}
                    style={{ marginRight: '10px' }}
                  />
                  <strong>Ôn thi</strong>
                  <div style={{ fontSize: '12px', color: '#666', marginTop: '5px', marginLeft: '24px' }}>
                    ✅ Không giới hạn thời gian<br/>
                    ✅ Hiển thị ngay đáp án
                  </div>
                </label>

                <label style={{
                  flex: 1,
                  padding: '15px',
                  border: selectedMode === 'exam' ? '2px solid #4ba3d6' : '2px solid #ddd',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  background: selectedMode === 'exam' ? '#f0f8ff' : '#fff',
                  transition: 'all 0.3s'
                }}>
                  <input
                    type="radio"
                    name="mode"
                    value="exam"
                    checked={selectedMode === 'exam'}
                    onChange={(e) => setSelectedMode(e.target.value)}
                    style={{ marginRight: '10px' }}
                  />
                  <strong>Thi thử</strong>
                  <div style={{ fontSize: '12px', color: '#666', marginTop: '5px', marginLeft: '24px' }}>
                    ⏱️ Giới hạn thời gian<br/>
                    ❌ Không hiển thị ngay đáp án
                  </div>
                </label>
              </div>
            </div>

            {/* Cài đặt */}
            <div style={{
              padding: '15px',
              background: '#f5f5f5',
              borderRadius: '8px',
              marginBottom: '20px'
            }}>
              <h3 style={{ fontSize: '14px', fontWeight: 'bold', marginBottom: '12px', color: '#133a5c' }}>
                ⚙️ Cài đặt đề thi
              </h3>

              <label style={{ display: 'flex', alignItems: 'center', marginBottom: '10px', cursor: 'pointer' }}>
                <input
                  type="checkbox"
                  checked={settings.shuffleQuestions}
                  onChange={(e) => setSettings({ ...settings, shuffleQuestions: e.target.checked })}
                  style={{ marginRight: '10px', width: '18px', height: '18px' }}
                />
                <span style={{ fontSize: '14px' }}>Đảo câu hỏi</span>
              </label>

              <label style={{ display: 'flex', alignItems: 'center', marginBottom: '15px', cursor: 'pointer' }}>
                <input
                  type="checkbox"
                  checked={settings.shuffleAnswers}
                  onChange={(e) => setSettings({ ...settings, shuffleAnswers: e.target.checked })}
                  style={{ marginRight: '10px', width: '18px', height: '18px' }}
                />
                <span style={{ fontSize: '14px' }}>Đảo đáp án</span>
              </label>

              <div style={{ marginBottom: '10px' }}>
                <label style={{ fontSize: '14px', marginBottom: '8px', display: 'block' }}>
                  Tự động chuyển câu
                </label>
                <select
                  value={settings.autoAdvance}
                  onChange={(e) => setSettings({ ...settings, autoAdvance: parseInt(e.target.value) })}
                  style={{
                    width: '150px',
                    padding: '8px',
                    fontSize: '14px',
                    border: '1px solid #ccc',
                    borderRadius: '6px',
                    outline: 'none'
                  }}
                >
                  <option value="0">Không</option>
                  <option value="2">2 giây</option>
                  <option value="5">5 giây</option>
                  <option value="10">10 giây</option>
                </select>
              </div>
            </div>

            {/* Mật khẩu */}
            {quiz.password && (
              <div style={{ marginBottom: '20px' }}>
                <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: 'bold' }}>
                  Mật khẩu đề thi
                </label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Nhập mật khẩu"
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
            )}

            {/* Button */}
            <button
              onClick={handleConfirmStart}
              style={{
                width: '100%',
                padding: '14px',
                background: '#0d7a4f',
                color: '#fff',
                border: 'none',
                borderRadius: '8px',
                fontSize: '16px',
                fontWeight: 'bold',
                cursor: 'pointer'
              }}
            >
              ✅ Xác nhận vào thi
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
