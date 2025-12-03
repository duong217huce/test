import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import Header from './Header';
import Footer from './Footer';
import { showToast } from '../utils/toast';
import { colors } from '../theme/colors';
import { refreshUserData } from '../utils/userUtils';

export default function PaymentCallbackPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [isLoading, setIsLoading] = useState(true);
  const [paymentStatus, setPaymentStatus] = useState(null);

  useEffect(() => {
    const processCallback = async () => {
      const success = searchParams.get('success');
      const amount = searchParams.get('amount');
      const dp = searchParams.get('dp');
      const message = searchParams.get('message');

      if (success === 'true') {
        setPaymentStatus({
          success: true,
          amount: amount ? parseInt(amount) : 0,
          dp: dp ? parseInt(dp) : 0
        });

        // Refresh user data from backend to ensure sync
        await refreshUserData();

        // Trigger custom event to update Header (works in same tab)
        window.dispatchEvent(new Event('coinsUpdated'));
        
        // Also trigger storage event (works across tabs)
        window.dispatchEvent(new Event('storage'));

        showToast(`Nạp tiền thành công! Bạn đã nhận được ${dp || 0} DP`, 'success');
      } else {
        setPaymentStatus({
          success: false,
          message: message || 'Thanh toán thất bại'
        });
        showToast(message || 'Thanh toán thất bại', 'error');
      }

      setIsLoading(false);
    };

    processCallback();
  }, [searchParams]);

  const handleBackToRecharge = () => {
    navigate('/recharge');
  };

  const handleGoHome = () => {
    navigate('/');
  };

  if (isLoading) {
    return (
      <div style={{ minHeight: '100vh', background: '#fffffe', fontFamily: 'Montserrat, sans-serif' }}>
        <Header />
        <div style={{ height: '130px' }}></div>
        <div style={{
          maxWidth: '600px',
          margin: '0 auto',
          padding: '20px',
          textAlign: 'center'
        }}>
          <div style={{
            display: 'inline-block',
            width: '40px',
            height: '40px',
            border: '4px solid #e0e0e0',
            borderTop: '4px solid ' + colors.highlight,
            borderRadius: '50%',
            animation: 'spin 1s linear infinite'
          }}></div>
          <p style={{ marginTop: '20px', color: colors.text2 }}>Đang xử lý...</p>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', background: '#fffffe', fontFamily: 'Montserrat, sans-serif' }}>
      <Header />
      <div style={{ height: '130px' }}></div>
      
      <div style={{ maxWidth: '600px', margin: '0 auto', padding: '20px' }}>
        <div style={{
          background: '#fff',
          borderRadius: '12px',
          padding: '40px',
          boxShadow: '0 2px 12px rgba(0,0,0,0.08)',
          textAlign: 'center'
        }}>
          {paymentStatus?.success ? (
            <>
              <div style={{
                width: '80px',
                height: '80px',
                borderRadius: '50%',
                background: '#4caf50',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 20px',
                fontSize: '48px',
                color: '#fff'
              }}>
                ✓
              </div>
              <h1 style={{ 
                color: colors.primary, 
                marginBottom: '15px',
                fontSize: '24px',
                fontWeight: 'bold'
              }}>
                Thanh toán thành công!
              </h1>
              <p style={{ 
                color: colors.text2, 
                fontSize: '16px', 
                marginBottom: '10px'
              }}>
                Số tiền đã nạp: <strong style={{ color: colors.highlight }}>
                  {paymentStatus.amount?.toLocaleString('vi-VN')} VND
                </strong>
              </p>
              <p style={{ 
                color: colors.text2, 
                fontSize: '16px', 
                marginBottom: '30px'
              }}>
                Số DP đã nhận: <strong style={{ color: colors.highlight }}>
                  {paymentStatus.dp} DP
                </strong>
              </p>
              <div style={{
                background: '#f0f8ff',
                padding: '15px',
                borderRadius: '8px',
                marginBottom: '30px'
              }}>
                <p style={{
                  color: colors.text,
                  fontSize: '14px',
                  margin: 0
                }}>
                  Số dư DP của bạn đã được cập nhật. Bạn có thể sử dụng ngay!
                </p>
              </div>
            </>
          ) : (
            <>
              <div style={{
                width: '80px',
                height: '80px',
                borderRadius: '50%',
                background: '#f44336',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 20px',
                fontSize: '48px',
                color: '#fff'
              }}>
                ✕
              </div>
              <h1 style={{ 
                color: colors.primary, 
                marginBottom: '15px',
                fontSize: '24px',
                fontWeight: 'bold'
              }}>
                Thanh toán thất bại
              </h1>
              <p style={{ 
                color: colors.text2, 
                fontSize: '16px', 
                marginBottom: '30px'
              }}>
                {paymentStatus?.message || 'Có lỗi xảy ra trong quá trình thanh toán'}
              </p>
              <div style={{
                background: '#fff3cd',
                padding: '15px',
                borderRadius: '8px',
                marginBottom: '30px'
              }}>
                <p style={{
                  color: colors.text,
                  fontSize: '14px',
                  margin: 0
                }}>
                  Vui lòng thử lại hoặc liên hệ hỗ trợ nếu vấn đề vẫn tiếp tục.
                </p>
              </div>
            </>
          )}

          <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
            <button
              onClick={handleBackToRecharge}
              style={{
                padding: '12px 30px',
                background: '#e0e0e0',
                color: colors.text,
                border: 'none',
                borderRadius: '8px',
                fontSize: '16px',
                fontWeight: 'bold',
                cursor: 'pointer',
                transition: 'all 0.2s'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = '#d0d0d0';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = '#e0e0e0';
              }}
            >
              {paymentStatus?.success ? 'Nạp thêm' : 'Thử lại'}
            </button>

            <button
              onClick={handleGoHome}
              style={{
                padding: '12px 30px',
                background: colors.highlight,
                color: '#fff',
                border: 'none',
                borderRadius: '8px',
                fontSize: '16px',
                fontWeight: 'bold',
                cursor: 'pointer',
                transition: 'all 0.2s'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = colors.buttonHover;
                e.currentTarget.style.transform = 'translateY(-2px)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = colors.highlight;
                e.currentTarget.style.transform = 'translateY(0)';
              }}
            >
              Về trang chủ
            </button>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}

