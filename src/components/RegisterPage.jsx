import React from 'react';
import { Link } from 'react-router-dom';

export default function RegisterPage() {
  return (
    <div style={{
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      minHeight: '100vh',
      background: '#f5f5f5',
      fontFamily: 'Arial, sans-serif'
    }}>
      <div style={{
        textAlign: 'center',
        width: '100%'
      }}>
        {/* Logo EDUCONNECT */}
        <h1 style={{
          color: '#e84c61',
          fontSize: '36px',
          fontWeight: 'bold',
          marginBottom: '10px',
          letterSpacing: '1px'
        }}>
          EDUCONNECT
        </h1>
        
        {/* Tiêu đề Đăng ký */}
        <h2 style={{
          color: '#133a5c',
          fontSize: '20px',
          fontWeight: 'normal',
          marginBottom: '30px'
        }}>
          Đăng ký tài khoản
        </h2>
        
        {/* Form đăng ký */}
        <div style={{
          border: '2px solid #133a5c',
          borderRadius: '8px',
          padding: '40px 50px',
          background: '#fff',
          maxWidth: '450px',
          margin: '0 auto',
          boxShadow: '0 2px 8px rgba(0,0,0,0.05)'
        }}>
          <form>
            {/* Họ và tên */}
            <div style={{ marginBottom: '20px', textAlign: 'left' }}>
              <label style={{
                display: 'block',
                marginBottom: '8px',
                color: '#333',
                fontSize: '14px'
              }}>
                Họ và tên
              </label>
              <input
                type="text"
                placeholder="Ví dụ: Nguyên Văn A"
                style={{
                  width: '100%',
                  padding: '10px 12px',
                  fontSize: '14px',
                  border: '1px solid #ccc',
                  borderRadius: '4px',
                  boxSizing: 'border-box',
                  outline: 'none'
                }}
              />
            </div>
            
            {/* Số điện thoại */}
            <div style={{ marginBottom: '20px', textAlign: 'left' }}>
              <label style={{
                display: 'block',
                marginBottom: '8px',
                color: '#333',
                fontSize: '14px'
              }}>
                Số điện thoại
              </label>
              <input
                type="tel"
                placeholder="Ví dụ: 0912345678"
                style={{
                  width: '100%',
                  padding: '10px 12px',
                  fontSize: '14px',
                  border: '1px solid #ccc',
                  borderRadius: '4px',
                  boxSizing: 'border-box',
                  outline: 'none'
                }}
              />
            </div>
            
            {/* Tên đăng nhập */}
            <div style={{ marginBottom: '20px', textAlign: 'left' }}>
              <label style={{
                display: 'block',
                marginBottom: '8px',
                color: '#333',
                fontSize: '14px'
              }}>
                Tên đăng nhập
              </label>
              <input
                type="text"
                style={{
                  width: '100%',
                  padding: '10px 12px',
                  fontSize: '14px',
                  border: '1px solid #ccc',
                  borderRadius: '4px',
                  boxSizing: 'border-box',
                  outline: 'none'
                }}
              />
            </div>
            
            {/* Mật khẩu */}
            <div style={{ marginBottom: '20px', textAlign: 'left' }}>
              <label style={{
                display: 'block',
                marginBottom: '8px',
                color: '#333',
                fontSize: '14px'
              }}>
                Mật khẩu
              </label>
              <input
                type="password"
                style={{
                  width: '100%',
                  padding: '10px 12px',
                  fontSize: '14px',
                  border: '1px solid #ccc',
                  borderRadius: '4px',
                  boxSizing: 'border-box',
                  outline: 'none'
                }}
              />
            </div>
            
            {/* Xác nhận mật khẩu */}
            <div style={{ marginBottom: '25px', textAlign: 'left' }}>
              <label style={{
                display: 'block',
                marginBottom: '8px',
                color: '#333',
                fontSize: '14px'
              }}>
                Xác nhận mật khẩu
              </label>
              <input
                type="password"
                style={{
                  width: '100%',
                  padding: '10px 12px',
                  fontSize: '14px',
                  border: '1px solid #ccc',
                  borderRadius: '4px',
                  boxSizing: 'border-box',
                  outline: 'none'
                }}
              />
            </div>
            
            {/* Nút Đăng ký */}
            <button
              type="submit"
              style={{
                width: '180px',
                padding: '10px 0',
                background: '#4ba3d6',
                color: '#fff',
                fontSize: '16px',
                fontWeight: 'normal',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer',
                marginBottom: '20px'
              }}
            >
              Đăng ký
            </button>
            
            {/* Link đăng nhập */}
            <div style={{
              fontSize: '13px',
              color: '#666'
            }}>
              Đã có tài khoản?{' '}
              <Link to="/login" style={{
                color: '#4ba3d6',
                textDecoration: 'none',
                fontWeight: 'bold'
              }}>
                Đăng nhập
              </Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
