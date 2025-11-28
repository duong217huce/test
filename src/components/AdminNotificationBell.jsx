import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { colors } from '../theme/colors';

export default function AdminNotificationBell() {
  const [reports, setReports] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetchReports();
    const interval = setInterval(fetchReports, 30000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
    }

    if (showDropdown) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showDropdown]);

  const fetchReports = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5000/api/admin/reports', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (response.ok) {
        const data = await response.json();
        setReports(data);
        setUnreadCount(data.filter(r => !r.isRead).length);
      }
    } catch (error) {
      console.error('Error fetching reports:', error);
    }
  };

  const handleMarkAsRead = async (reportId) => {
    try {
      const token = localStorage.getItem('token');
      await fetch(`http://localhost:5000/api/admin/reports/${reportId}/mark-read`, {
        method: 'PUT',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      fetchReports();
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const handleDeleteReport = async (reportId) => {
    if (!window.confirm('Xoa bao cao?')) return;
    try {
      const token = localStorage.getItem('token');
      await fetch(`http://localhost:5000/api/admin/reports/${reportId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      fetchReports();
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const handleReportClick = (report) => {
    if (!report.isRead) handleMarkAsRead(report._id);
    navigate(`/document/${report.documentId}`);
    setShowDropdown(false);
  };

  const formatTimeAgo = (date) => {
    const seconds = Math.floor((new Date() - new Date(date)) / 1000);
    if (seconds < 60) return 'Vua xong';
    if (seconds < 3600) return `${Math.floor(seconds / 60)} phut truoc`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)} gio truoc`;
    return new Date(date).toLocaleDateString('vi-VN');
  };

  const getReasonText = (reasons) => {
    const arr = [];
    if (reasons.violateStandards) arr.push('Vi pham');
    if (reasons.offensiveSpeech) arr.push('Xuc pham');
    if (reasons.spam) arr.push('Spam');
    if (reasons.additional) arr.push(reasons.additional);
    return arr.join(', ');
  };

  return (
    <div style={{ position: 'relative' }} ref={dropdownRef}>
      <button
        onClick={() => setShowDropdown(!showDropdown)}
        style={{
          position: 'relative',
          background: 'transparent',
          border: 'none',
          cursor: 'pointer',
          padding: '8px',
          borderRadius: '50%'
        }}
      >
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke={colors.text} strokeWidth="2">
          <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path>
          <path d="M13.73 21a2 2 0 0 1-3.46 0"></path>
        </svg>
        {unreadCount > 0 && (
          <span style={{
            position: 'absolute',
            top: '4px',
            right: '4px',
            background: '#e84c61',
            color: '#fff',
            borderRadius: '50%',
            width: '18px',
            height: '18px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '11px',
            fontWeight: 'bold'
          }}>
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {showDropdown && (
        <div style={{
          position: 'absolute',
          top: '100%',
          right: 0,
          marginTop: '8px',
          width: '400px',
          maxHeight: '500px',
          background: colors.background2,
          borderRadius: '12px',
          boxShadow: '0 8px 32px rgba(0,0,0,0.15)',
          zIndex: 10000,
          overflow: 'hidden',
          fontFamily: 'Montserrat'
        }}>
          <div style={{ padding: '16px 20px', borderBottom: `1px solid ${colors.background3}` }}>
            <h3 style={{ margin: 0, fontSize: '16px', fontWeight: '600', color: colors.text }}>
              Bao cao ({reports.length})
            </h3>
          </div>

          <div style={{ maxHeight: '450px', overflowY: 'auto' }}>
            {reports.length > 0 ? (
              reports.map(report => (
                <div
                  key={report._id}
                  onClick={() => handleReportClick(report)}
                  style={{
                    padding: '16px 20px',
                    borderBottom: `1px solid ${colors.background3}`,
                    background: !report.isRead ? colors.background3 : 'transparent',
                    cursor: 'pointer'
                  }}
                >
                  <div style={{
                    display: 'inline-block',
                    padding: '2px 8px',
                    borderRadius: '4px',
                    fontSize: '11px',
                    fontWeight: '600',
                    marginBottom: '6px',
                    background: report.type === 'document' ? '#fff3cd' : '#d1ecf1'
                  }}>
                    {report.type === 'document' ? 'Tai lieu' : 'Binh luan'}
                  </div>

                  <div style={{ fontSize: '14px', fontWeight: '600', color: colors.text, marginBottom: '4px' }}>
                    {report.documentTitle}
                  </div>

                  {report.commentContent && (
                    <div style={{ fontSize: '13px', color: colors.text2, marginBottom: '6px' }}>
                      "{report.commentContent}"
                    </div>
                  )}

                  <div style={{ fontSize: '12px', color: colors.text2 }}>
                    Ly do: {getReasonText(report.reasons)}
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '8px' }}>
                    <span style={{ fontSize: '12px', color: colors.text2 }}>
                      {formatTimeAgo(report.createdAt)}
                    </span>
                    <button
                      onClick={(e) => { e.stopPropagation(); handleDeleteReport(report._id); }}
                      style={{
                        background: 'none',
                        border: 'none',
                        color: '#e84c61',
                        fontSize: '12px',
                        cursor: 'pointer'
                      }}
                    >
                      Xoa
                    </button>
                  </div>
                </div>
              ))
            ) : (
              <div style={{ padding: '40px', textAlign: 'center', color: colors.text2 }}>
                Chua co bao cao
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
