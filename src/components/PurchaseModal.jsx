import React from 'react';

export default function PurchaseModal({ isOpen, onClose, onConfirm, document, userCoins }) {
  if (!isOpen) return null;

  const price = document?.price || 10;
  const hasEnough = userCoins >= price;

  return (
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
        borderRadius: '12px',
        padding: '30px',
        maxWidth: '450px',
        width: '90%',
        boxShadow: '0 8px 32px rgba(0,0,0,0.2)'
      }}>
        <h2 style={{ 
          color: '#133a5c', 
          marginBottom: '20px',
          fontSize: '22px',
          textAlign: 'center'
        }}>
          💰 Mua tài liệu
        </h2>

        <div style={{
          background: '#f5f5f5',
          padding: '20px',
          borderRadius: '8px',
          marginBottom: '20px'
        }}>
          <p style={{ color: '#2d4a67', marginBottom: '10px' }}>
            <strong>Tài liệu:</strong> {document?.title}
          </p>
          <p style={{ color: '#2d4a67', marginBottom: '10px' }}>
            <strong>Giá:</strong> <span style={{ color: '#e84c61', fontSize: '20px', fontWeight: 'bold' }}>{price} DP</span>
          </p>
          <p style={{ color: '#2d4a67' }}>
            <strong>Số dư hiện tại:</strong> <span style={{ color: hasEnough ? '#0d7a4f' : '#e84c61', fontWeight: 'bold' }}>{userCoins} DP</span>
          </p>
        </div>

        {!hasEnough && (
          <div style={{
            background: '#fff3cd',
            border: '1px solid #ffc107',
            color: '#856404',
            padding: '12px',
            borderRadius: '6px',
            marginBottom: '20px',
            fontSize: '14px'
          }}>
            ⚠️ Số dư không đủ. Vui lòng nạp thêm {price - userCoins} DP.
          </div>
        )}

        <div style={{ display: 'flex', gap: '10px' }}>
          <button
            onClick={onClose}
            style={{
              flex: 1,
              padding: '12px',
              background: '#ccc',
              color: '#333',
              border: 'none',
              borderRadius: '6px',
              fontSize: '16px',
              fontWeight: 'bold',
              cursor: 'pointer'
            }}
          >
            Hủy
          </button>
          <button
            onClick={onConfirm}
            style={{
              flex: 1,
              padding: '12px',
              background: hasEnough ? '#0d7a4f' : '#ffc107',
              color: '#fff',
              border: 'none',
              borderRadius: '6px',
              fontSize: '16px',
              fontWeight: 'bold',
              cursor: 'pointer'
            }}
          >
            {hasEnough ? '✅ Xác nhận mua' : '💳 Nạp tiền'}
          </button>
        </div>
      </div>
    </div>
  );
}
