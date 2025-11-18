import React, { useState, useRef, useEffect } from 'react';
import Groq from 'groq-sdk';

const Chatbot = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    { role: 'assistant', content: 'Xin chào! Tôi là trợ lý ảo EDUCONNECT. Tôi có thể giúp bạn tìm kiếm tài liệu, trả lời câu hỏi học tập, tra cứu thông tin. Bạn cần giúp gì?' }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);

  // ✅ Thay API_KEY của bạn vào đây
  const API_KEY = import.meta.env.VITE_GROQ_API_KEY;
  const groq = new Groq({ 
    apiKey: API_KEY,
    dangerouslyAllowBrowser: true // Cho phép gọi từ browser
  });

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMessage = { role: 'user', content: input };
    setMessages(prev => [...prev, userMessage]);
    const userInput = input;
    setInput('');
    setLoading(true);

    try {
      // Tạo context cho AI
      const systemPrompt = `Bạn là trợ lý ảo của EDUCONNECT - nền tảng chia sẻ tài liệu học tập Việt Nam.

NHIỆM VỤ:
- Giúp học sinh, sinh viên tìm kiếm tài liệu học tập
- Trả lời câu hỏi về các môn học từ Lớp 1 đến Đại học
- Hướng dẫn sử dụng website EDUCONNECT
- Tra cứu thông tin, giải thích kiến thức
- Giải bài tập, hướng dẫn học tập

YÊU CẦU:
- Trả lời bằng tiếng Việt
- Ngắn gọn, dễ hiểu, thân thiện
- Nếu không biết, hãy thừa nhận và đề xuất cách tìm hiểu
- Ưu tiên kiến thức phổ thông Việt Nam`;

                const chatCompletion = await groq.chat.completions.create({
            messages: [
                { role: 'system', content: systemPrompt },
                { role: 'user', content: userInput }
            ],
            model: 'llama-3.3-70b-versatile', // ✅ Model mới
            temperature: 0.7,
            max_tokens: 1024,
            });


      const text = chatCompletion.choices[0]?.message?.content || 'Xin lỗi, tôi không thể trả lời.';
      
      const assistantMessage = { role: 'assistant', content: text };
      setMessages(prev => [...prev, assistantMessage]);
    } catch (error) {
      console.error('❌ Groq API Error:', error);
      
      let errorMsg = 'Xin lỗi, tôi gặp sự cố. ';
      
      if (error.message?.includes('API key')) {
        errorMsg += 'API key không hợp lệ.';
      } else if (error.message?.includes('rate limit')) {
        errorMsg += 'Quá nhiều request. Vui lòng đợi 1 phút.';
      } else {
        errorMsg += 'Vui lòng thử lại.';
      }
      
      const errorMessage = { role: 'assistant', content: errorMsg };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <>
      {/* Floating Button */}
      {!isOpen && (
        <div
          onClick={() => setIsOpen(true)}
          style={{
            position: 'fixed',
            bottom: '30px',
            right: '30px',
            width: '60px',
            height: '60px',
            borderRadius: '50%',
            background: 'linear-gradient(135deg, #4ba3d6 0%, #0d7a4f 100%)',
            color: '#fff',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '28px',
            cursor: 'pointer',
            boxShadow: '0 4px 20px rgba(0,0,0,0.25)',
            zIndex: 9999,
            transition: 'transform 0.2s',
          }}
          onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.1)'}
          onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
        >
          💬
        </div>
      )}

      {/* Chatbot Window */}
      {isOpen && (
        <div style={{
          position: 'fixed',
          bottom: '30px',
          right: '30px',
          width: '400px',
          height: '600px',
          background: '#fff',
          borderRadius: '16px',
          boxShadow: '0 8px 40px rgba(0,0,0,0.2)',
          zIndex: 9999,
          display: 'flex',
          flexDirection: 'column',
          fontFamily: 'Arial, sans-serif'
        }}>
          {/* Header */}
          <div style={{
            background: 'linear-gradient(135deg, #4ba3d6 0%, #0d7a4f 100%)',
            color: '#fff',
            padding: '20px',
            borderRadius: '16px 16px 0 0',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center'
          }}>
            <div>
              <div style={{ fontSize: '18px', fontWeight: 'bold' }}>🤖 EDUCONNECT AI</div>
              <div style={{ fontSize: '12px', opacity: 0.9 }}>Powered by Groq</div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              style={{
                background: 'rgba(255,255,255,0.2)',
                border: 'none',
                color: '#fff',
                fontSize: '24px',
                cursor: 'pointer',
                width: '35px',
                height: '35px',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              ×
            </button>
          </div>

          {/* Messages */}
          <div style={{
            flex: 1,
            overflowY: 'auto',
            padding: '20px',
            background: '#f5f5f5'
          }}>
            {messages.map((msg, idx) => (
              <div
                key={idx}
                style={{
                  marginBottom: '15px',
                  display: 'flex',
                  justifyContent: msg.role === 'user' ? 'flex-end' : 'flex-start'
                }}
              >
                <div style={{
                  maxWidth: '80%',
                  padding: '12px 16px',
                  borderRadius: msg.role === 'user' ? '18px 18px 4px 18px' : '18px 18px 18px 4px',
                  background: msg.role === 'user' ? '#4ba3d6' : '#fff',
                  color: msg.role === 'user' ? '#fff' : '#333',
                  fontSize: '14px',
                  lineHeight: '1.6',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
                  whiteSpace: 'pre-wrap',
                  wordBreak: 'break-word'
                }}>
                  {msg.content}
                </div>
              </div>
            ))}
            {loading && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#888', marginLeft: '10px' }}>
                <div className="typing-indicator">
                  <span>●</span><span>●</span><span>●</span>
                </div>
                <span style={{ fontSize: '13px' }}>Đang suy nghĩ...</span>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div style={{
            padding: '15px',
            borderTop: '1px solid #eee',
            background: '#fff',
            borderRadius: '0 0 16px 16px'
          }}>
            <div style={{ display: 'flex', gap: '10px' }}>
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Nhập câu hỏi của bạn..."
                disabled={loading}
                style={{
                  flex: 1,
                  padding: '12px 15px',
                  border: '1px solid #ddd',
                  borderRadius: '25px',
                  outline: 'none',
                  fontSize: '14px',
                  fontFamily: 'Arial, sans-serif'
                }}
              />
              <button
                onClick={handleSend}
                disabled={loading || !input.trim()}
                style={{
                  padding: '12px 20px',
                  background: loading || !input.trim() ? '#ccc' : '#4ba3d6',
                  color: '#fff',
                  border: 'none',
                  borderRadius: '25px',
                  cursor: loading || !input.trim() ? 'not-allowed' : 'pointer',
                  fontSize: '16px',
                  fontWeight: 'bold'
                }}
              >
                ➤
              </button>
            </div>
          </div>
        </div>
      )}

      {/* CSS for typing indicator */}
      <style>{`
        .typing-indicator span {
          display: inline-block;
          animation: blink 1.4s infinite;
          font-size: 20px;
          margin: 0 2px;
        }
        .typing-indicator span:nth-child(2) {
          animation-delay: 0.2s;
        }
        .typing-indicator span:nth-child(3) {
          animation-delay: 0.4s;
        }
        @keyframes blink {
          0%, 60%, 100% { opacity: 0.3; }
          30% { opacity: 1; }
        }
      `}</style>
    </>
  );
};

export default Chatbot;
