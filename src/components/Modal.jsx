import React from 'react';
import { colors } from '../theme/colors';

export default function Modal({ isOpen, onClose, title, message, confirmText = 'OK', onConfirm, cancelText, onCancel }) {
  if (!isOpen) return null;

  const handleConfirm = () => {
    if (onConfirm) onConfirm();
    onClose();
  };

  const handleCancel = () => {
    if (onCancel) onCancel();
    onClose();
  };

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: colors.overlay,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 10000,
      fontFamily: 'Montserrat, sans-serif'
    }}>
      <div style={{
        background: colors.background,
        borderRadius: '12px',
        padding: '30px',
        maxWidth: '450px',
        width: '90%',
        boxShadow: '0 8px 32px rgba(0,0,0,0.2)',
        animation: 'fadeIn 0.2s ease-out'
      }}>
        {title && (
          <h2 style={{
            color: colors.headline,
            fontSize: '20px',
            fontWeight: '700',
            marginBottom: '16px'
          }}>
            {title}
          </h2>
        )}
        
        <p style={{
          color: colors.paragraph,
          fontSize: '15px',
          lineHeight: '1.6',
          marginBottom: '24px'
        }}>
          {message}
        </p>

        <div style={{
          display: 'flex',
          gap: '12px',
          justifyContent: 'flex-end'
        }}>
          {cancelText && (
            <button
              onClick={handleCancel}
              style={{
                padding: '10px 24px',
                background: colors.inputBg,
                color: colors.paragraph,
                border: 'none',
                borderRadius: '6px',
                fontSize: '14px',
                fontWeight: '600',
                cursor: 'pointer',
                transition: 'all 0.2s'
              }}
              onMouseOver={(e) => e.currentTarget.style.background = colors.secondary}
              onMouseOut={(e) => e.currentTarget.style.background = colors.inputBg}
            >
              {cancelText}
            </button>
          )}
          
          <button
            onClick={handleConfirm}
            style={{
              padding: '10px 24px',
              background: colors.button,
              color: colors.buttonText,
              border: 'none',
              borderRadius: '6px',
              fontSize: '14px',
              fontWeight: '600',
              cursor: 'pointer',
              transition: 'all 0.2s'
            }}
            onMouseOver={(e) => e.currentTarget.style.background = colors.buttonHover}
            onMouseOut={(e) => e.currentTarget.style.background = colors.button}
          >
            {confirmText}
          </button>
        </div>
      </div>
      
      <style>
        {`
          @keyframes fadeIn {
            from {
              opacity: 0;
              transform: scale(0.95);
            }
            to {
              opacity: 1;
              transform: scale(1);
            }
          }
        `}
      </style>
    </div>
  );
}
