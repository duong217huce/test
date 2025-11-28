import { useState } from 'react';
import { colors } from '../theme/colors';

export default function ReportCommentModal({ isOpen, onClose, onSubmit, commentId }) {
  const [reasons, setReasons] = useState({
    violateStandards: false,
    offensiveSpeech: false,
    spam: false
  });
  const [additionalReason, setAdditionalReason] = useState('');
  const [submitting, setSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleCheckboxChange = (key) => {
    setReasons(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  const handleSubmit = async () => {
    const hasReason = Object.values(reasons).some(v => v) || additionalReason.trim();
    
    if (!hasReason) {
      alert('Vui lòng chọn ít nhất một lý do hoặc nhập lý do cụ thể!');
      return;
    }

    setSubmitting(true);
    
    const reportData = {
      commentId,
      reasons: {
        ...reasons,
        additional: additionalReason.trim()
      }
    };

    try {
      await onSubmit(reportData);
      // Reset form
      setReasons({
        violateStandards: false,
        offensiveSpeech: false,
        spam: false
      });
      setAdditionalReason('');
    } catch (error) {
      console.error('Error submitting report:', error);
    } finally {
      setSubmitting(false);
    }
  };

  const handleCancel = () => {
    // Reset form
    setReasons({
      violateStandards: false,
      offensiveSpeech: false,
      spam: false
    });
    setAdditionalReason('');
    onClose();
  };

  return (
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
      fontFamily: 'Montserrat'
    }}>
      <div style={{
        background: colors.background2,
        borderRadius: '12px',
        padding: '30px',
        width: '500px',
        maxWidth: '90%',
        boxShadow: '0 8px 32px rgba(0,0,0,0.2)'
      }}>
        {/* Header */}
        <h3 style={{
          color: colors.text,
          fontSize: '20px',
          fontWeight: '600',
          marginBottom: '20px',
          textAlign: 'center'
        }}>
          🚨 Báo cáo bình luận
        </h3>

        {/* Checkboxes */}
        <div style={{
          marginBottom: '20px'
        }}>
          <p style={{
            color: colors.text2,
            fontSize: '14px',
            marginBottom: '12px'
          }}>
            Chọn lý do báo cáo:
          </p>

          <label style={{
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            marginBottom: '12px',
            cursor: 'pointer',
            color: colors.text,
            fontSize: '14px'
          }}>
            <input
              type="checkbox"
              checked={reasons.violateStandards}
              onChange={() => handleCheckboxChange('violateStandards')}
              style={{
                width: '18px',
                height: '18px',
                cursor: 'pointer',
                accentColor: colors.accent2
              }}
            />
            Vi phạm tiêu chuẩn cộng đồng
          </label>

          <label style={{
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            marginBottom: '12px',
            cursor: 'pointer',
            color: colors.text,
            fontSize: '14px'
          }}>
            <input
              type="checkbox"
              checked={reasons.offensiveSpeech}
              onChange={() => handleCheckboxChange('offensiveSpeech')}
              style={{
                width: '18px',
                height: '18px',
                cursor: 'pointer',
                accentColor: colors.accent2
              }}
            />
            Phát ngôn lệch chuẩn/xúc phạm
          </label>

          <label style={{
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            marginBottom: '12px',
            cursor: 'pointer',
            color: colors.text,
            fontSize: '14px'
          }}>
            <input
              type="checkbox"
              checked={reasons.spam}
              onChange={() => handleCheckboxChange('spam')}
              style={{
                width: '18px',
                height: '18px',
                cursor: 'pointer',
                accentColor: colors.accent2
              }}
            />
            Spam/Quảng cáo
          </label>
        </div>

        {/* Additional Reason Textarea */}
        <div style={{ marginBottom: '24px' }}>
          <label style={{
            display: 'block',
            color: colors.text2,
            fontSize: '14px',
            marginBottom: '8px'
          }}>
            Nêu rõ lý do (nếu có):
          </label>
          <textarea
            value={additionalReason}
            onChange={(e) => setAdditionalReason(e.target.value)}
            placeholder="Vui lòng mô tả chi tiết lý do báo cáo..."
            rows="4"
            style={{
              width: '100%',
              padding: '12px',
              background: colors.background3,
              color: colors.text,
              border: `1px solid ${colors.background3}`,
              borderRadius: '8px',
              fontSize: '14px',
              fontFamily: 'Montserrat',
              resize: 'vertical',
              outline: 'none',
              boxSizing: 'border-box'
            }}
          />
        </div>

        {/* Buttons */}
        <div style={{
          display: 'flex',
          gap: '12px'
        }}>
          <button
            onClick={handleCancel}
            disabled={submitting}
            style={{
              flex: 1,
              padding: '12px',
              background: colors.background3,
              color: colors.text2,
              border: 'none',
              borderRadius: '8px',
              fontSize: '15px',
              fontWeight: '600',
              cursor: submitting ? 'not-allowed' : 'pointer',
              transition: 'all 0.3s ease',
              fontFamily: 'Montserrat'
            }}
          >
            Hủy
          </button>
          
          <button
            onClick={handleSubmit}
            disabled={submitting}
            style={{
              flex: 1,
              padding: '12px',
              background: submitting ? colors.text2 : colors.accent3,
              color: colors.text,
              border: 'none',
              borderRadius: '8px',
              fontSize: '15px',
              fontWeight: '600',
              cursor: submitting ? 'not-allowed' : 'pointer',
              transition: 'all 0.3s ease',
              fontFamily: 'Montserrat'
            }}
          >
            {submitting ? 'Đang gửi...' : 'Gửi báo cáo'}
          </button>
        </div>
      </div>
    </div>
  );
}
