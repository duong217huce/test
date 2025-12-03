import { useState } from 'react';
import { colors } from '../theme/colors';

const Footer = () => {
  const [copied, setCopied] = useState(false);

  // ✅ Thay đổi thông tin liên hệ của bạn tại đây
  const contactInfo = {
    facebook: 'https://www.facebook.com/pqd07', // Link Facebook
    zalo: '0948830298', // Số điện thoại Zalo
    gmail: 'phqduongg21@gmail.com' // Địa chỉ Gmail
  };

  const handleFacebookClick = () => {
    window.open(contactInfo.facebook, '_blank');
  };

  const handleZaloClick = async () => {
    try {
      await navigator.clipboard.writeText(contactInfo.zalo);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback cho trình duyệt không hỗ trợ
      const textArea = document.createElement('textarea');
      textArea.value = contactInfo.zalo;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleGmailClick = () => {
    // Mở Gmail compose trực tiếp trên web
    window.open(`https://mail.google.com/mail/?view=cm&to=${contactInfo.gmail}`, '_blank');
  };

  const buttonStyle = {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    padding: '10px 20px',
    background: 'transparent',
    border: `2px solid ${colors.background}`,
    borderRadius: '25px',
    color: colors.background,
    fontSize: '14px',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'all 0.3s ease',
  };

  const buttonHoverStyle = {
    background: colors.background,
    color: colors.headline,
  };

  const ContactButton = ({ icon, label, onClick, isZalo }) => {
    const [isHovered, setIsHovered] = useState(false);

    return (
      <button
        onClick={onClick}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        style={{
          ...buttonStyle,
          ...(isHovered ? buttonHoverStyle : {}),
          position: 'relative'
        }}
      >
        <span style={{ fontSize: '18px' }}>{icon}</span>
        <span>{label}</span>
        {isZalo && copied && (
          <span style={{
            position: 'absolute',
            top: '-30px',
            left: '50%',
            transform: 'translateX(-50%)',
            background: colors.success,
            color: '#fff',
            padding: '4px 10px',
            borderRadius: '4px',
            fontSize: '12px',
            whiteSpace: 'nowrap'
          }}>
            ✓ Đã copy số điện thoại!
          </span>
        )}
      </button>
    );
  };

  return (
    <footer style={{
      background: colors.headline,
      color: colors.background,
      padding: '25px 20px',
      marginTop: '60px'
    }}>
      <div style={{
        maxWidth: '1200px',
        margin: '0 auto',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '20px'
      }}>
        {/* Logo */}
        <h2 style={{
          fontSize: '22px',
          fontWeight: 'bold',
          color: colors.button,
          margin: 0
        }}>
          📚 EDUCONNECT
        </h2>
        <p style={{
          fontSize: '14px',
          color: colors.background,
          margin: 0
        }}>
          Educonnect là một trang web giáo dục trực tuyến cung cấp các khóa học online cho các bạn học sinh và sinh viên.
          <br />Mọi thắc mắc xin vui lòng liên hệ theo các thông tin bên dưới.
        </p>

        {/* Contact Buttons */}
        <div style={{
          display: 'flex',
          gap: '12px',
          flexWrap: 'wrap'
        }}>
          <ContactButton 
            icon="📘" 
            label="Facebook" 
            onClick={handleFacebookClick}
          />
          <ContactButton 
            icon="💬" 
            label={`Zalo: ${contactInfo.zalo}`}
            onClick={handleZaloClick}
            isZalo={true}
          />
          <ContactButton 
            icon="📧" 
            label="Gmail" 
            onClick={handleGmailClick}
          />
        </div>
      </div>
    </footer>
  );
};

export default Footer;

