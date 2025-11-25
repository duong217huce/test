import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Header from './Header';

export default function DocumentDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [document, setDocument] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isSaved, setIsSaved] = useState(false);
  const [savingDocument, setSavingDocument] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [currentUserId, setCurrentUserId] = useState('');
  const [currentUserRole, setCurrentUserRole] = useState('');
  
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [replyingTo, setReplyingTo] = useState(null);
  const [replyContent, setReplyContent] = useState('');
  const [editingComment, setEditingComment] = useState(null);
  const [editContent, setEditContent] = useState('');

  const [showEditPopup, setShowEditPopup] = useState(false);
  const [editTitle, setEditTitle] = useState('');
  const [editDesc, setEditDesc] = useState('');
  const [editFile, setEditFile] = useState(null);

  const [userRating, setUserRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [showRatingPopup, setShowRatingPopup] = useState(false);
  const [ratingMessage, setRatingMessage] = useState('');


   useEffect(() => {
    const loggedIn = localStorage.getItem('isLoggedIn') === 'true';
    const userId = localStorage.getItem('userId') || '';
    const role = localStorage.getItem('userRole') || '';
    setIsLoggedIn(loggedIn);
    setCurrentUserId(userId);
    setCurrentUserRole(role);
  }, []);

   useEffect(() => {
    fetchDocument();
    fetchComments();
     // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  useEffect(() => {
    if (showEditPopup && document) {
      setEditTitle(document.title);
      setEditDesc(document.description);
    }
  }, [showEditPopup, document]);
  
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

  useEffect(() => {
  if (isLoggedIn && document) {
    checkSavedStatus();
  }
}, [isLoggedIn, document]);

const checkSavedStatus = async () => {
  try {
    const token = localStorage.getItem('token');
    const res = await fetch(`http://localhost:5000/api/users/saved/check/${id}`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    const data = await res.json();
    setIsSaved(data.isSaved);
  } catch (err) {
    console.error('❌ Error checking saved status:', err);
  }
};


 const handleSave = async () => {
  if (!isLoggedIn) {
    const goToLogin = window.confirm('Bạn cần đăng nhập để lưu tài liệu!\n\nBấm OK để đến trang đăng nhập.');
    if (goToLogin) {
      navigate('/login');
    }
    return;
  }

  setSavingDocument(true);
  try {
    const token = localStorage.getItem('token');
    const res = await fetch(`http://localhost:5000/api/users/saved/${id}`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    const data = await res.json();
    
    if (res.ok) {
      setIsSaved(data.isSaved);
      alert(data.message);
    } else {
      alert('Có lỗi xảy ra: ' + data.message);
    }
  } catch (err) {
    console.error('❌ Error saving document:', err);
    alert('Có lỗi xảy ra khi lưu tài liệu!');
  } finally {
    setSavingDocument(false);
  }
};

  const handleDownload = async () => {
  if (!isLoggedIn) {
    const goToLogin = window.confirm('Bạn cần đăng nhập để tải tài liệu!\n\nBấm OK để đến trang đăng nhập.');
    if (goToLogin) {
      navigate('/login');
    }
    return;
  }

  try {
    // Tăng số lượt download
    await fetch(`http://localhost:5000/api/documents/${id}/download`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      }
    });

    // Lấy tên file từ URL
    let fileUrl = document.fileUrl;
    const filename = fileUrl.split('/').pop(); // Lấy phần cuối cùng của URL
    
    // Sử dụng route /download thay vì /uploads
    const downloadUrl = `http://localhost:5000/download/${filename}`;

    // Trigger download
    const link = window.document.createElement('a');
    link.href = downloadUrl;
    link.download = document.fileName || document.title || 'document';
    
    window.document.body.appendChild(link);
    link.click();
    window.document.body.removeChild(link);

    console.log('📥 Download started:', document.title);
    
    // Thông báo thành công
    setTimeout(() => {
      alert('Tài liệu đang được tải xuống!');
    }, 100);

  } catch (err) {
    console.error('❌ Error downloading:', err);
    alert('Có lỗi xảy ra khi tải tài liệu!');
  }
};

useEffect(() => {
  if (isLoggedIn && document) {
    fetchUserRating();
  }
}, [isLoggedIn, document]);

const fetchUserRating = async () => {
  try {
    const token = localStorage.getItem('token');
    const res = await fetch(`http://localhost:5000/api/ratings/${id}`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    const data = await res.json();
    setUserRating(data.userRating || 0);
  } catch (err) {
    console.error('❌ Error fetching user rating:', err);
  }
};

  const handleRatingClick = async (rating) => {
  if (!isLoggedIn) {
    const goToLogin = window.confirm('Bạn cần đăng nhập để đánh giá!\n\nBấm OK để đến trang đăng nhập.');
    if (goToLogin) {
      navigate('/login');
    }
    return;
  }

  try {
    const token = localStorage.getItem('token');
    const res = await fetch('http://localhost:5000/api/ratings', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        documentId: id,
        rating
      })
    });

    const data = await res.json();

    if (res.ok) {
      setUserRating(rating);
      setRatingMessage(data.message);
      setShowRatingPopup(true);
      
      // Cập nhật average rating
      setDocument(prev => ({
        ...prev,
        averageRating: data.averageRating,
        totalRatings: data.totalRatings
      }));
    } else {
      alert(data.message || 'Có lỗi xảy ra khi đánh giá!');
    }
  } catch (err) {
    console.error('❌ Error rating document:', err);
    alert('Có lỗi xảy ra khi đánh giá!');
  }
};

