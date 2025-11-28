import React, { useState, useEffect } from 'react';
import { colors } from '../theme/colors';
import { registerToast } from '../utils/toast';

export default function Toast() {
  const [toast, setToast] = useState(null);

  useEffect(() => {
    registerToast((message, type) => {
      setToast({ message, type });
      setTimeout(() => setToast(null), 3000);
    });
  }, []);

  if (!toast) return null;

  const getToastStyle = () => {
    const baseStyle = {
      position: 'fixed',
      top: '20px',
      right: '20px',
      zIndex: 9999,
      padding: '16px 24px',
      borderRadius: '8px',
      boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
      display: 'flex',
      alignItems: 'center',
      gap: '12px',
      maxWidth: '400px',
      animation: 'slideIn 0.3s ease-out',
      fontFamily: 'Montserrat, sans-serif',
      fontWeight: '500'
    };

    const typeStyles = {
      success: {
        background: colors.accent2,
        color: colors.text
      },
      error: {
        background: colors.accent,
        color: colors.text
      },
      warning: {
        background: colors.accent3,
        color: colors.text
      },
      info: {
        background: colors.text,
        color: colors.background
      }
    };

    return { ...baseStyle, ...typeStyles[toast.type] };
  };

  const getIcon = () => {
    const icons = {
      success: '✓',
      error: '✕',
      warning: '⚠',
      info: 'ℹ'
    };
    return icons[toast.type] || icons.info;
  };

  return (
    <>
      <style>
        {`
          @keyframes slideIn {
            from {
              transform: translateX(400px);
              opacity: 0;
            }
            to {
              transform: translateX(0);
              opacity: 1;
            }
          }
        `}
      </style>
      <div style={getToastStyle()}>
        <span style={{ fontSize: '20px' }}>{getIcon()}</span>
        <span>{toast.message}</span>
      </div>
    </>
  );
}
