import React from 'react';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import Header from './Header';

export default function QuizResultPage() {
  const { id } = useParams();
  const location = useLocation();
  const navigate = useNavigate();

  const { score, correctAnswers, totalQuestions, answers, quiz, mode } = location.state || {};

  if (!location.state) {
    return (
      <div style={{ minHeight: '100vh', background: '#fffffe' }}>
        <Header />
        <div style={{ height: '130px' }}></div>
        <div style={{ textAlign: 'center', padding: '50px', color: '#888' }}>
          Không có dữ liệu kết quả. Vui lòng làm lại bài thi.
        </div>
      </div>
    );
  }

  const percentage = (correctAnswers / totalQuestions) * 100;
  const roundedScore = Math.round(score * 10) / 10;

  const getRatingText = () => {
    if (percentage >= 90) return '🌟 Xuất sắc!';
    if (percentage >= 80) return '🎉 Rất tốt!';
    if (percentage >= 65) return '👍 Tốt!';
    if (percentage >= 50) return '💪 Cần cố gắng thêm!';
    return '📚 Hãy ôn tập lại nhé!';
  };

  const getRatingColor = () => {
    if (percentage >= 80) return '#0d7a4f';
    if (percentage >= 50) return '#f59e0b';
    return '#e84c61';
  };

  return (
    <div style={{ minHeight: '100vh', background: '#f5f9fc' }}>
      <Header />
      <div style={{ height: '130px' }}></div>

      <div style={{ maxWidth: '800px', margin: '0 auto', padding: '20px' }}>
        {/* Kết quả tổng quan */}
        <div style={{
          background: '#fff',
          borderRadius: '12px',
          padding: '40px',
          boxShadow: '0 4px 16px rgba(0,0,0,0.08)',
          textAlign: 'center',
          marginBottom: '30px'
        }}>
          <h1 style={{ color: '#133a5c', fontSize: '28px', fontWeight: 'bold', marginBottom: '10px' }}>
            🎯 Kết quả bài thi
          </h1>
          <p style={{ color: '#666', fontSize: '15px', marginBottom: '30px' }}>
            {quiz?.title}
          </p>

          {/* Điểm số và thống kê */}
          <div style={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            gap: '40px',
            marginBottom: '30px',
            flexWrap: 'wrap'
          }}>
            {/* Vòng tròn điểm */}
            <div style={{
              width: '160px',
              height: '160px',
              borderRadius: '50%',
              background: `conic-gradient(${getRatingColor()} 0deg, ${getRatingColor()} ${percentage * 3.6}deg, #e0e0e0 ${percentage * 3.6}deg 360deg)`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
            }}>
              <div style={{
                width: '130px',
                height: '130px',
                borderRadius: '50%',
                background: '#fff',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <div style={{ fontSize: '40px', fontWeight: 'bold', color: getRatingColor() }}>
                  {roundedScore.toFixed(1)}
                </div>
                <div style={{ fontSize: '14px', color: '#666', fontWeight: '500' }}>trên 10</div>
              </div>
            </div>

            {/* Thông tin chi tiết */}
            <div style={{ textAlign: 'left' }}>
              <div style={{ 
                fontSize: '24px', 
                fontWeight: 'bold', 
                color: getRatingColor(), 
                marginBottom: '15px' 
              }}>
                {getRatingText()}
              </div>
              <div style={{ fontSize: '15px', color: '#555', marginBottom: '8px' }}>
                ✅ Số câu đúng: <strong style={{ color: '#0d7a4f' }}>{correctAnswers}</strong> / {totalQuestions}
              </div>
              <div style={{ fontSize: '15px', color: '#555', marginBottom: '8px' }}>
                ❌ Số câu sai: <strong style={{ color: '#e84c61' }}>{totalQuestions - correctAnswers}</strong>
              </div>
              <div style={{ fontSize: '15px', color: '#555', marginBottom: '8px' }}>
                📊 Tỷ lệ đúng: <strong style={{ color: getRatingColor() }}>{percentage.toFixed(1)}%</strong>
              </div>
              <div style={{ fontSize: '15px', color: '#555' }}>
                🎮 Chế độ: <strong>{mode === 'practice' ? 'Ôn thi' : 'Thi thử'}</strong>
              </div>
            </div>
          </div>

          {/* Công thức tính điểm */}
          <div style={{
            padding: '15px',
            background: '#f5f9fc',
            borderRadius: '8px',
            fontSize: '13px',
            color: '#666',
            marginBottom: '25px'
          }}>
            💡 <strong>Công thức tính điểm:</strong> (10 / {totalQuestions}) × {correctAnswers} = {roundedScore.toFixed(1)} điểm
          </div>

          {/* Buttons */}
          <div style={{ display: 'flex', gap: '15px', justifyContent: 'center', flexWrap: 'wrap' }}>
            <button
              onClick={() => navigate('/quiz')}
              style={{
                padding: '12px 24px',
                background: '#fff',
                color: '#666',
                border: '1px solid #ccc',
                borderRadius: '6px',
                fontSize: '14px',
                cursor: 'pointer',
                fontWeight: '500'
              }}
            >
              📝 Danh sách đề thi
            </button>
            <button
              onClick={() => navigate(`/quiz/${id}`)}
              style={{
                padding: '12px 24px',
                background: '#fff',
                color: '#4ba3d6',
                border: '1px solid #4ba3d6',
                borderRadius: '6px',
                fontSize: '14px',
                cursor: 'pointer',
                fontWeight: '500'
              }}
            >
              ℹ️ Chi tiết đề thi
            </button>
            <button
              onClick={() => {
                navigate(`/quiz/${id}`);
                // Trigger popup chọn chế độ lại
              }}
              style={{
                padding: '12px 24px',
                background: '#0d7a4f',
                color: '#fff',
                border: 'none',
                borderRadius: '6px',
                fontSize: '14px',
                fontWeight: 'bold',
                cursor: 'pointer',
                boxShadow: '0 2px 8px rgba(13,122,79,0.3)'
              }}
            >
              🔁 Làm lại bài thi
            </button>
          </div>
        </div>

        {/* Thống kê theo phần */}
        {quiz?.sections && (
          <div style={{
            background: '#fff',
            borderRadius: '12px',
            padding: '30px',
            boxShadow: '0 2px 8px rgba(0,0,0,0.06)'
          }}>
            <h2 style={{ color: '#133a5c', fontSize: '20px', fontWeight: 'bold', marginBottom: '20px' }}>
              📊 Thống kê theo phần
            </h2>

            {quiz.sections.map((section, index) => {
              const sectionQuestions = section.questions.length;
              const sectionCorrect = answers?.filter(ans => {
                const question = section.questions.find(q => q._id === ans.questionId);
                return question && ans.isCorrect;
              }).length || 0;
              const sectionPercentage = (sectionCorrect / sectionQuestions) * 100;

              return (
                <div key={index} style={{
                  padding: '15px',
                  background: '#f5f9fc',
                  borderRadius: '8px',
                  marginBottom: '12px',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center'
                }}>
                  <div>
                    <div style={{ fontWeight: 'bold', color: '#133a5c', fontSize: '15px', marginBottom: '5px' }}>
                      {section.name}
                    </div>
                    <div style={{ fontSize: '13px', color: '#666' }}>
                      {sectionCorrect} / {sectionQuestions} câu đúng
                    </div>
                  </div>
                  <div style={{
                    padding: '6px 14px',
                    background: sectionPercentage >= 80 ? '#d4edda' : (sectionPercentage >= 50 ? '#fff3cd' : '#f8d7da'),
                    color: sectionPercentage >= 80 ? '#155724' : (sectionPercentage >= 50 ? '#856404' : '#721c24'),
                    borderRadius: '16px',
                    fontSize: '13px',
                    fontWeight: 'bold'
                  }}>
                    {sectionPercentage.toFixed(0)}%
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