const renderStars = () => {
  const stars = [];
  const displayRating = hoverRating || userRating;

  for (let i = 1; i <= 5; i++) {
    stars.push(
      <span
        key={i}
        onClick={() => handleRatingClick(i)}
        onMouseEnter={() => setHoverRating(i)}
        onMouseLeave={() => setHoverRating(0)}
        style={{
          fontSize: '32px',
          cursor: 'pointer',
          color: i <= displayRating ? '#ffc107' : '#ddd',
          transition: 'color 0.2s',
          marginRight: '5px'
        }}
      >
        ★
      </span>
    );
  }

  return stars;
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
  
  // ✅ QUAN TRỌNG: Phải dùng /uploads chứ KHÔNG phải /download
  if (!fileUrl.startsWith('http')) {
    fileUrl = `http://localhost:5000${fileUrl}`;  // Giữ nguyên /uploads trong URL
  }

  const fileType = document.fileType || '';

  // Preview PDF
  if (fileType.includes('pdf') || fileUrl.endsWith('.pdf')) {
    return (
      <div>
        <iframe
          src={fileUrl}  // ← URL phải là /uploads/filename.pdf
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

  // Preview Word
  if (fileType.includes('word') || fileType.includes('document') || 
      fileUrl.match(/\.(doc|docx)$/i)) {
    return (
      <div>
        <iframe
          src={`http://localhost:5000/api/documents/${id}/preview`}  // ← Route preview riêng
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

  // Các file khác không preview được
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

  const handleFileChange = (e) => {
    setEditFile(e.target.files[0]);
  };

  const handleEditSubmit = async () => {
    const token = localStorage.getItem('token');
    const formData = new FormData();
    formData.append('title', editTitle);
    formData.append('description', editDesc);
    if (editFile) formData.append('file', editFile);

    try {
      const res = await fetch(`http://localhost:5000/api/documents/${id}`, {
        method: 'PUT',
        headers: { 'Authorization': `Bearer ${token}` },
        body: formData
      });
      if (res.ok) {
        alert('Đã lưu chỉnh sửa!');
        setShowEditPopup(false);
        fetchDocument();
      } else {
        alert('Không lưu được, vui lòng thử lại!');
      }
    } catch {
      alert('Có lỗi xảy ra!');
    }
  };

  const canEdit =
    (currentUserId === document?.uploadedBy?._id || currentUserRole === 'admin');


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
      {/* Breadcrumb */}
      <div style={{ fontSize: '13px', color: '#888', marginBottom: '20px' }}>
        <span onClick={() => navigate('/')} style={{ cursor: 'pointer', color: '#4ba3d6' }}>
          Trang chủ
        </span>
        {' > '}
        <span style={{ color: '#133a5c' }}>{document.category}</span>
        {' > '}
        <span>{document.title}</span>
      </div>

      {/* Main Layout: Content + Sidebar */}
      <div style={{ display: 'flex', gap: '30px' }}>
        
        {/* ==================== LEFT COLUMN: MAIN CONTENT ==================== */}
        <div style={{ flex: '2' }}>
          
          {/* Document Viewer */}
          <div style={{
            background: '#fff',
            borderRadius: '8px',
            padding: '20px',
            marginBottom: '20px',
            boxShadow: '0 2px 8px rgba(0,0,0,0.06)'
          }}>
            <h3 style={{ color: '#133a5c', marginBottom: '15px', textAlign: 'center' }}>
              📖 Xem trước tài liệu
              {canEdit && (
                <button
                  style={{
                    padding: '8px 18px',
                    marginLeft: '15px',
                    background: '#4ba3d6',
                    color: '#fff',
                    border: 'none',
                    borderRadius: '6px',
                    fontSize: '14px',
                    fontWeight: 'bold',
                    cursor: 'pointer'
                  }}
                  onClick={() => setShowEditPopup(true)}
                >
                  ✏️ Chỉnh sửa
                </button>
              )}
            </h3>
            {renderDocumentViewer()}
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

          {/* Comments Section */}
          <div style={{
            background: '#fff',
            borderRadius: '8px',
            padding: '25px',
            boxShadow: '0 2px 8px rgba(0,0,0,0.06)'
          }}>
            <h3 style={{ color: '#133a5c', marginBottom: '20px' }}>
              💬 Bình luận ({comments.length})
            </h3>

            {/* New Comment Input */}
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
              {comments.length > 0 ? (
                comments.map(comment => (
                  <div key={comment._id} style={{
                    borderBottom: '1px solid #eee',
                    paddingBottom: '20px',
                    marginBottom: '20px'
                  }}>
                    {/* Comment Header */}
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

                    {/* Comment Content */}
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

                    {/* Comment Actions */}
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

                    {/* Reply Input */}
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

                    {/* Replies */}
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

        {/* ==================== RIGHT COLUMN: SIDEBAR ==================== */}
        <div style={{ flex: '1' }}>
          <div style={{
            background: '#fff',
            borderRadius: '8px',
            padding: '25px',
            boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
            position: 'sticky',
            top: '150px'
          }}>
            {/* Document Title */}
            <h2 style={{ color: '#133a5c', fontSize: '22px', marginBottom: '15px' }}>
              {document.title}
            </h2>
            
            {/* Statistics */}
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

            {/* Document Info */}
            <InfoRow label="Người đăng" value={document.uploadedBy?.username || 'Ẩn danh'} />
            <InfoRow label="Ngày đăng" value={document.uploadDate ? new Date(document.uploadDate).toLocaleDateString('vi-VN') : ''} />
            <InfoRow label="Danh mục" value={document.category} />
            
            {/* ✅ RATING SECTION */}
            <div style={{ marginBottom: '20px', paddingBottom: '20px', borderBottom: '1px solid #eee' }}>
              <div style={{ fontSize: '14px', color: '#133a5c', marginBottom: '10px', fontWeight: 'bold' }}>
                ⭐ Đánh giá tài liệu
              </div>
              
              {/* Average Rating Display */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '15px' }}>
                <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#133a5c' }}>
                  {document.averageRating || '0.0'}
                </div>
                <div>
                  {'⭐'.repeat(Math.round(document.averageRating || 0))}
                  {'☆'.repeat(5 - Math.round(document.averageRating || 0))}
                </div>
              </div>

              {/* User Rating Input */}
              <div style={{ fontSize: '13px', color: '#666', marginBottom: '8px' }}>
                {userRating > 0 ? `Bạn đã đánh giá ${userRating} sao` : (isLoggedIn ? 'Đánh giá của bạn:' : 'Đăng nhập để đánh giá')}
              </div>
              
              <div style={{ 
                display: 'flex', 
                gap: '5px',
                justifyContent: 'center',
                marginTop: '10px'
              }}>
                {renderStars()}
              </div>
            </div>

            {/* Tags */}
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

            {/* Action Buttons */}
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
            
            <button onClick={handleSave} 
              disabled={savingDocument}
              style={{
                width: '100%',
                padding: '12px',
                background: isSaved ? '#e8f4f8' : '#fff',
                color: isSaved ? '#133a5c' : '#2d4a67',
                border: isSaved ? '2px solid #4ba3d6' : '1px solid #4ba3d6',
                borderRadius: '6px',
                fontSize: '14px',
                fontWeight: 'bold',
                cursor: savingDocument ? 'not-allowed' : 'pointer',
                opacity: savingDocument ? 0.6 : 1
              }}
            >
              {savingDocument ? '⏳ Đang xử lý...' : (isSaved ? '✓ Đã lưu' : '🔖 Lưu tài liệu')}
            </button>
          </div>
        </div>
      </div>
    </div>

    {/* ==================== POPUPS ==================== */}
    
    {/* Edit Document Popup */}
    {showEditPopup && (
      <div style={{
        position: 'fixed', 
        left: 0, 
        top: 0, 
        right: 0, 
        bottom: 0,
        background: 'rgba(0,0,0,0.5)', 
        zIndex: 9999, 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center'
      }}>
        <div style={{
          background: '#fff', 
          borderRadius: '10px', 
          padding: '40px', 
          boxShadow: '0 6px 40px rgba(0,0,0,0.18)', 
          minWidth: '380px'
        }}>
          <h3 style={{ color: '#133a5c', marginBottom: '16px' }}>Chỉnh sửa tài liệu</h3>
          
          <div style={{ marginBottom: '14px' }}>
            <label style={{ fontWeight: 'bold', color: '#133a5c' }}>Tên tài liệu</label>
            <input 
              value={editTitle} 
              onChange={e => setEditTitle(e.target.value)} 
              style={{
                width: '100%', 
                padding: '8px', 
                borderRadius: '5px', 
                border: '1px solid #8ecae6', 
                fontSize: '15px'
              }}
            />
          </div>
          
          <div style={{ marginBottom: '14px' }}>
            <label style={{ fontWeight: 'bold', color: '#133a5c' }}>Mô tả</label>
            <textarea 
              value={editDesc} 
              onChange={e => setEditDesc(e.target.value)} 
              rows={3} 
              style={{
                width: '100%', 
                padding: '8px', 
                borderRadius: '5px', 
                border: '1px solid #8ecae6', 
                fontSize: '15px'
              }}
            />
          </div>
          
          <div style={{ marginBottom: '18px' }}>
            <label style={{ fontWeight: 'bold', color: '#133a5c' }}>Thay thế file</label>
            <input 
              type="file" 
              accept=".pdf,.doc,.docx,.ppt,.pptx" 
              onChange={handleFileChange} 
            />
          </div>
          
          <div style={{ display: 'flex', gap: 15, marginTop: 15 }}>
            <button 
              onClick={handleEditSubmit} 
              style={{
                background: '#219e67', 
                color: '#fff', 
                padding: '10px 28px', 
                fontWeight: 'bold', 
                borderRadius: '6px', 
                border: 'none', 
                cursor: 'pointer'
              }}
            >
              Lưu
            </button>
            <button 
              onClick={() => setShowEditPopup(false)} 
              style={{
                background: '#efefef', 
                color: '#133a5c', 
                padding: '10px 28px', 
                fontWeight: 'bold', 
                borderRadius: '6px', 
                border: 'none', 
                cursor: 'pointer'
              }}
            >
              Hủy
            </button>
          </div>
        </div>
      </div>
    )}

    {/* ✅ Rating Success Popup */}
    {showRatingPopup && (
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
        zIndex: 10000
      }}>
        <div style={{
          background: '#fff',
          borderRadius: '12px',
          padding: '30px',
          boxShadow: '0 6px 30px rgba(0,0,0,0.2)',
          textAlign: 'center',
          maxWidth: '400px'
        }}>
          <div style={{ fontSize: '64px', marginBottom: '20px' }}>⭐</div>
          <h3 style={{ color: '#133a5c', marginBottom: '15px', fontSize: '20px' }}>
            Đánh giá thành công!
          </h3>
          <p style={{ color: '#666', marginBottom: '25px', fontSize: '16px' }}>
            {ratingMessage}
          </p>
          <button
            onClick={() => setShowRatingPopup(false)}
            style={{
              padding: '12px 40px',
              background: '#4ba3d6',
              color: '#fff',
              border: 'none',
              borderRadius: '6px',
              fontSize: '16px',
              fontWeight: 'bold',
              cursor: 'pointer'
            }}
          >
            OK
          </button>
        </div>
      </div>
    )}
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

