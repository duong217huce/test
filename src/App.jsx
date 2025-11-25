import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import HomePage from './components/HomePage';
import CategoryPage from './components/CategoryPage';
import DocumentDetailPage from './components/DocumentDetailPage';
import UploadPage from './components/UploadPage';
import ProfilePage from './components/ProfilePage';
import LoginPage from './components/LoginPage';
import RegisterPage from './components/RegisterPage';
import SavedPage from './components/SavedPage';
import Chatbot from './components/Chatbot';
import SearchPage from './components/SearchPage';  

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Trang chủ */}
        <Route path="/" element={<HomePage />} />
        
        {/* Trang danh mục */}
        <Route path="/category/:category" element={<CategoryPage />} />
        
        {/* Trang chi tiết tài liệu */}
        <Route path="/document/:id" element={<DocumentDetailPage />} />
        
        {/* Trang upload tài liệu */}
        <Route path="/upload" element={<UploadPage />} />
        
        {/* Trang profile người dùng */}
        <Route path="/profile" element={<ProfilePage />} />
        
        {/* Trang đăng nhập */}
        <Route path="/login" element={<LoginPage />} />
        
        {/* Trang đăng ký */}
        <Route path="/register" element={<RegisterPage />} />
        
        {/* Trang tài liệu đã lưu */}
        <Route path="/saved" element={<SavedPage />} />

        {/* Trang tìm kiếm */}
        <Route path="/search" element={<SearchPage />} />
      </Routes>
      
      {/* ✅ Chatbot nổi - hiển thị trên TẤT CẢ các trang */}
      <Chatbot />
    </BrowserRouter>
  );
}

export default App;
