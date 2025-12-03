import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from './Header';
import Footer from './Footer';
import { showToast } from '../utils/toast';
import { colors } from '../theme/colors';

export default function RechargePage() {
  const navigate = useNavigate();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [coins, setCoins] = useState(0);
  const [selectedAmount, setSelectedAmount] = useState(null);
  const [customAmount, setCustomAmount] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  const presetAmounts = [
    { vnd: 10000, dp: 10 },
    { vnd: 20000, dp: 20 },
    { vnd: 50000, dp: 50 },
    { vnd: 100000, dp: 100 },
    { vnd: 200000, dp: 200 },
    { vnd: 500000, dp: 500 }
  ];

  useEffect(() => {
    const loggedIn = localStorage.getItem('isLoggedIn') === 'true';
    const userData = JSON.parse(localStorage.getItem('user') || '{}');
    const userCoins = userData.coins || 0;
    
    setIsLoggedIn(loggedIn);
    setCoins(userCoins);

    if (!loggedIn) {
      showToast('Vui lòng đăng nhập để nạp tiền', 'error');
      navigate('/login');
    }
  }, [navigate]);

  const handleAmountSelect = (amount) => {
    setSelectedAmount(amount);
    setCustomAmount('');
  };

  const handleCustomAmountChange = (e) => {
    const value = e.target.value.replace(/\D/g, '');
    setCustomAmount(value);
    setSelectedAmount(null);
  };

  const handlePayment = async () => {
    if (!isLoggedIn) {
      showToast('Vui lòng đăng nhập để nạp tiền', 'error');
      navigate('/login');
      return;
    }

    let amount = 0;
    if (selectedAmount) {
      amount = selectedAmount.vnd;
    } else if (customAmount) {
      amount = parseInt(customAmount);
    } else {
      showToast('Vui lòng chọn hoặc nhập số tiền nạp', 'error');
      return;
    }

    if (amount < 10000) {
      showToast('Số tiền nạp tối thiểu là 10,000 VND', 'error');
      return;
    }

    if (amount > 10000000) {
      showToast('Số tiền nạp tối đa là 10,000,000 VND', 'error');
      return;
    }

    setIsProcessing(true);

    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5000/api/payment/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ amount })
      });

      const data = await response.json();

      if (response.ok && data.success) {
        // Redirect to VNPay payment page
        window.location.href = data.paymentUrl;
      } else {
        showToast(data.message || 'Có lỗi xảy ra khi tạo thanh toán', 'error');
        setIsProcessing(false);
      }
    } catch (error) {
      console.error('Error creating payment:', error);
      showToast('Có lỗi xảy ra khi tạo thanh toán', 'error');
      setIsProcessing(false);
    }
  };

  const calculateDP = (vnd) => {
    return Math.floor(vnd / 1000);
  };

  return (
    <div style={{ minHeight: '100vh', background: '#fffffe', fontFamily: 'Montserrat, sans-serif' }}>
      <Header />
      <div style={{ height: '130px' }}></div>
      
      <div style={{ maxWidth: '800px', margin: '0 auto', padding: '20px' }}>
        <div style={{
          background: '#fff',
          borderRadius: '12px',
          padding: '40px',
          boxShadow: '0 2px 12px rgba(0,0,0,0.08)'
        }}>
          <h1 style={{ 
            color: colors.primary, 
            marginBottom: '10px',
            fontSize: '28px',
            fontWeight: 'bold',
            textAlign: 'center'
          }}>
            💳 Nạp tiền DP
          </h1>
          
          <p style={{ 
            color: colors.text2, 
            fontSize: '14px', 
            marginBottom: '30px',
            textAlign: 'center'
          }}>
            Số dư hiện tại: <span style={{ color: colors.highlight, fontWeight: 'bold' }}>{coins} DP</span>
          </p>

          <div style={{ marginBottom: '30px' }}>
            <h3 style={{ 
              color: colors.text, 
              fontSize: '16px', 
              marginBottom: '15px',
              fontWeight: '600'
            }}>
              Chọn số tiền nạp:
            </h3>
            
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(3, 1fr)',
              gap: '12px',
              marginBottom: '20px'
            }}>
              {presetAmounts.map((amount, index) => (
                <button
                  key={index}
                  onClick={() => handleAmountSelect(amount)}
                  style={{
                    padding: '16px',
                    background: selectedAmount?.vnd === amount.vnd ? colors.highlight : '#f5f5f5',
                    color: selectedAmount?.vnd === amount.vnd ? '#fff' : colors.text,
                    border: `2px solid ${selectedAmount?.vnd === amount.vnd ? colors.highlight : '#ddd'}`,
                    borderRadius: '8px',
                    fontSize: '14px',
                    fontWeight: 'bold',
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: '4px'
                  }}
                  onMouseEnter={(e) => {
                    if (selectedAmount?.vnd !== amount.vnd) {
                      e.currentTarget.style.background = '#e8f4f8';
                      e.currentTarget.style.borderColor = colors.highlight;
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (selectedAmount?.vnd !== amount.vnd) {
                      e.currentTarget.style.background = '#f5f5f5';
                      e.currentTarget.style.borderColor = '#ddd';
                    }
                  }}
                >
                  <span>{amount.vnd.toLocaleString('vi-VN')} VND</span>
                  <span style={{ fontSize: '12px', opacity: 0.8 }}>
                    = {amount.dp} DP
                  </span>
                </button>
              ))}
            </div>

            <div>
              <label style={{
                display: 'block',
                color: colors.text,
                fontSize: '14px',
                marginBottom: '8px',
                fontWeight: '600'
              }}>
                Hoặc nhập số tiền tùy chọn (tối thiểu 10,000 VND):
              </label>
              <input
                type="text"
                value={customAmount}
                onChange={handleCustomAmountChange}
                placeholder="Nhập số tiền (VND)"
                style={{
                  width: '100%',
                  padding: '12px',
                  border: `2px solid #ddd`,
                  borderRadius: '8px',
                  fontSize: '14px',
                  fontFamily: 'Montserrat',
                  outline: 'none',
                  boxSizing: 'border-box',
                  transition: 'border-color 0.2s'
                }}
                onFocus={(e) => {
                  e.target.style.borderColor = colors.highlight;
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = '#ddd';
                }}
              />
              {customAmount && (
                <p style={{
                  marginTop: '8px',
                  color: colors.text2,
                  fontSize: '13px'
                }}>
                  Bạn sẽ nhận được: <span style={{ color: colors.highlight, fontWeight: 'bold' }}>
                    {calculateDP(parseInt(customAmount) || 0)} DP
                  </span>
                </p>
              )}
            </div>
          </div>

          <div style={{
            background: '#f8f9fa',
            padding: '15px',
            borderRadius: '8px',
            marginBottom: '30px'
          }}>
            <p style={{
              color: colors.text2,
              fontSize: '13px',
              margin: 0,
              lineHeight: '1.6'
            }}>
              <strong>Lưu ý:</strong> Tỷ lệ quy đổi: <strong>10 DP = 10,000 VND</strong> (1 DP = 1,000 VND)
            </p>
          </div>

          <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
            <button
              onClick={() => navigate(-1)}
              disabled={isProcessing}
              style={{
                padding: '12px 30px',
                background: '#e0e0e0',
                color: colors.text,
                border: 'none',
                borderRadius: '8px',
                fontSize: '16px',
                fontWeight: 'bold',
                cursor: isProcessing ? 'not-allowed' : 'pointer',
                transition: 'all 0.2s',
                opacity: isProcessing ? 0.6 : 1
              }}
              onMouseEnter={(e) => {
                if (!isProcessing) {
                  e.currentTarget.style.background = '#d0d0d0';
                }
              }}
              onMouseLeave={(e) => {
                if (!isProcessing) {
                  e.currentTarget.style.background = '#e0e0e0';
                }
              }}
            >
              ← Quay lại
            </button>

            <button
              onClick={handlePayment}
              disabled={isProcessing || (!selectedAmount && !customAmount)}
              style={{
                padding: '12px 30px',
                background: isProcessing || (!selectedAmount && !customAmount) ? '#ccc' : colors.highlight,
                color: '#fff',
                border: 'none',
                borderRadius: '8px',
                fontSize: '16px',
                fontWeight: 'bold',
                cursor: (isProcessing || (!selectedAmount && !customAmount)) ? 'not-allowed' : 'pointer',
                transition: 'all 0.2s',
                opacity: (isProcessing || (!selectedAmount && !customAmount)) ? 0.6 : 1,
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}
              onMouseEnter={(e) => {
                if (!isProcessing && (selectedAmount || customAmount)) {
                  e.currentTarget.style.background = colors.buttonHover;
                  e.currentTarget.style.transform = 'translateY(-2px)';
                }
              }}
              onMouseLeave={(e) => {
                if (!isProcessing && (selectedAmount || customAmount)) {
                  e.currentTarget.style.background = colors.highlight;
                  e.currentTarget.style.transform = 'translateY(0)';
                }
              }}
            >
              {isProcessing ? (
                <>
                  <span style={{
                    display: 'inline-block',
                    width: '16px',
                    height: '16px',
                    border: '2px solid #fff',
                    borderTop: '2px solid transparent',
                    borderRadius: '50%',
                    animation: 'spin 1s linear infinite'
                  }}></span>
                  Đang xử lý...
                </>
              ) : (
                'Thanh toán qua VNPay'
              )}
            </button>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}
