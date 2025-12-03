import React, { useState, useEffect, useRef } from 'react';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import Header from './Header';
import Footer from './Footer';

export default function TakeQuizPage() {
  const { id } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  
  const { attemptId, quiz, mode, settings } = location.state || {};
  
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [userAnswers, setUserAnswers] = useState({});
  const [timeRemaining, setTimeRemaining] = useState(quiz?.duration * 60 || 0);
  const [showEndModal, setShowEndModal] = useState(false);
  const [questions, setQuestions] = useState([]);
  const [soundEnabled, setSoundEnabled] = useState(false);

  const timerRef = useRef(null);
  const autoAdvanceTimerRef = useRef(null);

  useEffect(() => {
    if (!quiz || !attemptId) {
      alert('Không có thông tin bài thi!');
      navigate('/quiz');
      return;
    }

    // Chuẩn bị danh sách câu hỏi
    let allQuestions = [];
    quiz.sections.forEach((section, sIndex) => {
      section.questions.forEach((question, qIndex) => {
        allQuestions.push({
          sectionIndex: sIndex,
          questionIndex: qIndex,
          sectionName: section.name,
          question: question
        });
      });
    });

    // Đảo câu hỏi nếu có cài đặt
    if (settings.shuffleQuestions) {
      allQuestions = shuffleArray(allQuestions);
    }

    // Đảo đáp án nếu có cài đặt
    if (settings.shuffleAnswers) {
      allQuestions = allQuestions.map(item => ({
        ...item,
        question: {
          ...item.question,
          answers: shuffleArray([...item.question.answers])
        }
      }));
    }

    setQuestions(allQuestions);

    // Bắt đầu đếm ngược nếu là chế độ thi thử
    if (mode === 'exam') {
      timerRef.current = setInterval(() => {
        setTimeRemaining(prev => {
          if (prev <= 1) {
            handleAutoSubmit();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      if (autoAdvanceTimerRef.current) clearTimeout(autoAdvanceTimerRef.current);
    };
  }, []);

  const shuffleArray = (array) => {
    const newArray = [...array];
    for (let i = newArray.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
    }
    return newArray;
  };

  const handleAutoSubmit = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    alert('⏰ Hết giờ! Bài thi sẽ được tự động nộp.');
    handleSubmitQuiz();
  };

  const handleAnswerSelect = (answerId) => {
    const currentQ = questions[currentQuestionIndex];
    const questionId = currentQ.question._id;

    if (soundEnabled) {
      // Phát âm thanh đơn giản
      try {
        const audio = new Audio('data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj');
        audio.play().catch(() => {});
      } catch {
        // Ignore audio errors
      }
    }

    setUserAnswers(prev => {
      const newAnswers = { ...prev };
      
      if (currentQ.question.type === 'single') {
        newAnswers[questionId] = [answerId];
      } else {
        const current = newAnswers[questionId] || [];
        if (current.includes(answerId)) {
          newAnswers[questionId] = current.filter(id => id !== answerId);
        } else {
          newAnswers[questionId] = [...current, answerId];
        }
      }
      
      return newAnswers;
    });

    // Tự động chuyển câu nếu có cài đặt và là câu một đáp án
    if (settings.autoAdvance > 0 && currentQ.question.type === 'single') {
      if (autoAdvanceTimerRef.current) clearTimeout(autoAdvanceTimerRef.current);
      
      autoAdvanceTimerRef.current = setTimeout(() => {
        handleNextQuestion();
      }, settings.autoAdvance * 1000);
    }
  };

  const handlePreviousQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
    }
  };

  const handleNextQuestion = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    }
  };

  const handleJumpToQuestion = (index) => {
    setCurrentQuestionIndex(index);
  };

  const handleEndQuiz = () => {
    setShowEndModal(true);
  };

  const handleSubmitQuiz = async () => {
    try {
      const token = localStorage.getItem('token');

      const answersArray = questions.map(item => ({
        questionId: item.question._id,
        selectedAnswers: userAnswers[item.question._id] || []
      }));

      const response = await fetch(`http://localhost:5000/api/quizzes/${id}/submit`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          attemptId,
          answers: answersArray
        })
      });

      const data = await response.json();

      if (response.ok) {
        navigate(`/quiz/${id}/result`, {
          state: {
            score: data.score,
            correctAnswers: data.correctAnswers,
            totalQuestions: data.totalQuestions,
            answers: data.answers,
            quiz,
            mode
          }
        });
      } else {
        alert(data.message || 'Có lỗi khi nộp bài!');
      }
    } catch (error) {
      console.error('Error submitting quiz:', error);
      alert('Có lỗi xảy ra khi nộp bài!');
    }
  };

  const formatTime = (seconds) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    
    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${minutes}:${secs.toString().padStart(2, '0')}`;
  };

  const getAnsweredCount = () => {
    return Object.keys(userAnswers).filter(qId => 
      userAnswers[qId] && userAnswers[qId].length > 0
    ).length;
  };

  if (!quiz || questions.length === 0) {
    return (
      <div style={{ minHeight: '100vh', background: '#fffffe' }}>
        <Header />
        <div style={{ height: '130px' }}></div>
        <div style={{ textAlign: 'center', padding: '50px', color: '#888' }}>
          Đang tải bài thi...
        </div>
      </div>
    );
  }

  const currentQ = questions[currentQuestionIndex];
  const currentAnswers = userAnswers[currentQ.question._id] || [];

  return (
    <div style={{ minHeight: '100vh', background: '#f5f9fc' }}>
      <Header />
      <div style={{ height: '130px' }}></div>

      <div style={{ display: 'flex', gap: '20px', maxWidth: '1400px', margin: '0 auto', padding: '20px' }}>
        {/* BÊN TRÁI */}
        <div style={{ width: '280px', flexShrink: 0 }}>
          <div style={{
            background: '#fff',
            borderRadius: '8px',
            padding: '20px',
            boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
            marginBottom: '20px'
          }}>
            <h3 style={{ color: '#133a5c', fontSize: '16px', fontWeight: 'bold', marginBottom: '15px' }}>
              {quiz.title}
            </h3>

            <div style={{ marginBottom: '15px' }}>
              <div style={{ fontSize: '12px', color: '#888', marginBottom: '5px' }}>Chế độ</div>
              <div style={{
                padding: '6px 12px',
                background: mode === 'practice' ? '#e7f5ff' : '#fff3cd',
                color: mode === 'practice' ? '#4ba3d6' : '#856404',
                borderRadius: '6px',
                fontSize: '13px',
                fontWeight: 'bold',
                textAlign: 'center'
              }}>
                {mode === 'practice' ? '📖 Ôn thi' : '⏱️ Thi thử'}
              </div>
            </div>

            {mode === 'exam' && (
              <div style={{ marginBottom: '15px' }}>
                <div style={{ fontSize: '12px', color: '#888', marginBottom: '5px' }}>Thời gian còn lại</div>
                <div style={{
                  padding: '10px',
                  background: timeRemaining < 300 ? '#fff3cd' : '#f0fff4',
                  color: timeRemaining < 300 ? '#856404' : '#0d7a4f',
                  borderRadius: '6px',
                  fontSize: '20px',
                  fontWeight: 'bold',
                  textAlign: 'center'
                }}>
                  ⏱️ {formatTime(timeRemaining)}
                </div>
              </div>
            )}

            {settings.autoAdvance > 0 && (
              <div style={{ marginBottom: '15px' }}>
                <div style={{ fontSize: '12px', color: '#888', marginBottom: '5px' }}>Tự động chuyển câu</div>
                <div style={{
                  padding: '8px',
                  fontSize: '13px',
                  border: '1px solid #ccc',
                  borderRadius: '6px',
                  background: '#f5f5f5',
                  textAlign: 'center'
                }}>
                  {settings.autoAdvance}s
                </div>
              </div>
            )}

            <label style={{ display: 'flex', alignItems: 'center', marginBottom: '15px', cursor: 'pointer' }}>
              <input
                type="checkbox"
                checked={soundEnabled}
                onChange={(e) => setSoundEnabled(e.target.checked)}
                style={{ marginRight: '10px', width: '16px', height: '16px' }}
              />
              <span style={{ fontSize: '13px' }}>Bật âm thanh chọn đáp án</span>
            </label>

            <button
              onClick={() => {
                if (window.confirm('Bạn có chắc muốn thoát? Dữ liệu sẽ không được lưu!')) {
                  navigate('/quiz');
                }
              }}
              style={{
                width: '100%',
                padding: '10px',
                background: '#fff',
                color: '#e84c61',
                border: '1px solid #e84c61',
                borderRadius: '6px',
                fontSize: '14px',
                cursor: 'pointer',
                marginBottom: '10px'
              }}
            >
              ← Trở về
            </button>
          </div>

          <div style={{
            background: '#fff',
            borderRadius: '8px',
            padding: '20px',
            boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
            marginBottom: '20px'
          }}>
            <h3 style={{ fontSize: '14px', fontWeight: 'bold', marginBottom: '12px', color: '#133a5c' }}>
              Danh sách phần thi
            </h3>

            {quiz.sections.map((section, index) => (
              <div
                key={index}
                style={{
                  padding: '10px',
                  background: '#f5f9fc',
                  borderRadius: '6px',
                  marginBottom: '8px',
                  fontSize: '13px',
                  color: '#133a5c'
                }}
              >
                <div style={{ fontWeight: 'bold' }}>{section.name}</div>
              </div>
            ))}

            <div style={{
              marginTop: '15px',
              padding: '10px',
              background: '#f0fff4',
              borderRadius: '6px',
              fontSize: '13px',
              color: '#0d7a4f',
              textAlign: 'center',
              fontWeight: 'bold'
            }}>
              Tiến độ: {getAnsweredCount()}/{questions.length}
            </div>
          </div>

          <button
            onClick={handleEndQuiz}
            style={{
              width: '100%',
              padding: '14px',
              background: '#e84c61',
              color: '#fff',
              border: 'none',
              borderRadius: '8px',
              fontSize: '15px',
              fontWeight: 'bold',
              cursor: 'pointer',
              boxShadow: '0 4px 12px rgba(232,76,97,0.3)'
            }}
          >
            🏁 Kết thúc bài thi
          </button>
        </div>

        {/* GIỮA */}
        <div style={{ flex: 1 }}>
          <div style={{
            background: '#fff',
            borderRadius: '8px',
            padding: '30px',
            boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
            minHeight: '500px'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h2 style={{ color: '#133a5c', fontSize: '20px', fontWeight: 'bold' }}>
                Câu {currentQuestionIndex + 1}
              </h2>
              <span style={{
                padding: '6px 14px',
                background: currentQ.question.type === 'single' ? '#e7f5ff' : '#fff3cd',
                color: currentQ.question.type === 'single' ? '#4ba3d6' : '#856404',
                borderRadius: '16px',
                fontSize: '13px',
                fontWeight: 'bold'
              }}>
                {currentQ.question.type === 'single' ? 'Một đáp án' : 'Nhiều đáp án'}
              </span>
            </div>

            <div style={{
              padding: '20px',
              background: '#f5f9fc',
              borderRadius: '8px',
              marginBottom: '25px',
              fontSize: '16px',
              lineHeight: '1.6',
              color: '#133a5c',
              whiteSpace: 'pre-wrap'
            }}>
              {currentQ.question.content}
            </div>

            <div style={{ marginBottom: '30px' }}>
              {currentQ.question.answers.map((answer, index) => {
                const isSelected = currentAnswers.includes(answer._id);
                const label = String.fromCharCode(65 + index);

                return (
                  <div
                    key={answer._id}
                    onClick={() => handleAnswerSelect(answer._id)}
                    style={{
                      padding: '15px',
                      marginBottom: '12px',
                      background: isSelected ? '#e7f5ff' : '#fff',
                      border: isSelected ? '2px solid #4ba3d6' : '2px solid #e0e0e0',
                      borderRadius: '8px',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'flex-start',
                      gap: '12px',
                      transition: 'all 0.3s'
                    }}
                    onMouseOver={(e) => {
                      if (!isSelected) {
                        e.currentTarget.style.background = '#f5f9fc';
                        e.currentTarget.style.borderColor = '#4ba3d6';
                      }
                    }}
                    onMouseOut={(e) => {
                      if (!isSelected) {
                        e.currentTarget.style.background = '#fff';
                        e.currentTarget.style.borderColor = '#e0e0e0';
                      }
                    }}
                  >
                    {currentQ.question.type === 'single' ? (
                      <input
                        type="radio"
                        checked={isSelected}
                        readOnly
                        style={{ width: '20px', height: '20px', marginTop: '2px', cursor: 'pointer' }}
                      />
                    ) : (
                      <input
                        type="checkbox"
                        checked={isSelected}
                        readOnly
                        style={{ width: '20px', height: '20px', marginTop: '2px', cursor: 'pointer' }}
                      />
                    )}
                    <div style={{ flex: 1 }}>
                      <span style={{ fontWeight: 'bold', color: '#4ba3d6', marginRight: '8px' }}>
                        {label}.
                      </span>
                      <span style={{ color: '#133a5c', fontSize: '15px' }}>
                        {answer.content}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <button
                onClick={handlePreviousQuestion}
                disabled={currentQuestionIndex === 0}
                style={{
                  padding: '12px 30px',
                  background: currentQuestionIndex === 0 ? '#ccc' : '#4ba3d6',
                  color: '#fff',
                  border: 'none',
                  borderRadius: '6px',
                  fontSize: '14px',
                  fontWeight: 'bold',
                  cursor: currentQuestionIndex === 0 ? 'not-allowed' : 'pointer'
                }}
              >
                ⬅️ Trước
              </button>

              <button
                onClick={handleNextQuestion}
                disabled={currentQuestionIndex === questions.length - 1}
                style={{
                  padding: '12px 30px',
                  background: currentQuestionIndex === questions.length - 1 ? '#ccc' : '#4ba3d6',
                  color: '#fff',
                  border: 'none',
                  borderRadius: '6px',
                  fontSize: '14px',
                  fontWeight: 'bold',
                  cursor: currentQuestionIndex === questions.length - 1 ? 'not-allowed' : 'pointer'
                }}
              >
                Sau ➡️
              </button>
            </div>
          </div>
        </div>

        {/* BÊN PHẢI */}
        <div style={{ width: '280px', flexShrink: 0 }}>
          <div style={{
            background: '#fff',
            borderRadius: '8px',
            padding: '20px',
            boxShadow: '0 2px 8px rgba(0,0,0,0.06)'
          }}>
            <h3 style={{ fontSize: '16px', fontWeight: 'bold', marginBottom: '15px', color: '#133a5c' }}>
              Mục lục câu hỏi
            </h3>

            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(6, 1fr)',
              gap: '8px'
            }}>
              {questions.map((_, index) => {
                const isAnswered = userAnswers[questions[index].question._id]?.length > 0;
                const isCurrent = index === currentQuestionIndex;

                return (
                  <button
                    key={index}
                    onClick={() => handleJumpToQuestion(index)}
                    style={{
                      padding: '10px',
                      background: isCurrent ? '#4ba3d6' : (isAnswered ? '#0d7a4f' : '#f5f5f5'),
                      color: isCurrent || isAnswered ? '#fff' : '#666',
                      border: 'none',
                      borderRadius: '6px',
                      fontSize: '13px',
                      fontWeight: 'bold',
                      cursor: 'pointer',
                      transition: 'all 0.3s'
                    }}
                  >
                    {index + 1}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Modal xác nhận */}
      {showEndModal && (
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
            maxWidth: '400px',
            width: '90%',
            boxShadow: '0 8px 32px rgba(0,0,0,0.3)',
            textAlign: 'center'
          }}>
            <h2 style={{ color: '#133a5c', fontSize: '22px', fontWeight: 'bold', marginBottom: '15px' }}>
              ⚠️ Xác nhận kết thúc
            </h2>
            <p style={{ color: '#666', fontSize: '15px', marginBottom: '25px' }}>
              Bạn có chắc chắn muốn kết thúc bài thi không?<br/>
              Bài thi sẽ được nộp và bạn không thể chỉnh sửa lại.
            </p>

            <div style={{ fontSize: '14px', color: '#888', marginBottom: '25px' }}>
              Đã trả lời: <strong style={{ color: '#0d7a4f' }}>{getAnsweredCount()}/{questions.length}</strong> câu
            </div>

            <div style={{ display: 'flex', gap: '15px', justifyContent: 'center' }}>
              <button
                onClick={() => setShowEndModal(false)}
                style={{
                  padding: '12px 30px',
                  background: '#fff',
                  color: '#666',
                  border: '1px solid #ccc',
                  borderRadius: '6px',
                  fontSize: '14px',
                  cursor: 'pointer'
                }}
              >
                ❌ Không
              </button>
              <button
                onClick={handleSubmitQuiz}
                style={{
                  padding: '12px 30px',
                  background: '#e84c61',
                  color: '#fff',
                  border: 'none',
                  borderRadius: '6px',
                  fontSize: '14px',
                  fontWeight: 'bold',
                  cursor: 'pointer'
                }}
              >
                ✅ Có, nộp bài
              </button>
            </div>
          </div>
        </div>
      )}
      <Footer />
    </div>
  );
}
