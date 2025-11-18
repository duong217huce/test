import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Header from './Header';

export default function DocumentDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [document, setDocument] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isSaved, setIsSaved] = useState(false);
  const [userRating, setUserRating] = useState(0);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [currentUserId, setCurrentUserId] = useState('');
  
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [replyingTo, setReplyingTo] = useState(null);
  const [replyContent, setReplyContent] = useState('');
  const [editingComment, setEditingComment] = useState(null);
  const [editContent, setEditContent] = useState('');

  useEffect(() => {
    const loggedIn = localStorage.getItem('isLoggedIn') === 'true';
    const userId = localStorage.getItem('userId') || '';
    
    setIsLoggedIn(loggedIn);
    setCurrentUserId(userId);
    
    console.log('👤 User info:', { userId, loggedIn });
  }, []);

  useEffect(() => {
    fetchDocument();
    fetchComments();
  }, [id]);

  const fetchDocument = async () => {
    setLoading(true);
    try {
      const res = await fetch(`http://localhost:5000/api/documents/${id}`);
      const data = await res.json();
      console.log('📄 Document loaded:', data);
      setDocument(data);
    } catch (err) {
      console.error('❌ Error fetching document:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchComments = async () => {
    try {
      const res = await fetch(`http://localhost:5000/api/comments/${id}`);
      const data = await res.json();
      console.log('💬 Comments loaded:', data);
      setComments(data);
    } catch (err) {
      console.error('❌ Error fetching comments:', err);
    }
  };

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
    
    let downloadUrl = document.fileUrl;
    if (!downloadUrl.startsWith('http')) {
      downloadUrl = `http://localhost:5000${downloadUrl}`;
    }
    
    window.open(downloadUrl, '_blank');
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

  const handlePostComment = async () => {
    if (!isLoggedIn) {
      alert('Vui lòng đăng nhập để bình luận!');
      navigate('/login');
      return;
    }
    
    if (!newComment.trim()) {
      alert('Vui lòng nhập nội dung bình luận!');
      return;
    }

    try {
      const token = localStorage.getItem('token');
      console.log('📤 Posting comment...', { documentId: id, content: newComment });
      
      const res = await fetch('http://localhost:5000/api/comments', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          documentId: id,
          content: newComment
        })
      });

      if (res.ok) {
        console.log('✅ Comment posted');
        setNewComment('');
        fetchComments();
      } else {
        const error = await res.json();
        console.error('❌ Error response:', error);
        alert('Không thể đăng bình luận: ' + (error.message || 'Lỗi server'));
      }
    } catch (err) {
      console.error('❌ Error posting comment:', err);
      alert('Lỗi khi đăng bình luận');
    }
  };

  const handlePostReply = async (parentCommentId) => {
    if (!isLoggedIn) {
      alert('Vui lòng đăng nhập để trả lời!');
      navigate('/login');
      return;
    }

    if (!replyContent.trim()) {
      alert('Vui lòng nhập nội dung!');
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const res = await fetch('http://localhost:5000/api/comments', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          documentId: id,
          content: replyContent,
          parentCommentId: parentCommentId
        })
      });

      if (res.ok) {
        setReplyContent('');
        setReplyingTo(null);
        fetchComments();
      } else {
        alert('Không thể đăng trả lời');
      }
    } catch (err) {
      console.error('❌ Error posting reply:', err);
      alert('Lỗi khi đăng trả lời');
    }
  };

  const handleEditComment = async (commentId) => {
    if (!editContent.trim()) {
      alert('Nội dung không được để trống!');
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`http://localhost:5000/api/comments/${commentId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ content: editContent })
      });

      if (res.ok) {
        setEditingComment(null);
        setEditContent('');
        fetchComments();
      } else {
        alert('Không thể sửa bình luận');
      }
    } catch (err) {
      console.error('❌ Error editing comment:', err);
      alert('Lỗi khi sửa bình luận');
    }
  };

  const handleDeleteComment = async (commentId) => {
    if (!window.confirm('Bạn có chắc muốn xóa bình luận này?')) return;

    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`http://localhost:5000/api/comments/${commentId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (res.ok) {
        fetchComments();
      } else {
        alert('Không thể xóa bình luận');
      }
    } catch (err) {
      console.error('❌ Error deleting comment:', err);
      alert('Lỗi khi xóa bình luận');
    }
  };

  const handleLikeComment = async (commentId) => {
    if (!isLoggedIn) {
      alert('Vui lòng đăng nhập để thích bình luận!');
      navigate('/login');
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`http://localhost:5000/api/comments/${commentId}/like`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (res.ok) {
        fetchComments();
      } else {
        alert('Không thể thích bình luận');
      }
    } catch (err) {
      console.error('❌ Error liking comment:', err);
    }
  };

  const timeAgo = (date) => {
    const seconds = Math.floor((new Date() - new Date(date)) / 1000);
    
    if (seconds < 60) return 'Vừa xong';
    if (seconds < 3600) return `${Math.floor(seconds / 60)} phút trước`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)} giờ trước`;
    if (seconds < 604800) return `${Math.floor(seconds / 86400)} ngày trước`;
    return new Date(date).toLocaleDateString('vi-VN');
  };

  const renderDocumentViewer = () => {
    if (!document.fileUrl) {
      return (
        <div style={{ padding: '60px', textAlign: 'center' }}>
          <div style={{ fontSize: '60px', marginBottom: '15px' }}>📄</div>
          <p style={{ color: '#666' }}>Không tìm thấy file để xem</p>
        </div>
      );
    }

    let fileUrl = document.fileUrl;
    if (!fileUrl.startsWith('http')) {
      fileUrl = `http://localhost:5000${fileUrl}`;
    }

    const fileType = document.fileType || '';

    if (fileType.includes('pdf') || fileUrl.endsWith('.pdf')) {
      return (
        <div>
          <iframe
            src={fileUrl}
            style={{
              width: '100%',
              height: '700px',
              border: '1px solid #ddd',
              borderRadius: '8px'
            }}
            title="PDF Preview"
          />
          <div style={{ textAlign: 'center', marginTop: '15px', fontSize: '13px', color: '#888' }}>
            💡 Tip: Cuộn để xem toàn bộ tài liệu
          </div>
        </div>
      );
    }

    if (fileType.includes('word') || fileType.includes('document') || 
        fileUrl.match(/\.(doc|docx)$/i)) {
      return (
        <div>
          <iframe
            src={`http://localhost:5000/api/documents/${id}/preview`}
            style={{
              width: '100%',
              height: '700px',
              border: '1px solid #ddd',
              borderRadius: '8px',
              background: '#fff'
            }}
            title="Word Preview"
          />
          <div style={{ textAlign: 'center', marginTop: '15px', fontSize: '13px', color: '#888' }}>
            📄 Xem trước file Word
          </div>
        </div>
      );
    }

    return (
      <div style={{ padding: '60px', textAlign: 'center' }}>
        <div style={{ fontSize: '60px', marginBottom: '15px' }}>📄</div>
        <p style={{ color: '#666', marginBottom: '15px' }}>
          Xem trước không khả dụng
        </p>
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
          📥 Tải xuống
        </button>
      </div>
    );
  };

  if (loading) {
    return (
      <div>
        <Header />
        <div style={{ height: 130 }}></div>
        <div style={{ textAlign: 'center', marginTop: 50, color: '#888' }}>
          Đang tải tài liệu...
        </div>
      </div>
    );
  }

  if (!document || document.message) {
    return (
      <div>
        <Header />
        <div style={{ height: 130 }}></div>
        <div style={{ textAlign: 'center', marginTop: 50, color: '#e84c61' }}>
          Không tìm thấy tài liệu!
        </div>
      </div>
    );
  }


    return (
    <div style={{ minHeight: '100vh', background: '#fffffe', fontFamily: 'Arial, sans-serif' }}>
      <Header />
      <div style={{ height: '130px' }}></div>
      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '20px' }}>
        <div style={{ fontSize: '13px', color: '#888', marginBottom: '20px' }}>
          <span onClick={() => navigate('/')} style={{ cursor: 'pointer', color: '#4ba3d6' }}>
            Trang chủ
          </span>
          {' > '}
          <span style={{ color: '#133a5c' }}>{document.category}</span>
          {' > '}
          <span>{document.title}</span>
        </div>

        <div style={{ display: 'flex', gap: '30px' }}>
          <div style={{ flex: '2' }}>
            <div style={{
              background: '#fff',
              borderRadius: '8px',
              padding: '20px',
              marginBottom: '20px',
              boxShadow: '0 2px 8px rgba(0,0,0,0.06)'
            }}>
              <h3 style={{ color: '#133a5c', marginBottom: '15px', textAlign: 'center' }}>
                📖 Xem trước tài liệu
              </h3>
              {renderDocumentViewer()}
            </div>

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

            {/* Comments section */}
            <div style={{
              background: '#fff',
              borderRadius: '8px',
              padding: '25px',
              boxShadow: '0 2px 8px rgba(0,0,0,0.06)'
            }}>
              <h3 style={{ color: '#133a5c', marginBottom: '20px' }}>
                💬 Bình luận ({comments.length})
              </h3>

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

              <div>
                {comments.length > 0 ? (
                  comments.map(comment => (
                    <div key={comment._id} style={{
                      borderBottom: '1px solid #eee',
                      paddingBottom: '20px',
                      marginBottom: '20px'
                    }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '10px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                          <div style={{
                            width: '40px',
                            height: '40px',
                            borderRadius: '50%',
                            background: 'linear-gradient(135deg, #4ba3d6, #0d7a4f)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            color: '#fff',
                            fontWeight: 'bold',
                            fontSize: '16px',
                            flexShrink: 0
                          }}>
                            {(comment.user?.username || 'A')[0].toUpperCase()}
                          </div>
                          
                          <div>
                            <div style={{ fontWeight: 'bold', color: '#133a5c', fontSize: '14px' }}>
                              {comment.user?.fullName || comment.user?.username || 'Ẩn danh'}
                            </div>
                            <div style={{ color: '#888', fontSize: '12px' }}>
                              {timeAgo(comment.createdAt)}
                              {comment.updatedAt !== comment.createdAt && ' (đã chỉnh sửa)'}
                            </div>
                          </div>
                        </div>
                        
                        {isLoggedIn && comment.user?._id === currentUserId && (
                          <div style={{ display: 'flex', gap: '8px' }}>
                            <button
                              onClick={() => {
                                setEditingComment(comment._id);
                                setEditContent(comment.content);
                              }}
                              style={{
                                padding: '4px 10px',
                                background: '#f5f5f5',
                                border: '1px solid #ddd',
                                borderRadius: '4px',
                                fontSize: '12px',
                                cursor: 'pointer',
                                color: '#133a5c'
                              }}
                            >
                              ✏️ Sửa
                            </button>
                            <button
                              onClick={() => handleDeleteComment(comment._id)}
                              style={{
                                padding: '4px 10px',
                                background: '#fff',
                                border: '1px solid #e84c61',
                                borderRadius: '4px',
                                fontSize: '12px',
                                cursor: 'pointer',
                                color: '#e84c61'
                              }}
                            >
                              🗑️ Xóa
                            </button>
                          </div>
                        )}
                      </div>

                      {editingComment === comment._id ? (
                        <div style={{ marginLeft: '50px' }}>
                          <textarea
                            value={editContent}
                            onChange={(e) => setEditContent(e.target.value)}
                            rows="3"
                            style={{
                              width: '100%',
                              padding: '10px',
                              border: '1px solid #4ba3d6',
                              borderRadius: '4px',
                              fontSize: '14px',
                              marginBottom: '8px',
                              boxSizing: 'border-box'
                            }}
                          />
                          <button
                            onClick={() => handleEditComment(comment._id)}
                            style={{
                              padding: '6px 16px',
                              background: '#4ba3d6',
                              color: '#fff',
                              border: 'none',
                              borderRadius: '4px',
                              fontSize: '13px',
                              cursor: 'pointer',
                              marginRight: '8px'
                            }}
                          >
                            Lưu
                          </button>
                          <button
                            onClick={() => {
                              setEditingComment(null);
                              setEditContent('');
                            }}
                            style={{
                              padding: '6px 16px',
                              background: '#f5f5f5',
                              color: '#666',
                              border: '1px solid #ddd',
                              borderRadius: '4px',
                              fontSize: '13px',
                              cursor: 'pointer'
                            }}
                          >
                            Hủy
                          </button>
                        </div>
                      ) : (
                        <div style={{
                          color: '#2d4a67',
                          fontSize: '14px',
                          lineHeight: '1.6',
                          marginBottom: '10px',
                          marginLeft: '50px'
                        }}>
                          {comment.content}
                        </div>
                      )}

                      <div style={{ display: 'flex', gap: '20px', alignItems: 'center', marginLeft: '50px' }}>
                        <button
                          onClick={() => handleLikeComment(comment._id)}
                          style={{
                            background: 'none',
                            border: 'none',
                            cursor: isLoggedIn ? 'pointer' : 'not-allowed',
                            fontSize: '13px',
                            color: comment.likes?.some(like => like._id === currentUserId) ? '#e84c61' : '#888',
                            fontWeight: comment.likes?.some(like => like._id === currentUserId) ? 'bold' : 'normal'
                          }}
                        >
                          ❤️ {comment.likes?.length || 0}
                        </button>
                        
                        <button
                          onClick={() => setReplyingTo(replyingTo === comment._id ? null : comment._id)}
                          style={{
                            background: 'none',
                            border: 'none',
                            cursor: isLoggedIn ? 'pointer' : 'not-allowed',
                            fontSize: '13px',
                            color: '#4ba3d6'
                          }}
                        >
                          💬 Trả lời
                        </button>
                      </div>

                      {replyingTo === comment._id && (
                        <div style={{ marginTop: '15px', marginLeft: '50px', paddingLeft: '20px', borderLeft: '3px solid #4ba3d6' }}>
                          <textarea
                            value={replyContent}
                            onChange={(e) => setReplyContent(e.target.value)}
                            placeholder="Viết trả lời..."
                            rows="2"
                            style={{
                              width: '100%',
                              padding: '10px',
                              border: '1px solid #ccc',
                              borderRadius: '4px',
                              fontSize: '14px',
                              marginBottom: '8px',
                              boxSizing: 'border-box'
                            }}
                          />
                          <button
                            onClick={() => handlePostReply(comment._id)}
                            style={{
                              padding: '6px 16px',
                              background: '#4ba3d6',
                              color: '#fff',
                              border: 'none',
                              borderRadius: '4px',
                              fontSize: '13px',
                              cursor: 'pointer',
                              marginRight: '8px'
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
                              padding: '6px 16px',
                              background: '#f5f5f5',
                              color: '#666',
                              border: '1px solid #ddd',
                              borderRadius: '4px',
                              fontSize: '13px',
                              cursor: 'pointer'
                            }}
                          >
                            Hủy
                          </button>
                        </div>
                      )}

                      {comment.replies && comment.replies.length > 0 && (
                        <div style={{ marginTop: '15px', marginLeft: '50px', paddingLeft: '30px', borderLeft: '2px solid #eee' }}>
                          {comment.replies.map(reply => (
                            <div key={reply._id} style={{ marginBottom: '15px' }}>
                              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                  <div style={{
                                    width: '32px',
                                    height: '32px',
                                    borderRadius: '50%',
                                    background: 'linear-gradient(135deg, #4ba3d6, #0d7a4f)',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    color: '#fff',
                                    fontWeight: 'bold',
                                    fontSize: '13px',
                                    flexShrink: 0
                                  }}>
                                    {(reply.user?.username || 'A')[0].toUpperCase()}
                                  </div>
                                  
                                  <div>
                                    <div style={{ fontWeight: 'bold', color: '#133a5c', fontSize: '13px' }}>
                                      {reply.user?.fullName || reply.user?.username || 'Ẩn danh'}
                                    </div>
                                    <div style={{ color: '#888', fontSize: '11px' }}>
                                      {timeAgo(reply.createdAt)}
                                    </div>
                                  </div>
                                </div>
                                
                                {isLoggedIn && reply.user?._id === currentUserId && (
                                  <button
                                    onClick={() => handleDeleteComment(reply._id)}
                                    style={{
                                      padding: '2px 8px',
                                      background: '#fff',
                                      border: '1px solid #e84c61',
                                      borderRadius: '3px',
                                      fontSize: '11px',
                                      cursor: 'pointer',
                                      color: '#e84c61'
                                    }}
                                  >
                                    Xóa
                                  </button>
                                )}
                              </div>
                              
                              <div style={{ color: '#2d4a67', fontSize: '13px', marginTop: '6px', marginLeft: '40px' }}>
                                {reply.content}
                              </div>
                              
                              <button
                                onClick={() => handleLikeComment(reply._id)}
                                style={{
                                  background: 'none',
                                  border: 'none',
                                  cursor: isLoggedIn ? 'pointer' : 'not-allowed',
                                  fontSize: '12px',
                                  color: reply.likes?.some(like => like._id === currentUserId) ? '#e84c61' : '#888',
                                  marginTop: '6px',
                                  marginLeft: '40px'
                                }}
                              >
                                ❤️ {reply.likes?.length || 0}
                              </button>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  ))
                ) : (
                  <div style={{ textAlign: 'center', padding: '40px', color: '#888' }}>
                    Chưa có bình luận nào. Hãy là người đầu tiên!
                  </div>
                )}
              </div>
            </div>
          </div>

          <div style={{ flex: '1' }}>
            <div style={{
              background: '#fff',
              borderRadius: '8px',
              padding: '25px',
              boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
              position: 'sticky',
              top: '150px'
            }}>
              <h2 style={{ color: '#133a5c', fontSize: '22px', marginBottom: '15px' }}>
                {document.title}
              </h2>
              
              <div style={{ 
                display: 'flex', 
                gap: '20px', 
                marginBottom: '20px', 
                paddingBottom: '20px', 
                borderBottom: '1px solid #eee' 
              }}>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: '20px', fontWeight: 'bold', color: '#133a5c' }}>
                    {document.downloads || 0}
                  </div>
                  <div style={{ fontSize: '12px', color: '#888' }}>Lượt tải</div>
                </div>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: '20px', fontWeight: 'bold', color: '#133a5c' }}>
                    {document.views || 0}
                  </div>
                  <div style={{ fontSize: '12px', color: '#888' }}>Lượt xem</div>
                </div>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: '20px', fontWeight: 'bold', color: '#133a5c' }}>
                    {document.fileSize ? (document.fileSize / 1024).toFixed(1) : '0'}
                  </div>
                  <div style={{ fontSize: '12px', color: '#888' }}>KB</div>
                </div>
              </div>

              <InfoRow label="Người đăng" value={document.uploadedBy?.username || 'Ẩn danh'} />
              <InfoRow label="Ngày đăng" value={document.uploadDate ? new Date(document.uploadDate).toLocaleDateString('vi-VN') : ''} />
              <InfoRow label="Danh mục" value={document.category} />
              
              <div style={{ marginBottom: '20px', paddingBottom: '20px', borderBottom: '1px solid #eee' }}>
                <div style={{ fontSize: '14px', color: '#133a5c', marginBottom: '10px', fontWeight: 'bold' }}>
                  Đánh giá
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px' }}>
                  <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#133a5c' }}>
                    {document.averageRating || '0.0'}
                  </div>
                  <div>{'⭐'.repeat(Math.round(document.averageRating || 0))}</div>
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
                  {(document.tags || []).filter(Boolean).map((tag, idx) => (
                    <span key={idx} style={{
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

              <button onClick={handleDownload} style={{
                width: '100%',
                padding: '12px',
                background: '#0d7a4f',
                color: '#fff',
                border: 'none',
                borderRadius: '6px',
                fontSize: '14px',
                fontWeight: 'bold',
                cursor: 'pointer',
                marginBottom: '10px'
              }}>
                📥 Tải xuống
              </button>
              <button onClick={handleSave} style={{
                width: '100%',
                padding: '12px',
                background: isSaved ? '#e8f4f8' : '#fff',
                color: isSaved ? '#133a5c' : '#2d4a67',
                border: '1px solid #4ba3d6',
                borderRadius: '6px',
                fontSize: '14px',
                fontWeight: 'bold',
                cursor: 'pointer'
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

