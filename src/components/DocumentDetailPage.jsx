import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Header from './Header';

// Mock comments data
const mockComments = [
  {
    id: 1,
    userId: 'user1',
    username: 'Nguyễn Văn A',
    avatar: null,
    content: 'Tài liệu rất hữu ích, cảm ơn tác giả đã chia sẻ!',
    timestamp: '2 giờ trước',
    replies: [
      {
        id: 11,
        userId: 'user2',
        username: 'Trần Thị B',
        avatar: null,
        content: 'Mình cũng thấy hay, đặc biệt là phần giải thích chi tiết',
        timestamp: '1 giờ trước'
      }
    ]
  },
  {
    id: 2,
    userId: 'user3',
    username: 'Lê Văn C',
    avatar: null,
    content: 'Có thể cho xin thêm tài liệu tham khảo được không ạ?',
    timestamp: '5 giờ trước',
    replies: []
  }
];

const mockDocumentDetails = {
  id: 1,
  title: 'Giáo trình Toán cao cấp A1',
  description: 'Giáo trình Toán cao cấp A1 được biên soạn cho sinh viên năm thứ nhất các trường đại học kỹ thuật.',
  pages: 245,
  fileSize: '12.5 MB',
  uploadDate: '15/10/2024',
  uploadedBy: 'Nguyễn Văn A',
  grade: 'Đại học',
  subject: 'Toán',
  downloads: 1234,
  views: 5678,
  rating: 4.5,
  totalRatings: 89,
  tags: ['Toán cao cấp', 'Vi phân', 'Tích phân']
};

