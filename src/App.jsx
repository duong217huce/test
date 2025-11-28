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
import RechargePage from './components/RechargePage';
import QuizListPage from './components/QuizListPage';
import CreateQuizPage from './components/CreateQuizPage';
import QuizDetailPage from './components/QuizDetailPage';
import TakeQuizPage from './components/TakeQuizPage';
import QuizResultPage from './components/QuizResultPage';
import Toast from './components/Toast';
import AdminDashboard from './components/AdminDashboard';


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
        
        {/* Trang nạp tiền */}
        <Route path="/recharge" element={<RechargePage />} />
        
        {/* ✅ QUIZ ROUTES - ĐÃ SỬA */}
        {/* Trang danh sách đề thi */}
        <Route path="/quiz" element={<QuizListPage />} />
        
        {/* Trang tạo đề thi */}
        <Route path="/quiz/create" element={<CreateQuizPage />} />
        
        {/* Trang chi tiết đề thi */}
        <Route path="/quiz/:id" element={<QuizDetailPage />} />
        
        {/* Trang làm đề thi */}
        <Route path="/quiz/:id/take" element={<TakeQuizPage />} />
        
        {/* Trang kết quả đề thi */}
        <Route path="/quiz/:id/result" element={<QuizResultPage />} />
        
        <Route path="/admin" element={<AdminDashboard />} />
      </Routes>
      
      {/* ✅ Chatbot nổi - hiển thị trên TẤT CẢ các trang */}
      <Chatbot />
      <Toast />
    </BrowserRouter>
  );
}

export default App;
