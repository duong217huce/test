import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Header from './Header';
import PurchaseModal from './PurchaseModal';
import ReportCommentModal from './ReportCommentModal';
import { refreshUserData } from '../utils/userUtils';
import { showToast } from '../utils/toast';

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

  const [isPurchased, setIsPurchased] = useState(false);
  const [userCoins, setUserCoins] = useState(0);
  const [showPurchaseModal, setShowPurchaseModal] = useState(false);

  // ✨ NEW: Report states
  const [showReportCommentModal, setShowReportCommentModal] = useState(false);
  const [reportingCommentId, setReportingCommentId] = useState(null);
  const [showReportDocumentModal, setShowReportDocumentModal] = useState(false);

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
    checkPurchaseStatus();
    loadUserCoins();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  useEffect(() => {
    if (showEditPopup && document) {
      setEditTitle(document.title);
      setEditDesc(document.description);
    }
  }, [showEditPopup, document]);

  useEffect(() => {
    if (isLoggedIn && document) {
      checkSavedStatus();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isLoggedIn, document]);

  useEffect(() => {
    if (isLoggedIn && document) {
      fetchUserRating();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isLoggedIn, document]);

  const fetchDocument = async () => {
    setLoading(true);
    try {
      const res = await fetch(`http://localhost:5000/api/documents/${id}`);
      const data = await res.json();
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
      setComments(data);
    } catch (err) {
      console.error('❌ Error fetching comments:', err);
    }
  };

  const checkPurchaseStatus = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;

      const res = await fetch(`http://localhost:5000/api/documents/${id}/check-purchase`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      setIsPurchased(data.isPurchased);
    } catch (error) {
      console.error('Error checking purchase:', error);
    }
  };

  const loadUserCoins = () => {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    setUserCoins(user.coins || 0);
  };

  const handlePurchase = async () => {
    const token = localStorage.getItem('token');
    
    if (!token) {
      alert('Vui lòng đăng nhập để mua tài liệu!');
      navigate('/login');
      return;
    }

    if (userCoins < document.price) {
      alert(`Số dư không đủ! Bạn cần thêm ${document.price - userCoins} DP.`);
      navigate('/recharge');
      return;
    }

    try {
      const response = await fetch(`http://localhost:5000/api/documents/${id}/purchase`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      const data = await response.json();

      if (response.ok) {
        if (data.alreadyPurchased) {
          alert('Bạn đã mua tài liệu này rồi!');
        } else {
          await refreshUserData();
          const newCoins = parseInt(localStorage.getItem('userCoins') || '0');
          setUserCoins(newCoins);
          alert('✅ Mua tài liệu thành công!');
          setIsPurchased(true);
        }
        setShowPurchaseModal(false);
      } else {
        if (data.needRecharge) {
          alert('Số dư không đủ! Vui lòng nạp thêm tiền.');
          navigate('/recharge');
        } else {
          alert(data.message || 'Có lỗi xảy ra!');
        }
      }
    } catch (error) {
      console.error('Error purchasing:', error);
      alert('Có lỗi xảy ra khi mua tài liệu!');
    }
  };

  const checkSavedStatus = useCallback(async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`http://localhost:5000/api/users/saved/check/${id}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      setIsSaved(data.isSaved);
    } catch (err) {
      console.error('❌ Error checking saved status:', err);
    }
  }, [id]);

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
        headers: { 'Authorization': `Bearer ${token}` }
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

    if (document.isPaid && !isPurchased) {
      alert('⚠️ Vui lòng mua tài liệu để tải xuống!');
      setShowPurchaseModal(true);
      return;
    }

    try {
      await fetch(`http://localhost:5000/api/documents/${id}/download`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });

      let fileUrl = document.fileUrl;
      const filename = fileUrl.split('/').pop();
      const downloadUrl = `http://localhost:5000/download/${filename}`;

      const link = window.document.createElement('a');
      link.href = downloadUrl;
      link.download = document.fileName || document.title || 'document';
      
      window.document.body.appendChild(link);
      link.click();
      window.document.body.removeChild(link);

      setTimeout(() => {
        alert('Tài liệu đang được tải xuống!');
      }, 100);

    } catch (err) {
      console.error('❌ Error downloading:', err);
      alert('Có lỗi xảy ra khi tải tài liệu!');
    }
  };

  // ✨ NEW: Handle report document
  const handleReportDocument = async (reportData) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5000/api/reports/document', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          documentId: id,
          documentTitle: document.title,
          reasons: reportData.reasons
        })
      });

      if (response.ok) {
        setShowReportDocumentModal(false);
        showToast('Báo cáo tài liệu thành công', 'success');
      } else {
        const data = await response.json();
        alert(data.message || 'Có lỗi xảy ra khi báo cáo!');
      }
    } catch (error) {
      console.error('Error reporting document:', error);
      alert('Có lỗi xảy ra khi báo cáo!');
    }
  };

  // ✨ NEW: Handle report comment
  const handleReportComment = async (reportData) => {
    try {
      const token = localStorage.getItem('token');
      const comment = comments.find(c => c._id === reportingCommentId);
      
      const response = await fetch('http://localhost:5000/api/reports/comment', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          commentId: reportingCommentId,
          commentContent: comment?.content || '',
          documentId: id,
          documentTitle: document.title,
          reasons: reportData.reasons
        })
      });

      if (response.ok) {
        setShowReportCommentModal(false);
        setReportingCommentId(null);
        showToast('Báo cáo bình luận thành công', 'success');
      } else {
        const data = await response.json();
        alert(data.message || 'Có lỗi xảy ra khi báo cáo!');
      }
    } catch (error) {
      console.error('Error reporting comment:', error);
      alert('Có lỗi xảy ra khi báo cáo!');
    }
  };

  const fetchUserRating = useCallback(async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`http://localhost:5000/api/ratings/${id}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      setUserRating(data.userRating || 0);
    } catch (err) {
      console.error('❌ Error fetching user rating:', err);
    }
  }, [id]);

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
        setNewComment('');
        fetchComments();
      } else {
        const error = await res.json();
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
        headers: { 'Authorization': `Bearer ${token}` }
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
        headers: { 'Authorization': `Bearer ${token}` }
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

  const canEdit = (currentUserId === document?.uploadedBy?._id || currentUserRole === 'admin');

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
    <div style={{ minHeight: '100vh', background: '#fffffe', fontFamily: 'Montserrat' }}>
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

        {/* Main Layout */}
        <div style={{ display: 'flex', gap: '30px' }}>
          
          {/* LEFT COLUMN */}
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
                    fontFamily: 'Montserrat',
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
                        
                        <div style={{ display: 'flex', gap: '8px' }}>
                          {/* ✨ NEW: Report button - only show for other users' comments */}
                          {isLoggedIn && comment.user?._id !== currentUserId && (
                            <button
                              onClick={() => {
                                setReportingCommentId(comment._id);
                                setShowReportCommentModal(true);
                              }}
                              style={{
                                padding: '4px 10px',
                                background: '#fff',
                                border: '1px solid #ff6b7a',
                                borderRadius: '4px',
                                fontSize: '12px',
                                cursor: 'pointer',
                                color: '#ff6b7a'
                              }}
                            >
                              🚨 Báo cáo
                            </button>
                          )}

                          {isLoggedIn && comment.user?._id === currentUserId && (
                            <>
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
                            </>
                          )}
                        </div>
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

          {/* RIGHT COLUMN: SIDEBAR */}
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

              {document.isPaid && (
                <div style={{
                  background: 'linear-gradient(135deg, #e84c61 0%, #ff6b7a 100%)',
                  color: '#fff',
                  padding: '12px',
                  borderRadius: '8px',
                  marginBottom: '15px',
                  textAlign: 'center',
                  fontWeight: 'bold',
                  fontSize: '16px',
                  boxShadow: '0 4px 12px rgba(232, 76, 97, 0.3)'
                }}>
                  💰 Tài liệu trả phí
                  <div style={{ fontSize: '20px', marginTop: '5px' }}>
                    {document.price} DP
                  </div>
                </div>
              )}

              {document.isPaid && isPurchased && (
                <div style={{
                  background: '#d4edda',
                  color: '#155724',
                  border: '2px solid #c3e6cb',
                  padding: '12px',
                  borderRadius: '8px',
                  marginBottom: '15px',
                  textAlign: 'center',
                  fontWeight: 'bold'
                }}>
                  ✅ Đã mua tài liệu
                </div>
              )}
              
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
                    {document.fileSize ? (document.fileSize / (1024*1024)).toFixed(1) : '0'}
                  </div>
                  <div style={{ fontSize: '12px', color: '#888' }}>MB</div>
                </div>
              </div>

              <InfoRow label="Người đăng" value={document.uploadedBy?.username || 'Ẩn danh'} />
              <InfoRow label="Ngày đăng" value={document.uploadDate ? new Date(document.uploadDate).toLocaleDateString('vi-VN') : ''} />
              <InfoRow label="Danh mục" value={document.category} />
              
              <div style={{ marginBottom: '20px', paddingBottom: '20px', borderBottom: '1px solid #eee' }}>
                <div style={{ fontSize: '14px', color: '#133a5c', marginBottom: '10px', fontWeight: 'bold' }}>
                  ⭐ Đánh giá tài liệu
                </div>
                
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '15px' }}>
                  <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#133a5c' }}>
                    {document.averageRating || '0.0'}
                  </div>
                  <div>
                    {'⭐'.repeat(Math.round(document.averageRating || 0))}
                    {'☆'.repeat(5 - Math.round(document.averageRating || 0))}
                  </div>
                </div>

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
                fontSize: '15px',
                fontWeight: 'bold',
                cursor: 'pointer',
                marginBottom: '10px'
              }}>
                📥 Tải xuống
              </button>

              <button 
                onClick={handleSave}
                disabled={savingDocument}
                style={{
                  width: '100%',
                  padding: '12px',
                  background: isSaved ? '#ffc107' : '#4ba3d6',
                  color: '#fff',
                  border: 'none',
                  borderRadius: '6px',
                  fontSize: '15px',
                  fontWeight: 'bold',
                  cursor: savingDocument ? 'not-allowed' : 'pointer',
                  marginBottom: '10px'
                }}
              >
                {savingDocument ? '⏳ Đang xử lý...' : (isSaved ? '⭐ Đã lưu' : '💾 Lưu tài liệu')}
              </button>

              {/* ✨ NEW: Report Document Button */}
              {isLoggedIn && (
                <button
                  onClick={() => setShowReportDocumentModal(true)}
                  style={{
                    width: '100%',
                    padding: '12px',
                    background: '#fff',
                    color: '#ff6b7a',
                    border: '2px solid #ff6b7a',
                    borderRadius: '6px',
                    fontSize: '15px',
                    fontWeight: 'bold',
                    cursor: 'pointer',
                    marginBottom: '10px'
                  }}
                >
                  🚨 Báo cáo tài liệu
                </button>
              )}

              {document.isPaid && !isPurchased && (
                <button
                  onClick={() => setShowPurchaseModal(true)}
                  style={{
                    width: '100%',
                    padding: '12px',
                    background: 'linear-gradient(135deg, #e84c61 0%, #ff6b7a 100%)',
                    color: '#fff',
                    border: 'none',
                    borderRadius: '6px',
                    fontSize: '15px',
                    fontWeight: 'bold',
                    cursor: 'pointer',
                    marginBottom: '10px',
                    boxShadow: '0 4px 12px rgba(232, 76, 97, 0.3)'
                  }}
                >
                  💳 Mua tài liệu ({document.price} DP)
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Modals */}
      <PurchaseModal
        isOpen={showPurchaseModal}
        onClose={() => setShowPurchaseModal(false)}
        onConfirm={handlePurchase}
        document={document}
        userCoins={userCoins}
      />

      {/* ✨ NEW: Report Comment Modal */}
      <ReportCommentModal
        isOpen={showReportCommentModal}
        onClose={() => {
          setShowReportCommentModal(false);
          setReportingCommentId(null);
        }}
        onSubmit={handleReportComment}
        commentId={reportingCommentId}
      />

      {/* ✨ NEW: Report Document Modal */}
      <ReportCommentModal
        isOpen={showReportDocumentModal}
        onClose={() => setShowReportDocumentModal(false)}
        onSubmit={handleReportDocument}
        commentId={id}
      />

      {showRatingPopup && (
        <div style={{
          position: 'fixed',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          background: '#fff',
          padding: '30px',
          borderRadius: '12px',
          boxShadow: '0 8px 32px rgba(0,0,0,0.2)',
          zIndex: 9999,
          textAlign: 'center'
        }}>
          <h3 style={{ color: '#133a5c', marginBottom: '15px' }}>✅ Cảm ơn bạn!</h3>
          <p style={{ color: '#2d4a67', marginBottom: '20px' }}>{ratingMessage}</p>
          <button
            onClick={() => setShowRatingPopup(false)}
            style={{
              padding: '10px 30px',
              background: '#4ba3d6',
              color: '#fff',
              border: 'none',
              borderRadius: '6px',
              fontSize: '14px',
              fontWeight: 'bold',
              cursor: 'pointer'
            }}
          >
            Đóng
          </button>
        </div>
      )}

      {showEditPopup && (
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
          zIndex: 9999
        }}>
          <div style={{
            background: '#fff',
            padding: '30px',
            borderRadius: '12px',
            width: '500px',
            maxWidth: '90%'
          }}>
            <h3 style={{ marginBottom: '20px' }}>Chỉnh sửa tài liệu</h3>
            <input
              value={editTitle}
              onChange={(e) => setEditTitle(e.target.value)}
              placeholder="Tiêu đề"
              style={{
                width: '100%',
                padding: '10px',
                marginBottom: '15px',
                border: '1px solid #ccc',
                borderRadius: '6px',
                boxSizing: 'border-box'
              }}
            />
            <textarea
              value={editDesc}
              onChange={(e) => setEditDesc(e.target.value)}
              placeholder="Mô tả"
              rows="4"
              style={{
                width: '100%',
                padding: '10px',
                marginBottom: '15px',
                border: '1px solid #ccc',
                borderRadius: '6px',
                boxSizing: 'border-box'
              }}
            />
            <input
              type="file"
              onChange={handleFileChange}
              style={{ marginBottom: '15px' }}
            />
            <div style={{ display: 'flex', gap: '10px' }}>
              <button
                onClick={handleEditSubmit}
                style={{
                  flex: 1,
                  padding: '12px',
                  background: '#0d7a4f',
                  color: '#fff',
                  border: 'none',
                  borderRadius: '6px',
                  cursor: 'pointer'
                }}
              >
                Lưu
              </button>
              <button
                onClick={() => setShowEditPopup(false)}
                style={{
                  flex: 1,
                  padding: '12px',
                  background: '#ccc',
                  color: '#333',
                  border: 'none',
                  borderRadius: '6px',
                  cursor: 'pointer'
                }}
              >
                Hủy
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function InfoRow({ label, value }) {
  return (
    <div style={{ marginBottom: '15px' }}>
      <div style={{ color: '#888', fontSize: '13px', marginBottom: '5px' }}>{label}</div>
      <div style={{ color: '#133a5c', fontSize: '15px', fontWeight: 'bold' }}>
        {value}
      </div>
    </div>
  );
}
