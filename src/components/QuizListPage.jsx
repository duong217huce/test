import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Header from './Header';

export default function QuizListPage() {
  const navigate = useNavigate();
  const [quizzes, setQuizzes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState({ grade: '', subject: '' });

  useEffect(() => {
    fetchQuizzes();
  }, [filter]);

  const fetchQuizzes = async () => {
    try {
      const params = new URLSearchParams();
      if (filter.grade) params.append('grade', filter.grade);
      if (filter.subject) params.append('subject', filter.subject);

      const response = await fetch(`http://localhost:5000/api/quizzes?${params}`);
      const data = await response.json();
      setQuizzes(data);
    } catch (error) {
      console.error('Error fetching quizzes:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateQuiz = () => {
    const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true';
    if (!isLoggedIn) {
      alert('Vui lòng đăng nhập để tạo đề thi!');
      navigate('/login');
      return;
    }
    navigate('/quiz/create');
  };

  return (
    <div style={{ minHeight: '100vh', background: '#fffffe' }}>
      <Header />
      <div style={{ height: '130px' }}></div>

      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '20px' }}>
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
          <h1 style={{ color: '#133a5c', fontSize: '28px', fontWeight: 'bold' }}>
            📝 Ôn tập trắc nghiệm
          </h1>
          <button
            onClick={handleCreateQuiz}
            style={{
              padding: '12px 24px',
              background: '#0d7a4f',
              color: '#fff',
              border: 'none',
              borderRadius: '8px',
              fontSize: '15px',
              fontWeight: 'bold',
              cursor: 'pointer',
              boxShadow: '0 2px 8px rgba(13,122,79,0.3)'
            }}
            onMouseOver={(e) => e.currentTarget.style.background = '#0a5f3d'}
            onMouseOut={(e) => e.currentTarget.style.background = '#0d7a4f'}
          >
            ➕ Tạo đề thi mới
          </button>
        </div>

        {/* Filters */}
        <div style={{ 
          display: 'flex', 
          gap: '15px', 
          marginBottom: '30px',
          padding: '20px',
          background: '#fff',
          borderRadius: '8px',
          boxShadow: '0 2px 8px rgba(0,0,0,0.06)'
        }}>
          <select
            value={filter.grade}
            onChange={(e) => setFilter({ ...filter, grade: e.target.value })}
            style={{
              padding: '10px',
              borderRadius: '6px',
              border: '1px solid #ccc',
              fontSize: '14px',
              minWidth: '150px'
            }}
          >
            <option value="">Tất cả cấp học</option>
            <option value="Lớp 1">Lớp 1</option>
            <option value="Lớp 2">Lớp 2</option>
            <option value="Lớp 3">Lớp 3</option>
            <option value="Lớp 4">Lớp 4</option>
            <option value="Lớp 5">Lớp 5</option>
            <option value="Lớp 6">Lớp 6</option>
            <option value="Lớp 7">Lớp 7</option>
            <option value="Lớp 8">Lớp 8</option>
            <option value="Lớp 9">Lớp 9</option>
            <option value="Lớp 10">Lớp 10</option>
            <option value="Lớp 11">Lớp 11</option>
            <option value="Lớp 12">Lớp 12</option>
            <option value="Đại học">Đại học</option>
          </select>

          <select
            value={filter.subject}
            onChange={(e) => setFilter({ ...filter, subject: e.target.value })}
            style={{
              padding: '10px',
              borderRadius: '6px',
              border: '1px solid #ccc',
              fontSize: '14px',
              minWidth: '150px'
            }}
          >
            <option value="">Tất cả môn học</option>
            <option value="Toán">Toán</option>
            <option value="Văn">Văn</option>
            <option value="Tiếng Anh">Tiếng Anh</option>
            <option value="Vật lý">Vật lý</option>
            <option value="Hóa học">Hóa học</option>
            <option value="Sinh học">Sinh học</option>
            <option value="Lịch sử">Lịch sử</option>
            <option value="Địa lý">Địa lý</option>
            <option value="Tin học">Tin học</option>
          </select>
        </div>

        {/* Quiz Grid */}
        {loading ? (
          <div style={{ textAlign: 'center', padding: '50px', color: '#888' }}>
            Đang tải...
          </div>
        ) : quizzes.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '50px', color: '#888' }}>
            Chưa có đề thi nào
          </div>
        ) : (
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
            gap: '20px'
          }}>
            {quizzes.map((quiz) => (
              <Link
                key={quiz._id}
                to={`/quiz/${quiz._id}`}
                style={{
                  textDecoration: 'none',
                  background: '#fff',
                  borderRadius: '12px',
                  overflow: 'hidden',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
                  transition: 'all 0.3s'
                }}
                onMouseOver={(e) => {
                  e.currentTarget.style.transform = 'translateY(-5px)';
                  e.currentTarget.style.boxShadow = '0 8px 20px rgba(0,0,0,0.15)';
                }}
                onMouseOut={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.08)';
                }}
              >
                {/* Cover Image */}
                <div style={{
                  width: '100%',
                  height: '160px',
                  background: quiz.coverImage 
                    ? `url(${quiz.coverImage}) center/cover` 
                    : 'linear-gradient(135deg, #4ba3d6 0%, #133a5c 100%)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#fff',
                  fontSize: '48px'
                }}>
                  {!quiz.coverImage && '📝'}
                </div>

                {/* Content */}
                <div style={{ padding: '16px' }}>
                  <h3 style={{
                    color: '#133a5c',
                    fontSize: '16px',
                    fontWeight: 'bold',
                    marginBottom: '8px',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap'
                  }}>
                    {quiz.title}
                  </h3>

                  <p style={{
                    color: '#666',
                    fontSize: '13px',
                    marginBottom: '12px',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    display: '-webkit-box',
                    WebkitLineClamp: 2,
                    WebkitBoxOrient: 'vertical'
                  }}>
                    {quiz.description || 'Không có mô tả'}
                  </p>

                  <div style={{ display: 'flex', gap: '8px', marginBottom: '12px' }}>
                    <span style={{
                      padding: '4px 10px',
                      background: '#f0f8ff',
                      color: '#4ba3d6',
                      borderRadius: '12px',
                      fontSize: '12px',
                      fontWeight: '500'
                    }}>
                      {quiz.grade}
                    </span>
                    <span style={{
                      padding: '4px 10px',
                      background: '#f0fff4',
                      color: '#0d7a4f',
                      borderRadius: '12px',
                      fontSize: '12px',
                      fontWeight: '500'
                    }}>
                      {quiz.subject}
                    </span>
                  </div>

                  <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    color: '#888',
                    fontSize: '13px'
                  }}>
                    <span>⏱️ {quiz.duration} phút</span>
                    <span>📋 {quiz.sections.reduce((sum, s) => sum + s.questions.length, 0)} câu</span>
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