export default function DocumentDetailPage() {
  const { id } = useParams();
  console.log('Document ID:', id);
  const navigate = useNavigate();
  const [isSaved, setIsSaved] = useState(false);
  const [userRating, setUserRating] = useState(0);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [currentUser, setCurrentUser] = useState('');
  
  // Comment states
  const [comments, setComments] = useState(mockComments);
  const [newComment, setNewComment] = useState('');
  const [replyingTo, setReplyingTo] = useState(null);
  const [replyContent, setReplyContent] = useState('');

  useEffect(() => {
    const loggedIn = localStorage.getItem('isLoggedIn') === 'true';
    const username = localStorage.getItem('username') || '';
    setIsLoggedIn(loggedIn);
    setCurrentUser(username);
  }, []);

  const document = mockDocumentDetails;

  const handleSave = () => {
    if (!isLoggedIn) {
      alert('Vui lòng đăng nhập để lưu tài liệu!');
      navigate('/login');
      return;
    }
    setIsSaved(!isSaved);
    alert(isSaved ? 'Đã bỏ lưu tài liệu' : 'Đã lưu tài liệu');
  };

  const handleDownload = () => {
    if (!isLoggedIn) {
      alert('Vui lòng đăng nhập để tải tài liệu!');
      navigate('/login');
      return;
    }
    alert('Downloading file...');
  };

  const handleRate = (rating) => {
    if (!isLoggedIn) {
      alert('Vui lòng đăng nhập để đánh giá!');
      navigate('/login');
      return;
    }
    setUserRating(rating);
    alert(`Bạn đã đánh giá ${rating} sao`);
  };

  // Comment handlers
  const handlePostComment = () => {
    if (!isLoggedIn) {
      alert('Vui lòng đăng nhập để bình luận!');
      navigate('/login');
      return;
    }
    
    if (!newComment.trim()) {
      alert('Vui lòng nhập nội dung bình luận!');
      return;
    }

    const comment = {
      id: Date.now(),
      userId: 'currentUser',
      username: currentUser,
      avatar: null,
      content: newComment,
      timestamp: 'Vừa xong',
      replies: []
    };

    setComments([comment, ...comments]);
    setNewComment('');
    alert('Đã đăng bình luận!');
  };

  const handleReply = (commentId) => {
    if (!isLoggedIn) {
      alert('Vui lòng đăng nhập để trả lời!');
      navigate('/login');
      return;
    }

    if (!replyContent.trim()) {
      alert('Vui lòng nhập nội dung trả lời!');
      return;
    }

    const reply = {
      id: Date.now(),
      userId: 'currentUser',
      username: currentUser,
      avatar: null,
      content: replyContent,
      timestamp: 'Vừa xong'
    };

    setComments(comments.map(comment => {
      if (comment.id === commentId) {
        return {
          ...comment,
          replies: [...comment.replies, reply]
        };
      }
      return comment;
    }));

    setReplyContent('');
    setReplyingTo(null);
    alert('Đã trả lời bình luận!');
  };

  const handleReport = (commentId, username) => {
    if (!isLoggedIn) {
      alert('Vui lòng đăng nhập!');
      navigate('/login');
      return;
    }
    
    if (window.confirm(`Bạn có chắc muốn báo cáo bình luận của ${username}?`)) {
      alert('Đã gửi báo cáo. Chúng tôi sẽ xem xét!');
    }
  };

  const handleDeleteComment = (commentId) => {
    if (window.confirm('Bạn có chắc muốn xóa bình luận này?')) {
      setComments(comments.filter(c => c.id !== commentId));
      alert('Đã xóa bình luận!');
    }
  };

  return (
    <div style={{ minHeight: '100vh', background: '#fffffe', fontFamily: 'Arial, sans-serif' }}>
      <Header />
      <div style={{ height: '130px' }}></div>
      
      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '20px' }}>
        {/* Breadcrumb */}
        <div style={{ fontSize: '13px', color: '#888', marginBottom: '20px' }}>
          <span onClick={() => navigate('/')} style={{ cursor: 'pointer', color: '#4ba3d6' }}>
            Trang chủ
          </span>
          {' > '}
          <span onClick={() => navigate(-1)} style={{ cursor: 'pointer', color: '#4ba3d6' }}>
            {document.grade}
          </span>
          {' > '}
          <span>{document.title}</span>
        </div>

        <div style={{ display: 'flex', gap: '30px' }}>
          {/* Left column */}
          <div style={{ flex: '2' }}>
            {/* Document preview */}
            <div style={{
              background: '#f5f5f5',
              borderRadius: '8px',
              padding: '40px',
              textAlign: 'center',
              marginBottom: '20px',
              minHeight: '500px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexDirection: 'column',
              border: '1px solid #ddd'
            }}>
              <div style={{ fontSize: '80px', marginBottom: '20px' }}>📄</div>
              <div style={{ fontSize: '16px', color: '#666', marginBottom: '20px' }}>
                Preview tài liệu
              </div>
              <button onClick={handleDownload} style={{
                padding: '12px 30px',
                background: '#0d7a4f',
                color: '#fff',
                border: 'none',
                borderRadius: '6px',
                fontSize: '15px',
                fontWeight: 'bold',
                cursor: 'pointer'
              }}>
                📥 Tải xuống ({document.fileSize})
              </button>
            </div>

            {/* Description */}
            <div style={{
              background: '#fff',
              borderRadius: '8px',
              padding: '20px',
              boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
              marginBottom: '30px'
            }}>
              <h3 style={{ color: '#133a5c', marginBottom: '15px' }}>Mô tả</h3>
              <p style={{ color: '#2d4a67', lineHeight: '1.6', fontSize: '14px' }}>
                {document.description}
              </p>
            </div>

            {/* COMMENT SECTION */}
            <div style={{
              background: '#fff',
              borderRadius: '8px',
              padding: '25px',
              boxShadow: '0 2px 8px rgba(0,0,0,0.06)'
            }}>
              <h3 style={{ color: '#133a5c', marginBottom: '20px' }}>
                💬 Bình luận ({comments.length})
              </h3>

              {/* New Comment Form */}
              <div style={{ marginBottom: '30px' }}>
                <textarea
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  placeholder={isLoggedIn ? "Viết bình luận của bạn..." : "Đăng nhập để bình luận"}
                  disabled={!isLoggedIn}
                  rows="3"
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
                <button
                  onClick={handlePostComment}
                  disabled={!isLoggedIn}
                  style={{
                    marginTop: '10px',
                    padding: '10px 24px',
                    background: isLoggedIn ? '#4ba3d6' : '#ccc',
                    color: '#fff',
                    border: 'none',
                    borderRadius: '6px',
                    fontSize: '14px',
                    fontWeight: 'bold',
                    cursor: isLoggedIn ? 'pointer' : 'not-allowed'
                  }}
                >
                  Đăng bình luận
                </button>
              </div>

              {/* Comments List */}
              <div>
                {comments.map(comment => (
                  <div key={comment.id} style={{
                    borderBottom: '1px solid #eee',
                    paddingBottom: '20px',
                    marginBottom: '20px'
                  }}>
                    {/* Comment Header */}
                    <div style={{ display: 'flex', alignItems: 'center', marginBottom: '10px' }}>
                      <div style={{
                        width: '40px',
                        height: '40px',
                        borderRadius: '50%',
                        background: '#4ba3d6',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: '#fff',
                        fontWeight: 'bold',
                        marginRight: '12px'
                      }}>
                        {comment.username.charAt(0).toUpperCase()}
                      </div>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontWeight: 'bold', color: '#133a5c', fontSize: '14px' }}>
                          {comment.username}
                        </div>
                        <div style={{ fontSize: '12px', color: '#888' }}>
                          {comment.timestamp}
                        </div>
                      </div>
                    </div>

                    {/* Comment Content */}
                    <div style={{
                      marginLeft: '52px',
                      color: '#2d4a67',
                      fontSize: '14px',
                      lineHeight: '1.6',
                      marginBottom: '10px'
                    }}>
                      {comment.content}
                    </div>

                    {/* Comment Actions */}
                    <div style={{
                      marginLeft: '52px',
                      display: 'flex',
                      gap: '15px',
                      fontSize: '13px'
                    }}>
                      <button
                        onClick={() => setReplyingTo(comment.id)}
                        style={{
                          background: 'none',
                          border: 'none',
                          color: '#4ba3d6',
                          cursor: 'pointer',
                          fontSize: '13px'
                        }}
                      >
                        💬 Trả lời
                      </button>
                      <button
                        onClick={() => handleReport(comment.id, comment.username)}
                        style={{
                          background: 'none',
                          border: 'none',
                          color: '#e84c61',
                          cursor: 'pointer',
                          fontSize: '13px'
                        }}
                      >
                        🚩 Báo cáo
                      </button>
                      {comment.username === currentUser && (
                        <button
                          onClick={() => handleDeleteComment(comment.id)}
                          style={{
                            background: 'none',
                            border: 'none',
                            color: '#888',
                            cursor: 'pointer',
                            fontSize: '13px'
                          }}
                        >
                          🗑️ Xóa
                        </button>
                      )}
                    </div>

                    {/* Reply Form */}
                    {replyingTo === comment.id && (
                      <div style={{
                        marginLeft: '52px',
                        marginTop: '15px',
                        padding: '15px',
                        background: '#f5f9fc',
                        borderRadius: '6px'
                      }}>
                        <textarea
                          value={replyContent}
                          onChange={(e) => setReplyContent(e.target.value)}
                          placeholder="Viết trả lời..."
                          rows="2"
                          style={{
                            width: '100%',
                            padding: '10px',
                            fontSize: '13px',
                            border: '1px solid #ccc',
                            borderRadius: '4px',
                            outline: 'none',
                            resize: 'vertical',
                            fontFamily: 'Arial, sans-serif',
                            boxSizing: 'border-box',
                            marginBottom: '10px'
                          }}
                        />
                        <div style={{ display: 'flex', gap: '10px' }}>
                          <button
                            onClick={() => handleReply(comment.id)}
                            style={{
                              padding: '8px 16px',
                              background: '#4ba3d6',
                              color: '#fff',
                              border: 'none',
                              borderRadius: '4px',
                              fontSize: '13px',
                              cursor: 'pointer'
                            }}
                          >
                            Gửi
                          </button>
                          <button
                            onClick={() => {
                              setReplyingTo(null);
                              setReplyContent('');
                            }}
                            style={{
                              padding: '8px 16px',
                              background: '#fff',
                              color: '#666',
                              border: '1px solid #ccc',
                              borderRadius: '4px',
                              fontSize: '13px',
                              cursor: 'pointer'
                            }}
                          >
                            Hủy
                          </button>
                        </div>
                      </div>
                    )}

                    {/* Replies */}
                    {comment.replies.length > 0 && (
                      <div style={{ marginLeft: '52px', marginTop: '15px' }}>
                        {comment.replies.map(reply => (
                          <div key={reply.id} style={{
                            background: '#f5f9fc',
                            padding: '15px',
                            borderRadius: '6px',
                            marginBottom: '10px'
                          }}>
                            <div style={{ display: 'flex', alignItems: 'center', marginBottom: '8px' }}>
                              <div style={{
                                width: '32px',
                                height: '32px',
                                borderRadius: '50%',
                                background: '#0d7a4f',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                color: '#fff',
                                fontWeight: 'bold',
                                fontSize: '13px',
                                marginRight: '10px'
                              }}>
                                {reply.username.charAt(0).toUpperCase()}
                              </div>
                              <div>
                                <div style={{ fontWeight: 'bold', color: '#133a5c', fontSize: '13px' }}>
                                  {reply.username}
                                </div>
                                <div style={{ fontSize: '11px', color: '#888' }}>
                                  {reply.timestamp}
                                </div>
                              </div>
                            </div>
                            <div style={{
                              marginLeft: '42px',
                              color: '#2d4a67',
                              fontSize: '13px',
                              lineHeight: '1.5'
                            }}>
                              {reply.content}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right column - Document info (giữ nguyên) */}
          <div style={{ flex: '1' }}>
            <div style={{
              background: '#fff',
              borderRadius: '8px',
              padding: '25px',
              boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
              position: 'sticky',
              top: '150px'
            }}>
              {/* Document info code... (giữ nguyên như cũ) */}
              <h2 style={{ color: '#133a5c', fontSize: '22px', marginBottom: '15px' }}>
                {document.title}
              </h2>
              
              <div style={{ display: 'flex', gap: '20px', marginBottom: '20px', paddingBottom: '20px', borderBottom: '1px solid #eee' }}>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: '20px', fontWeight: 'bold', color: '#133a5c' }}>{document.downloads}</div>
                  <div style={{ fontSize: '12px', color: '#888' }}>Lượt tải</div>
                </div>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: '20px', fontWeight: 'bold', color: '#133a5c' }}>{document.views}</div>
                  <div style={{ fontSize: '12px', color: '#888' }}>Lượt xem</div>
                </div>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: '20px', fontWeight: 'bold', color: '#133a5c' }}>{document.pages}</div>
                  <div style={{ fontSize: '12px', color: '#888' }}>Trang</div>
                </div>
              </div>

              <InfoRow label="Người đăng" value={document.uploadedBy} />
              <InfoRow label="Ngày đăng" value={document.uploadDate} />
              <InfoRow label="Cấp học" value={document.grade} />
              <InfoRow label="Môn học" value={document.subject} />
              <InfoRow label="Kích thước" value={document.fileSize} />

              <div style={{ marginBottom: '20px', paddingBottom: '20px', borderBottom: '1px solid #eee' }}>
                <div style={{ fontSize: '14px', color: '#133a5c', marginBottom: '10px', fontWeight: 'bold' }}>
                  Đánh giá
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px' }}>
                  <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#133a5c' }}>
                    {document.rating}
                  </div>
                  <div>{'⭐'.repeat(Math.floor(document.rating))}</div>
                  <div style={{ fontSize: '12px', color: '#888' }}>
                    ({document.totalRatings} đánh giá)
                  </div>
                </div>
                <div style={{ fontSize: '13px', color: '#666', marginBottom: '8px' }}>
                  Đánh giá của bạn:
                </div>
                <div style={{ display: 'flex', gap: '5px' }}>
                  {[1, 2, 3, 4, 5].map(star => (
                    <span
                      key={star}
                      onClick={() => handleRate(star)}
                      style={{
                        fontSize: '24px',
                        cursor: 'pointer',
                        color: star <= userRating ? '#ffd700' : '#ddd'
                      }}
                    >
                      ⭐
                    </span>
                  ))}
                </div>
              </div>

              <div style={{ marginBottom: '20px' }}>
                <div style={{ fontSize: '14px', color: '#133a5c', marginBottom: '10px', fontWeight: 'bold' }}>
                  Tags
                </div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                  {document.tags.map(tag => (
                    <span key={tag} style={{
                      background: '#e8f4f8',
                      color: '#133a5c',
                      padding: '5px 12px',
                      borderRadius: '15px',
                      fontSize: '12px',
                      cursor: 'pointer'
                    }}>
                      {tag}
                    </span>
                  ))}
                </div>
              </div>

              <button onClick={handleSave} style={{
                width: '100%',
                padding: '12px',
                background: isSaved ? '#e8f4f8' : '#fff',
                color: isSaved ? '#133a5c' : '#2d4a67',
                border: '1px solid #4ba3d6',
                borderRadius: '6px',
                fontSize: '14px',
                fontWeight: 'bold',
                cursor: 'pointer',
                marginBottom: '10px'
              }}>
                {isSaved ? '✓ Đã lưu' : '🔖 Lưu tài liệu'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function InfoRow({ label, value }) {
  return (
    <div style={{
      display: 'flex',
      justifyContent: 'space-between',
      marginBottom: '12px',
      fontSize: '14px'
    }}>
      <span style={{ color: '#888' }}>{label}:</span>
      <span style={{ color: '#133a5c', fontWeight: '500' }}>{value}</span>
    </div>
  );
}
