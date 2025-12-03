import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Header from './Header';
import Footer from './Footer';
import PurchaseModal from './PurchaseModal';
import ReportCommentModal from './ReportCommentModal';
import { refreshUserData } from '../utils/userUtils';
import { showToast } from '../utils/toast';
import { colors } from '../theme/colors';
import Groq from 'groq-sdk';

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
  const [coins, setCoins] = useState(0);
  const [showPurchaseModal, setShowPurchaseModal] = useState(false);

  // ✨ NEW: Report states
  const [showReportCommentModal, setShowReportCommentModal] = useState(false);
  const [reportingCommentId, setReportingCommentId] = useState(null);
  const [showReportDocumentModal, setShowReportDocumentModal] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  // ✨ NEW: Page navigation, related documents, AI summary
  const [_currentPage, _setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [relatedDocuments, setRelatedDocuments] = useState([]);
  const [showAIQuestion, setShowAIQuestion] = useState(false);
  const [aiQuestion, setAiQuestion] = useState('');
  const [aiAnswer, setAiAnswer] = useState('');
  const [aiQuestionLoading, setAiQuestionLoading] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isLiked, setIsLiked] = useState(false);

  useEffect(() => {
    const loggedIn = localStorage.getItem('isLoggedIn') === 'true';
    const userId = localStorage.getItem('userId') || '';
    const role = localStorage.getItem('userRole') || '';
    setIsLoggedIn(loggedIn);
    setCurrentUserId(userId);
    setCurrentUserRole(role);

    console.log('🔍 Current User:', { userId, role, loggedIn });
  }, []);

  useEffect(() => {
    fetchDocument();
    fetchComments();
    checkPurchaseStatus();
    loadCoins();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  useEffect(() => {
    if (document) {
      // Estimate total pages (rough estimate: ~50KB per page for PDF)
      const estimatedPages = document.fileType?.includes('pdf') 
        ? Math.max(1, Math.floor(document.fileSize / (50 * 1024)))
        : 1;
      setTotalPages(estimatedPages);
      fetchRelatedDocuments();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [document]);

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
      
      // DEBUG LOG - ĐÃ SỬA
      console.log('📄 Document Data:', {
        uploadedBy: data.uploadedBy,
        uploadedById: data.uploadedBy?._id,  // ← _id thay vì id
        uploadedByIdAlt: data.uploadedBy?.id
      });
    } catch (err) {
      console.error('Error fetching document:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchRelatedDocuments = async () => {
    try {
      if (!document) return;
      
      const res = await fetch(`http://localhost:5000/api/documents?category=${encodeURIComponent(document.category)}`);
      const data = await res.json();
      // Filter out current document and get up to 4 related
      const related = data.filter(doc => doc._id !== id).slice(0, 4);
      setRelatedDocuments(related);
    } catch (err) {
      console.error('Error fetching related documents:', err);
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

  const loadCoins = () => {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    setCoins(user.coins || 0);
  };

  const handlePurchase = async () => {
    const token = localStorage.getItem('token');
    
    if (!token) {
      alert('Vui lòng đăng nhập để mua tài liệu!');
      navigate('/login');
      return;
    }

    if (coins < document.price) {
      alert(`Số dư không đủ! Bạn cần thêm ${document.price - coins} DP.`);
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
          const user = JSON.parse(localStorage.getItem('user') || '{}');
          setCoins(user.coins || 0);
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
        showToast(data.message, 'success');
      } else {
        showToast('Có lỗi xảy ra: ' + data.message, 'error');
      }
    } catch (err) {
      console.error('❌ Error saving document:', err);
      showToast('Có lỗi xảy ra khi lưu tài liệu!', 'error');
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

  const handleDeleteDocument = async () => {
  try {
    const token = localStorage.getItem('token');
    const response = await fetch(`http://localhost:5000/api/documents/${id}`, {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${token}` }
    });
    if (response.ok) {
      showToast('Xóa tài liệu thành công', 'success');
      setTimeout(() => navigate('/'), 1000);
    } else {
      const data = await response.json();
      alert(data.message || 'Có lỗi xảy ra!');
    }
  } catch (error) {
    console.error('Error:', error);
    alert('Có lỗi xảy ra!');
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

  // ✨ NEW: Handle AI Question
  const handleAIQuestion = async () => {
    if (!document || !aiQuestion.trim()) {
      return;
    }

    setAiQuestionLoading(true);
    setAiAnswer('Đang xử lý câu hỏi...');

    try {
      // Bước 1: Trích xuất text từ tài liệu
      const extractResponse = await fetch(`http://localhost:5000/api/documents/${id}/extract-text`);
      
      if (!extractResponse.ok) {
        const errorData = await extractResponse.json();
        throw new Error(errorData.message || 'Không thể đọc nội dung tài liệu');
      }

      const extractData = await extractResponse.json();
      const documentContent = extractData.text;

      if (!documentContent || documentContent.trim().length === 0) {
        setAiAnswer('Không thể trích xuất nội dung từ tài liệu này. Tài liệu có thể là file hình ảnh hoặc định dạng không được hỗ trợ.');
        setAiQuestionLoading(false);
        return;
      }

      setAiAnswer('Đang tìm câu trả lời...');

      // Bước 2: Gửi câu hỏi và nội dung cho AI
      const API_KEY = import.meta.env.VITE_GROQ_API_KEY;
      if (!API_KEY) {
        setAiAnswer('Lỗi: API key chưa được cấu hình. Vui lòng thêm VITE_GROQ_API_KEY vào file .env');
        setAiQuestionLoading(false);
        return;
      }

      const groq = new Groq({ 
        apiKey: API_KEY,
        dangerouslyAllowBrowser: true
      });

      const prompt = `Bạn là trợ lý AI chuyên trả lời câu hỏi về tài liệu học tập. Hãy đọc kỹ nội dung tài liệu sau đây và trả lời câu hỏi của người dùng một cách chính xác và chi tiết.

THÔNG TIN TÀI LIỆU:
- Tiêu đề: ${document.title}
- Mô tả: ${document.description || 'Không có mô tả'}
- Danh mục: ${document.category || 'Không xác định'}
- Cấp học: ${document.grade || 'Không xác định'}
- Môn học/Lĩnh vực: ${document.subject || document.field || 'Không xác định'}

NỘI DUNG TÀI LIỆU:
${documentContent}

CÂU HỎI CỦA NGƯỜI DÙNG:
${aiQuestion}

YÊU CẦU TRẢ LỜI:
1. Đọc kỹ nội dung tài liệu và tìm thông tin liên quan đến câu hỏi
2. Trả lời câu hỏi một cách chính xác, chi tiết và dễ hiểu
3. Nếu câu hỏi không liên quan đến nội dung tài liệu, hãy thông báo rõ ràng
4. Nếu không tìm thấy thông tin trong tài liệu, hãy nói rõ điều đó
5. Viết bằng tiếng Việt, rõ ràng, có cấu trúc
6. Có thể trích dẫn phần nội dung liên quan từ tài liệu nếu cần

Hãy trả lời câu hỏi dựa trên nội dung thực tế của tài liệu.`;

      const chatCompletion = await groq.chat.completions.create({
        messages: [
          { 
            role: 'system', 
            content: 'Bạn là trợ lý AI chuyên trả lời câu hỏi về tài liệu học tập. Đọc kỹ nội dung và trả lời chính xác dựa trên thông tin trong tài liệu. Trả lời bằng tiếng Việt, rõ ràng và có cấu trúc.'
          },
          { role: 'user', content: prompt }
        ],
        model: 'llama-3.3-70b-versatile',
        temperature: 0.7,
        max_tokens: 2000
      });

      const answer = chatCompletion.choices[0]?.message?.content || 'Không thể trả lời câu hỏi. Vui lòng thử lại.';
      setAiAnswer(answer);
    } catch (error) {
      console.error('❌ Error answering AI question:', error);
      let errorMsg = 'Lỗi khi xử lý câu hỏi. ';
      
      if (error.message?.includes('API key')) {
        errorMsg += 'API key không hợp lệ.';
      } else if (error.message?.includes('rate limit')) {
        errorMsg += 'Quá nhiều request. Vui lòng đợi 1 phút.';
      } else if (error.message?.includes('Không thể đọc')) {
        errorMsg = error.message;
      } else {
        errorMsg += error.message || 'Vui lòng thử lại.';
      }
      
      setAiAnswer(errorMsg);
    } finally {
      setAiQuestionLoading(false);
    }
  };

  // Share and Like functions - to be used in future UI updates
  const _handleShare = () => {
    const url = window.location.href;
    if (navigator.share) {
      navigator.share({
        title: document?.title,
        text: document?.description,
        url: url
      });
    } else {
      navigator.clipboard.writeText(url);
      showToast('Đã sao chép link!', 'success');
    }
  };

  const _handleLike = async () => {
    if (!isLoggedIn) {
      alert('Vui lòng đăng nhập để thích tài liệu!');
      navigate('/login');
      return;
    }
    // TODO: Implement like API
    setIsLiked(!isLiked);
  };

  const _handleFullscreen = () => {
    const element = document.documentElement;
    if (!isFullscreen) {
      if (element.requestFullscreen) {
        element.requestFullscreen();
      }
      setIsFullscreen(true);
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
      }
      setIsFullscreen(false);
    }
  };

  const _handleQRCode = () => {
    // TODO: Generate QR code
    const url = window.location.href;
    alert(`QR Code cho: ${url}`);
  };

  const _handlePageChange = (e) => {
    const page = parseInt(e.target.value) || 1;
    if (page >= 1 && page <= totalPages) {
      _setCurrentPage(page);
      // TODO: Update PDF viewer to show specific page
    }
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
      // Use the view endpoint for better PDF rendering
      const pdfViewUrl = `http://localhost:5000/api/documents/${id}/view`;
      return (
        <div>
          <iframe
            src={pdfViewUrl}
            type="application/pdf"
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

    // DEBUG: Log trước khi check
console.log('🔐 Permission Check:', {
  currentUserId,
  currentUserRole,
  uploadedById: document?.uploadedBy?._id,  // ← _id
  uploadedByIdString: document?.uploadedBy?._id?.toString(),  // ← _id và thêm ()
  uploadedByIdAlt: document?.uploadedBy?.id
});

const canEdit = (
  currentUserId === document?.uploadedBy?._id?.toString() ||  // ← _id và thêm ()
  currentUserId === document?.uploadedBy?.id?.toString() ||   // ← thêm ()
  currentUserId === document?.uploadedBy?._id ||               // ← _id
  currentUserId === document?.uploadedBy?.id ||
  currentUserRole === 'admin'
);
console.log('✅ canEdit Result:', canEdit);
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
        <div style={{ textAlign: 'center', marginTop: 50, color: colors.error }}>
          Không tìm thấy tài liệu!
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', background: '#fffffe', fontFamily: 'Montserrat' }}>
      <Header />
      <div style={{ height: '130px' }}></div>
      
      <div style={{ maxWidth: '1600px', margin: '0 auto', padding: '20px' }}>
        {/* Top Section: Breadcrumb, Stats, Actions */}
        <div style={{ marginBottom: '30px' }}>
          {/* Breadcrumb */}
          <div style={{ fontSize: '13px', color: '#888', marginBottom: '15px' }}>
            <span onClick={() => navigate('/')} style={{ cursor: 'pointer', color: colors.button }}>
              Trang chủ
            </span>
            {' » '}
            <span style={{ color: colors.headline }}>{document.category}</span>
            {' » '}
            <span style={{ color: '#666' }}>{document.title.length > 30 ? document.title.substring(0, 30) + '...' : document.title}</span>
          </div>
        </div>

        {/* Main Layout - 3 Columns */}
        <div style={{ display: 'flex', gap: '20px' }}>
          
          {/* LEFT COLUMN - Document Info (360px, sticky, scrollable) */}
          <div style={{ 
            width: '360px',
            flexShrink: 0,
            position: 'sticky',
            top: '150px',
            alignSelf: 'flex-start',
            maxHeight: 'calc(100vh - 180px)',
            overflowY: 'auto',
            paddingRight: '10px'
          }}>
            <div style={{
              background: '#fff',
              borderRadius: '8px',
              padding: '25px',
              boxShadow: '0 2px 8px rgba(0,0,0,0.06)'
            }}>
              {/* Document Title */}
              <h1 style={{ 
                color: '#133a5c', 
                fontSize: '22px', 
                fontWeight: 'bold', 
                marginBottom: '20px',
                lineHeight: '1.3'
              }}>
                {document.title}
              </h1>

              {/* Description */}
              <div style={{ marginBottom: '20px' }}>
                <div style={{ fontSize: '14px', color: '#133a5c', fontWeight: 'bold', marginBottom: '10px' }}>
                  Mô tả:
                </div>
                <p style={{ color: colors.paragraph, lineHeight: '1.6', fontSize: '14px', margin: 0 }}>
                  {document.description}
                </p>
              </div>

              {/* Tags */}
              <div style={{ marginBottom: '20px' }}>
                <div style={{ fontSize: '14px', color: '#133a5c', fontWeight: 'bold', marginBottom: '10px' }}>
                  Chủ đề:
                </div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                  {(document.tags || []).filter(Boolean).map((tag, idx) => (
                    <span key={idx} style={{
                      background: '#e8f4f8',
                      color: '#133a5c',
                      padding: '6px 12px',
                      borderRadius: '20px',
                      fontSize: '12px',
                      cursor: 'pointer',
                      transition: 'all 0.2s'
                    }}
                    onMouseEnter={(e) => {
                      e.target.style.background = '#4ba3d6';
                      e.target.style.color = '#fff';
                    }}
                    onMouseLeave={(e) => {
                      e.target.style.background = '#e8f4f8';
                      e.target.style.color = '#133a5c';
                    }}
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>

              {/* Stats */}
              <div style={{ 
                display: 'flex', 
                gap: '15px', 
                marginBottom: '20px', 
                paddingBottom: '20px', 
                borderBottom: '1px solid #eee' 
              }}>
                <div style={{ textAlign: 'center', flex: 1 }}>
                  <div style={{ fontSize: '18px', fontWeight: 'bold', color: '#133a5c' }}>
                    {document.views || 0}
                  </div>
                  <div style={{ fontSize: '12px', color: '#888' }}>Lượt xem</div>
                </div>
                <div style={{ textAlign: 'center', flex: 1 }}>
                  <div style={{ fontSize: '18px', fontWeight: 'bold', color: '#133a5c' }}>
                    {document.downloads || 0}
                  </div>
                  <div style={{ fontSize: '12px', color: '#888' }}>Lượt tải</div>
                </div>
              </div>

              {/* AI Question Button */}
              <div style={{ marginBottom: '20px', paddingBottom: '20px', borderBottom: '1px solid #eee' }}>
                <button
                  onClick={() => setShowAIQuestion(true)}
                  disabled={aiQuestionLoading}
                  style={{
                    width: '100%',
                    padding: '12px',
                    background: colors.button,
                    color: '#fff',
                    border: 'none',
                    borderRadius: '8px',
                    fontSize: '14px',
                    fontWeight: 'bold',
                    cursor: aiQuestionLoading ? 'not-allowed' : 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px',
                    transition: 'all 0.2s',
                    opacity: aiQuestionLoading ? 0.6 : 1
                  }}
                  onMouseEnter={(e) => {
                    if (!aiQuestionLoading) {
                      e.currentTarget.style.background = '#3a8bb5';
                      e.currentTarget.style.transform = 'translateY(-2px)';
                      e.currentTarget.style.boxShadow = '0 4px 12px rgba(75, 163, 214, 0.3)';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!aiQuestionLoading) {
                      e.currentTarget.style.background = colors.button;
                      e.currentTarget.style.transform = 'translateY(0)';
                      e.currentTarget.style.boxShadow = 'none';
                    }
                  }}
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M21 15C21 15.5304 20.7893 16.0391 20.4142 16.4142C20.0391 16.7893 19.5304 17 19 17H7L3 21V5C3 4.46957 3.21071 3.96086 3.58579 3.58579C3.96086 3.21071 4.46957 3 5 3H19C19.5304 3 20.0391 3.21071 20.4142 3.58579C20.7893 3.96086 21 4.46957 21 5V15Z" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                  <span>Hỏi AI</span>
                </button>
              </div>

              {/* Purchase Button - Moved after AI Question */}
              {document.isPaid && !isPurchased && (
                <div style={{ marginBottom: '20px', paddingBottom: '20px', borderBottom: '1px solid #eee' }}>
                  <button
                    onClick={() => setShowPurchaseModal(true)}
                    style={{
                      width: '100%',
                      padding: '12px',
                      background: `linear-gradient(135deg, ${colors.error} 0%, ${colors.tertiary} 100%)`,
                      color: '#fff',
                      border: 'none',
                      borderRadius: '8px',
                      fontSize: '14px',
                      fontWeight: 'bold',
                      cursor: 'pointer',
                      boxShadow: '0 4px 12px rgba(232, 76, 97, 0.3)',
                      transition: 'all 0.2s'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.transform = 'translateY(-2px)';
                      e.currentTarget.style.boxShadow = '0 6px 16px rgba(232, 76, 97, 0.4)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.transform = 'translateY(0)';
                      e.currentTarget.style.boxShadow = '0 4px 12px rgba(232, 76, 97, 0.3)';
                    }}
                  >
                    💳 Mua tài liệu ({document.price} DP)
                  </button>
                </div>
              )}

              {/* Rating */}
              <div style={{ marginBottom: '20px', paddingBottom: '20px', borderBottom: '1px solid #eee' }}>
                <div style={{ fontSize: '14px', color: colors.headline, marginBottom: '10px', fontWeight: 'bold' }}>
                  ⭐ Đánh giá
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '15px' }}>
                  <div style={{ fontSize: '20px', fontWeight: 'bold', color: colors.headline }}>
                    {document.averageRating || '0.0'}
                  </div>
                  <div>
                    {'⭐'.repeat(Math.round(document.averageRating || 0))}
                    {'☆'.repeat(5 - Math.round(document.averageRating || 0))}
                  </div>
                </div>
                <div style={{ fontSize: '13px', color: colors.text2, marginBottom: '8px' }}>
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

              {/* Action Buttons */}
              <div style={{ 
                display: 'flex', 
                gap: '10px', 
                marginBottom: '20px',
                justifyContent: 'center'
              }}>
                <button 
                  onClick={handleSave}
                  disabled={savingDocument}
                  title={savingDocument ? 'Đang lưu...' : (isSaved ? 'Đã lưu' : 'Lưu tài liệu')}
                  style={{
                    width: '48px',
                    height: '48px',
                    padding: '0',
                    background: isSaved ? colors.warning : '#fff',
                    color: colors.headline,
                    border: `2px solid ${isSaved ? colors.warning : colors.headline}`,
                    borderRadius: '8px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: savingDocument ? 'not-allowed' : 'pointer',
                    opacity: savingDocument ? 0.6 : 1,
                    transition: 'all 0.2s'
                  }}
                  onMouseEnter={(e) => {
                    if (!savingDocument) {
                      e.currentTarget.style.transform = 'scale(1.05)';
                      e.currentTarget.style.boxShadow = '0 2px 8px rgba(9, 64, 103, 0.2)';
                    }
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'scale(1)';
                    e.currentTarget.style.boxShadow = 'none';
                  }}
                >
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M19 21L12 16L5 21V5C5 4.46957 5.21071 3.96086 5.58579 3.58579C5.96086 3.21071 6.46957 3 7 3H17C17.5304 3 18.0391 3.21071 18.4142 3.58579C18.7893 3.96086 19 4.46957 19 5V21Z" stroke={colors.headline} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </button>
                <button 
                  onClick={handleDownload}
                  title="Tải xuống"
                  style={{
                    width: '48px',
                    height: '48px',
                    padding: '0',
                    background: '#fff',
                    color: colors.headline,
                    border: `2px solid ${colors.headline}`,
                    borderRadius: '8px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer',
                    transition: 'all 0.2s'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'scale(1.05)';
                    e.currentTarget.style.boxShadow = '0 2px 8px rgba(9, 64, 103, 0.2)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'scale(1)';
                    e.currentTarget.style.boxShadow = 'none';
                  }}
                >
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M21 15V19C21 19.5304 20.7893 20.0391 20.4142 20.4142C20.0391 20.7893 19.5304 21 19 21H5C4.46957 21 3.96086 20.7893 3.58579 20.4142C3.21071 20.0391 3 19.5304 3 19V15" stroke={colors.headline} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M7 10L12 15L17 10" stroke={colors.headline} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M12 15V3" stroke={colors.headline} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </button>
                {isLoggedIn && currentUserRole !== 'admin' && (
                  <button
                    onClick={() => setShowReportDocumentModal(true)}
                    title="Báo cáo tài liệu"
                    style={{
                      width: '48px',
                      height: '48px',
                      padding: '0',
                      background: '#fff',
                      color: '#094067',
                      border: '2px solid #094067',
                      borderRadius: '8px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      cursor: 'pointer',
                      transition: 'all 0.2s'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.transform = 'scale(1.05)';
                      e.currentTarget.style.boxShadow = '0 2px 8px rgba(9, 64, 103, 0.2)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.transform = 'scale(1)';
                      e.currentTarget.style.boxShadow = 'none';
                    }}
                  >
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M4 15C4 15 5 14 8 14C11 14 13 16 16 16C19 16 20 15 20 15V3C20 3 19 4 16 4C13 4 11 2 8 2C5 2 4 3 4 3V15Z" stroke={colors.headline} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
                      <path d="M4 22L4 15" stroke={colors.headline} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </button>
                )}
              </div>

              {/* Comments Section */}
              <div style={{ marginTop: '20px', paddingTop: '20px', borderTop: '1px solid #eee' }}>
                <h3 style={{ color: colors.headline, marginBottom: '15px', fontSize: '16px' }}>
                  💬 Bình luận ({comments.length})
                </h3>

                <div style={{ marginBottom: '20px' }}>
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
                    background: isLoggedIn ? colors.button : colors.border,
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
                <div style={{ maxHeight: '400px', overflowY: 'auto' }}>
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
                          <div style={{ position: 'relative', width: '40px', height: '40px', flexShrink: 0 }}>
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
                              position: 'absolute',
                              top: 0,
                              left: 0,
                              zIndex: 0
                            }}>
                              {(comment.user?.username || 'A')[0].toUpperCase()}
                            </div>
                            {comment.user?.avatarUrl && (
                              <img
                                src={comment.user.avatarUrl.startsWith('http') 
                                  ? comment.user.avatarUrl 
                                  : `http://localhost:5000${comment.user.avatarUrl}`}
                                alt={comment.user?.username || 'Avatar'}
                                style={{
                                  width: '40px',
                                  height: '40px',
                                  borderRadius: '50%',
                                  objectFit: 'cover',
                                  position: 'absolute',
                                  top: 0,
                                  left: 0,
                                  zIndex: 1
                                }}
                                onError={(e) => {
                                  e.target.style.display = 'none';
                                }}
                              />
                            )}
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
                          {/* ✨ Report button - ẩn khi là admin */}
                          {isLoggedIn && currentUserRole !== 'admin' && comment.user?._id !== currentUserId && (
                            <button
                              onClick={() => {
                                setReportingCommentId(comment._id);
                                setShowReportCommentModal(true);
                              }}
                              title="Báo cáo bình luận"
                              style={{
                                width: '32px',
                                height: '32px',
                                padding: '0',
                                background: '#fff',
                                border: '2px solid #094067',
                                borderRadius: '6px',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                cursor: 'pointer',
                                transition: 'all 0.2s'
                              }}
                              onMouseEnter={(e) => {
                                e.currentTarget.style.transform = 'scale(1.05)';
                                e.currentTarget.style.boxShadow = '0 2px 6px rgba(9, 64, 103, 0.2)';
                              }}
                              onMouseLeave={(e) => {
                                e.currentTarget.style.transform = 'scale(1)';
                                e.currentTarget.style.boxShadow = 'none';
                              }}
                            >
                              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M4 15C4 15 5 14 8 14C11 14 13 16 16 16C19 16 20 15 20 15V3C20 3 19 4 16 4C13 4 11 2 8 2C5 2 4 3 4 3V15Z" stroke="#094067" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
                                <path d="M4 22L4 15" stroke="#094067" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
                              </svg>
                            </button>
                          )}

                          {/* Nút Sửa - chỉ cho chủ bình luận (không cho admin sửa bình luận người khác) */}
                          {isLoggedIn && (
                              comment.user?._id?.toString() === currentUserId ||
                              comment.user?.id?.toString() === currentUserId ||
                              comment.user?._id === currentUserId ||
                              comment.user?.id === currentUserId
                            ) && (
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
                                Sửa
                              </button>
                          )}

                          {/* Nút Xóa - cho chủ bình luận hoặc admin */}
                          {isLoggedIn && (
                              comment.user?._id?.toString() === currentUserId ||
                              comment.user?.id?.toString() === currentUserId ||
                              comment.user?._id === currentUserId ||
                              comment.user?.id === currentUserId ||
                              currentUserRole === 'admin' 
                            ) && (
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
                                Xóa
                              </button>
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
                              border: `1px solid ${colors.button}`,
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
                              background: colors.button,
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
                          color: colors.paragraph,
                          fontSize: '14px',
                          lineHeight: '1.6',
                          marginBottom: '10px',
                          marginLeft: '50px'
                        }}>
                          {comment.content}
                        </div>
                      )}

                      {/* Comment Actions */}
                      <div style={{ display: 'flex', gap: '15px', alignItems: 'center', marginLeft: '50px' }}>
                        <button
                          onClick={() => handleLikeComment(comment._id)}
                          title={`Thích (${comment.likes?.length || 0})`}
                          disabled={!isLoggedIn}
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '6px',
                            background: 'none',
                            border: 'none',
                            cursor: isLoggedIn ? 'pointer' : 'not-allowed',
                            padding: '4px 8px',
                            borderRadius: '6px',
                            transition: 'all 0.2s',
                            opacity: isLoggedIn ? 1 : 0.5
                          }}
                          onMouseEnter={(e) => {
                            if (isLoggedIn) {
                              e.currentTarget.style.background = '#f0f0f0';
                            }
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.background = 'none';
                          }}
                        >
                          <svg width="20" height="20" viewBox="0 0 24 24" fill={comment.likes?.some(like => like._id === currentUserId) ? '#e84c61' : 'none'} xmlns="http://www.w3.org/2000/svg">
                            <path d="M20.84 4.61C20.3292 4.099 19.7228 3.69364 19.0554 3.41708C18.3879 3.14052 17.6725 2.99817 16.95 2.99817C16.2275 2.99817 15.5121 3.14052 14.8446 3.41708C14.1772 3.69364 13.5708 4.099 13.06 4.61L12 5.67L10.94 4.61C9.9083 3.57831 8.50903 2.99871 7.05 2.99871C5.59096 2.99871 4.19169 3.57831 3.16 4.61C2.1283 5.64169 1.54871 7.04097 1.54871 8.5C1.54871 9.95903 2.1283 11.3583 3.16 12.39L4.22 13.45L12 21.23L19.78 13.45L20.84 12.39C21.351 11.8792 21.7564 11.2728 22.0329 10.6054C22.3095 9.93789 22.4518 9.22248 22.4518 8.5C22.4518 7.77752 22.3095 7.0621 22.0329 6.39464C21.7564 5.72718 21.351 5.12075 20.84 4.61Z" stroke={comment.likes?.some(like => like._id === currentUserId) ? '#e84c61' : '#094067'} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
                          </svg>
                          <span style={{ 
                            fontSize: '13px', 
                            color: comment.likes?.some(like => like._id === currentUserId) ? '#e84c61' : '#094067',
                            fontWeight: comment.likes?.some(like => like._id === currentUserId) ? 'bold' : 'normal'
                          }}>
                            {comment.likes?.length || 0}
                          </span>
                        </button>
                        
                        <button
                          onClick={() => setReplyingTo(replyingTo === comment._id ? null : comment._id)}
                          title="Trả lời"
                          disabled={!isLoggedIn}
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            background: 'none',
                            border: 'none',
                            cursor: isLoggedIn ? 'pointer' : 'not-allowed',
                            padding: '4px 8px',
                            borderRadius: '6px',
                            transition: 'all 0.2s',
                            opacity: isLoggedIn ? 1 : 0.5
                          }}
                          onMouseEnter={(e) => {
                            if (isLoggedIn) {
                              e.currentTarget.style.background = '#f0f0f0';
                            }
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.background = 'none';
                          }}
                        >
                          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M21 15C21 15.5304 20.7893 16.0391 20.4142 16.4142C20.0391 16.7893 19.5304 17 19 17H7L3 21V5C3 4.46957 3.21071 3.96086 3.58579 3.58579C3.96086 3.21071 4.46957 3 5 3H19C19.5304 3 20.0391 3.21071 20.4142 3.58579C20.7893 3.96086 21 4.46957 21 5V15Z" stroke="#094067" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
                          </svg>
                        </button>
                      </div>

                      {/* Reply Input */}
                      {replyingTo === comment._id && (
                        <div style={{ marginTop: '15px', marginLeft: '50px', paddingLeft: '20px', borderLeft: `3px solid ${colors.button}` }}>
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
                              background: colors.button,
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
                                  <div style={{ position: 'relative', width: '32px', height: '32px', flexShrink: 0 }}>
                                    <div style={{
                                      width: '32px',
                                      height: '32px',
                                      borderRadius: '50%',
                                      background: `linear-gradient(135deg, ${colors.button}, ${colors.success})`,
                                      display: 'flex',
                                      alignItems: 'center',
                                      justifyContent: 'center',
                                      color: '#fff',
                                      fontWeight: 'bold',
                                      fontSize: '13px',
                                      position: 'absolute',
                                      top: 0,
                                      left: 0,
                                      zIndex: 0
                                    }}>
                                      {(reply.user?.username || 'A')[0].toUpperCase()}
                                    </div>
                                    {reply.user?.avatarUrl && (
                                      <img
                                        src={reply.user.avatarUrl.startsWith('http') 
                                          ? reply.user.avatarUrl 
                                          : `http://localhost:5000${reply.user.avatarUrl}`}
                                        alt={reply.user?.username || 'Avatar'}
                                        style={{
                                          width: '32px',
                                          height: '32px',
                                          borderRadius: '50%',
                                          objectFit: 'cover',
                                          position: 'absolute',
                                          top: 0,
                                          left: 0,
                                          zIndex: 1
                                        }}
                                        onError={(e) => {
                                          e.target.style.display = 'none';
                                        }}
                                      />
                                    )}
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
                                
                               {isLoggedIn && (
                                reply.user?._id?.toString() === currentUserId ||  // ← _id và thêm ()
                                reply.user?.id?.toString() === currentUserId ||   // ← thêm ()
                                reply.user?._id === currentUserId ||               // ← _id
                                reply.user?.id === currentUserId ||
                                currentUserRole === 'admin'
                              ) && (
                                <button
                                  onClick={() => handleDeleteComment(reply.id)}
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
                                title={`Thích (${reply.likes?.length || 0})`}
                                disabled={!isLoggedIn}
                                style={{
                                  display: 'flex',
                                  alignItems: 'center',
                                  gap: '6px',
                                  background: 'none',
                                  border: 'none',
                                  cursor: isLoggedIn ? 'pointer' : 'not-allowed',
                                  padding: '4px 8px',
                                  borderRadius: '6px',
                                  marginTop: '6px',
                                  marginLeft: '40px',
                                  transition: 'all 0.2s',
                                  opacity: isLoggedIn ? 1 : 0.5
                                }}
                                onMouseEnter={(e) => {
                                  if (isLoggedIn) {
                                    e.currentTarget.style.background = '#f0f0f0';
                                  }
                                }}
                                onMouseLeave={(e) => {
                                  e.currentTarget.style.background = 'none';
                                }}
                              >
                                <svg width="18" height="18" viewBox="0 0 24 24" fill={reply.likes?.some(like => like._id === currentUserId) ? '#e84c61' : 'none'} xmlns="http://www.w3.org/2000/svg">
                                  <path d="M20.84 4.61C20.3292 4.099 19.7228 3.69364 19.0554 3.41708C18.3879 3.14052 17.6725 2.99817 16.95 2.99817C16.2275 2.99817 15.5121 3.14052 14.8446 3.41708C14.1772 3.69364 13.5708 4.099 13.06 4.61L12 5.67L10.94 4.61C9.9083 3.57831 8.50903 2.99871 7.05 2.99871C5.59096 2.99871 4.19169 3.57831 3.16 4.61C2.1283 5.64169 1.54871 7.04097 1.54871 8.5C1.54871 9.95903 2.1283 11.3583 3.16 12.39L4.22 13.45L12 21.23L19.78 13.45L20.84 12.39C21.351 11.8792 21.7564 11.2728 22.0329 10.6054C22.3095 9.93789 22.4518 9.22248 22.4518 8.5C22.4518 7.77752 22.3095 7.0621 22.0329 6.39464C21.7564 5.72718 21.351 5.12075 20.84 4.61Z" stroke={reply.likes?.some(like => like._id === currentUserId) ? '#e84c61' : '#094067'} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
                                </svg>
                                <span style={{ 
                                  fontSize: '12px', 
                                  color: reply.likes?.some(like => like._id === currentUserId) ? '#e84c61' : '#094067',
                                  fontWeight: reply.likes?.some(like => like._id === currentUserId) ? 'bold' : 'normal'
                                }}>
                                  {reply.likes?.length || 0}
                                </span>
                              </button>
                            </div>
                          ))}
                        </div>
                      )}
                      </div>
                    ))
                  ) : (
                    <div style={{ textAlign: 'center', padding: '20px', color: '#888', fontSize: '13px' }}>
                      Chưa có bình luận nào
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* MIDDLE COLUMN - Document Viewer (1000px) */}
          <div style={{ width: '900px', flexShrink: 0 }}>
            {/* Document Preview */}
            <div style={{
              background: '#fff',
              borderRadius: '8px',
              padding: '20px',
              marginBottom: '30px',
              boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
              position: 'relative'
            }}>
              {canEdit && (
                <div style={{ position: 'absolute', top: '20px', right: '20px', zIndex: 10, display: 'flex', gap: '10px' }}>
                  <button 
                    style={{
                      padding: '8px 18px',
                      background: colors.button,
                      color: '#fff',
                      border: 'none',
                      borderRadius: '6px',
                      fontSize: '14px',
                      fontWeight: 'bold',
                      cursor: 'pointer'
                    }} 
                    onClick={() => setShowEditPopup(true)}
                  >
                    Chỉnh sửa
                  </button>
                  <button 
                    style={{
                      padding: '8px 18px',
                      background: '#fff',
                      color: colors.error,
                      border: `2px solid ${colors.error}`,
                      borderRadius: '6px',
                      fontSize: '14px',
                      fontWeight: 'bold',
                      cursor: 'pointer'
                    }} 
                    onClick={() => setShowDeleteConfirm(true)}
                  >
                    Xóa tài liệu
                  </button>
                </div>
              )}
              {renderDocumentViewer()}
            </div>
          </div>

          {/* RIGHT COLUMN - Related Documents (360px) */}
          <div style={{ 
            width: '300px',
            flexShrink: 0,
            position: 'sticky',
            top: '150px',
            alignSelf: 'flex-start',
            maxHeight: 'calc(100vh - 180px)',
            overflowY: 'auto'
          }}>
            <div style={{
              background: '#fff',
              borderRadius: '8px',
              padding: '10px',
              boxShadow: '0 2px 8px rgba(0,0,0,0.06)'
            }}>
              <h2 style={{ color: '#133a5c', fontSize: '20px', marginBottom: '20px', fontWeight: 'bold' }}>
                Tài liệu liên quan
              </h2>
              
              {relatedDocuments.length > 0 ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                  {relatedDocuments.map((doc) => (
                    <div
                      key={doc._id}
                      onClick={() => navigate(`/document/${doc._id}`)}
                      style={{
                        display: 'flex',
                        gap: '12px',
                        padding: '12px',
                        background: '#f8f9fa',
                        borderRadius: '8px',
                        cursor: 'pointer',
                        transition: 'all 0.2s',
                        border: '1px solid transparent'
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.background = '#e8f4f8';
                        e.currentTarget.style.borderColor = colors.button;
                        e.currentTarget.style.transform = 'translateX(4px)';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.background = '#f8f9fa';
                        e.currentTarget.style.borderColor = 'transparent';
                        e.currentTarget.style.transform = 'translateX(0)';
                      }}
                    >
                      {/* Thumbnail */}
                      <div style={{
                        width: '80px',
                        height: '100px',
                        background: '#b4cbe0',
                        borderRadius: '6px',
                        flexShrink: 0,
                        overflow: 'hidden',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '32px'
                      }}>
                        {doc.coverImage ? (
                          <img 
                            src={doc.coverImage} 
                            alt={doc.title}
                            style={{
                              width: '100%',
                              height: '100%',
                              objectFit: 'cover'
                            }}
                            onError={(e) => {
                              e.target.style.display = 'none';
                            }}
                          />
                        ) : (
                          '📄'
                        )}
                      </div>
                      
                      {/* Content */}
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <h3 style={{
                          color: '#133a5c',
                          fontSize: '14px',
                          fontWeight: '600',
                          marginBottom: '6px',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          display: '-webkit-box',
                          WebkitLineClamp: 2,
                          WebkitBoxOrient: 'vertical',
                          lineHeight: '1.4'
                        }}>
                          {doc.title}
                        </h3>
                        <div style={{
                          fontSize: '12px',
                          color: '#888',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '4px'
                        }}>
                          <span>📄</span>
                          <span>{doc.fileType?.includes('pdf') 
                            ? Math.max(1, Math.floor((doc.fileSize || 0) / (50 * 1024))) 
                            : 1} trang</span>
                        </div>
                      </div>
                      
                      {/* Bookmark Icon */}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          // TODO: Handle bookmark
                        }}
                        style={{
                          background: 'transparent',
                          border: 'none',
                          cursor: 'pointer',
                          fontSize: '18px',
                          padding: '4px',
                          alignSelf: 'flex-start'
                        }}
                        title="Lưu tài liệu"
                      >
                        🔖
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <div style={{ textAlign: 'center', padding: '40px', color: '#888', fontSize: '14px' }}>
                  Chưa có tài liệu liên quan
                </div>
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
        coins={coins}
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

      {/* ✨ NEW: AI Question Modal */}
      {showAIQuestion && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0, 0, 0, 0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 10000,
          padding: '20px'
        }}
        onClick={(e) => {
          if (e.target === e.currentTarget) {
            setShowAIQuestion(false);
            setAiQuestion('');
            setAiAnswer('');
          }
        }}
        >
          <div style={{
            background: '#fff',
            borderRadius: '12px',
            width: '900px',
            maxHeight: '90vh',
            display: 'flex',
            flexDirection: 'column',
            boxShadow: '0 8px 32px rgba(0,0,0,0.3)',
            overflow: 'hidden'
          }}>
            {/* Modal Header */}
            <div style={{
              padding: '20px 30px',
              borderBottom: '1px solid #eee',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              background: '#4ba3d6',
              color: '#fff'
            }}>
              <h2 style={{ 
                margin: 0, 
                fontSize: '20px', 
                fontWeight: 'bold',
                display: 'flex',
                alignItems: 'center',
                gap: '10px'
              }}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M21 15C21 15.5304 20.7893 16.0391 20.4142 16.4142C20.0391 16.7893 19.5304 17 19 17H7L3 21V5C3 4.46957 3.21071 3.96086 3.58579 3.58579C3.96086 3.21071 4.46957 3 5 3H19C19.5304 3 20.0391 3.21071 20.4142 3.58579C20.7893 3.96086 21 4.46957 21 5V15Z" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                Hỏi AI về tài liệu
              </h2>
              <button
                onClick={() => {
                  setShowAIQuestion(false);
                  setAiQuestion('');
                  setAiAnswer('');
                }}
                style={{
                  background: 'transparent',
                  border: 'none',
                  color: '#fff',
                  fontSize: '24px',
                  cursor: 'pointer',
                  padding: '0',
                  width: '32px',
                  height: '32px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  borderRadius: '4px',
                  transition: 'background 0.2s'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = 'rgba(255, 255, 255, 0.2)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'transparent';
                }}
              >
                ×
              </button>
            </div>

            {/* Modal Content */}
            <div style={{
              padding: '30px',
              overflowY: 'auto',
              flex: 1,
              maxHeight: 'calc(90vh - 200px)',
              display: 'flex',
              flexDirection: 'column',
              gap: '20px'
            }}>
              {/* Question Input */}
              <div>
                <label style={{
                  display: 'block',
                  fontSize: '14px',
                  fontWeight: 'bold',
                  color: '#133a5c',
                  marginBottom: '10px'
                }}>
                  Câu hỏi của bạn:
                </label>
                <textarea
                  value={aiQuestion}
                  onChange={(e) => setAiQuestion(e.target.value)}
                  placeholder="Ví dụ: Nội dung chính của tài liệu này là gì? Hoặc: Tài liệu này đề cập đến những chủ đề nào?"
                  rows="3"
                  style={{
                    width: '100%',
                    padding: '12px',
                    border: '2px solid #ddd',
                    borderRadius: '8px',
                    fontSize: '14px',
                    fontFamily: 'Montserrat',
                    resize: 'vertical',
                    boxSizing: 'border-box',
                    outline: 'none',
                    transition: 'border-color 0.2s'
                  }}
                  onFocus={(e) => {
                    e.target.style.borderColor = colors.button;
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = '#ddd';
                  }}
                />
                <button
                  onClick={handleAIQuestion}
                  disabled={!aiQuestion.trim() || aiQuestionLoading}
                  style={{
                    marginTop: '15px',
                    padding: '12px 24px',
                    background: (!aiQuestion.trim() || aiQuestionLoading) ? colors.border : colors.button,
                    color: '#fff',
                    border: 'none',
                    borderRadius: '8px',
                    fontSize: '14px',
                    fontWeight: 'bold',
                    cursor: (!aiQuestion.trim() || aiQuestionLoading) ? 'not-allowed' : 'pointer',
                    transition: 'all 0.2s',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    marginLeft: 'auto'
                  }}
                  onMouseEnter={(e) => {
                    if (aiQuestion.trim() && !aiQuestionLoading) {
                      e.currentTarget.style.background = '#3a8bb5';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (aiQuestion.trim() && !aiQuestionLoading) {
                      e.currentTarget.style.background = colors.button;
                    }
                  }}
                >
                  {aiQuestionLoading ? (
                    <>
                      <div style={{
                        width: '16px',
                        height: '16px',
                        border: '2px solid #fff',
                        borderTop: '2px solid transparent',
                        borderRadius: '50%',
                        animation: 'spin 1s linear infinite'
                      }}></div>
                      <span>Đang xử lý...</span>
                    </>
                  ) : (
                    <>
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M22 2L11 13" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
                        <path d="M22 2L15 22L11 13L2 9L22 2Z" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                      <span>Gửi câu hỏi</span>
                    </>
                  )}
                </button>
              </div>

              {/* Answer Display */}
              {aiAnswer && (
                <div style={{
                  padding: '20px',
                  background: '#f8f9fa',
                  borderRadius: '8px',
                  border: '1px solid #e0e0e0'
                }}>
                  <div style={{
                    fontSize: '14px',
                    fontWeight: 'bold',
                    color: '#133a5c',
                    marginBottom: '15px'
                  }}>
                    Câu trả lời:
                  </div>
                  {aiQuestionLoading ? (
                    <div style={{
                      textAlign: 'center',
                      padding: '20px',
                      color: '#666'
                    }}>
                      <div style={{
                        display: 'inline-block',
                        width: '30px',
                        height: '30px',
                        border: '3px solid #f3f3f3',
                        borderTop: `3px solid ${colors.button}`,
                        borderRadius: '50%',
                        animation: 'spin 1s linear infinite',
                        marginBottom: '15px'
                      }}></div>
                      <p style={{ margin: 0, fontSize: '14px' }}>Đang tìm câu trả lời...</p>
                    </div>
                  ) : (
                    <div style={{
                      color: '#2d4a67',
                      lineHeight: '1.8',
                      fontSize: '15px',
                      whiteSpace: 'pre-wrap',
                      wordWrap: 'break-word'
                    }}>
                      {aiAnswer}
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div style={{
              padding: '15px 30px',
              borderTop: '1px solid #eee',
              display: 'flex',
              justifyContent: 'flex-end',
              background: '#f8f9fa'
            }}>
              <button
                onClick={() => {
                  setShowAIQuestion(false);
                  setAiQuestion('');
                  setAiAnswer('');
                }}
                style={{
                  padding: '10px 24px',
                  background: '#4ba3d6',
                  color: '#fff',
                  border: 'none',
                  borderRadius: '6px',
                  fontSize: '14px',
                  fontWeight: 'bold',
                  cursor: 'pointer',
                  transition: 'all 0.2s'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = '#3a8bb5';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = '#4ba3d6';
                }}
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}

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

      {showDeleteConfirm && 
      (<div style={{position:'fixed',top:0,left:0,right:0,bottom:0,background:'rgba(0,0,0,0.5)',
      display:'flex',alignItems:'center',justifyContent:'center',zIndex:9999}}>
          <div style={{background:'#fff',padding:'30px',borderRadius:'12px',width:'400px',maxWidth:'90%',textAlign:'center'}}>
          <h3 style={{color: colors.error, marginBottom:'20px'}}>⚠️ Xác nhận xóa</h3><p style={{color: colors.paragraph, marginBottom:'25px'}}
              >Bạn có chắc muốn xóa tài liệu này?<br/>
              <strong>Hành động này không thể hoàn tác!</strong>
          </p><div style={{display:'flex',gap:'10px',justifyContent:'center'}}>
            <button onClick={handleDeleteDocument} 
          tyle={{padding:'12px 24px',
                  background: colors.error, color:'#fff', border:'none', borderRadius:'6px', fontSize:'14px', fontWeight:'bold', cursor:'pointer'}}
                  >Xóa
                  </button>
                  <button onClick={()=>setShowDeleteConfirm(false)} 
                  style={{padding:'12px 24px',background:'#f5f5f5',color:'#333',
                  border:'1px solid #ddd',borderRadius:'6px',fontSize:'14px',fontWeight:'bold',cursor:'pointer'}}
                  >Hủy</button>
                  </div>
                  </div>
                  </div>)}
 
      <Footer />
    </div>
  );
}

function InfoRow({ label, value }) {
  return (
    <div style={{ marginBottom: '15px' }}>
      <div style={{ color: '#888', fontSize: '13px', marginBottom: '5px' }}>{label}</div>
      <div style={{ color: colors.headline, fontSize: '15px', fontWeight: 'bold' }}>
        {value}
      </div>
    </div>
  );
}