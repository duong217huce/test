const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
require('dotenv').config();

// Import routes
const authRoutes = require('./routes/auth');
const documentRoutes = require('./routes/documents');
const commentRoutes = require('./routes/comments');
const ratingRoutes = require('./routes/ratings');
const userRoutes = require('./routes/users');
const quizRoutes = require('./routes/quizzes');
const adminRoutes = require('./routes/admin');

const app = express();

// ==================== MIDDLEWARE ====================
app.use(cors({
  origin: ['http://localhost:3000', 'http://localhost:5173'],
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
// ❌ XÓA DÒNG NÀY: app.use('/api/admin', adminRoutes);

// ==================== FILE SYSTEM SETUP ====================
const uploadsDir = path.join(__dirname, 'uploads');
const coversDir = path.join(__dirname, 'uploads/covers');
const quizCoversDir = path.join(__dirname, 'uploads/quiz-covers');

if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
  console.log('📁 Đã tạo thư mục uploads');
}

if (!fs.existsSync(coversDir)) {
  fs.mkdirSync(coversDir, { recursive: true });
  console.log('🖼️ Đã tạo thư mục uploads/covers');
}

if (!fs.existsSync(quizCoversDir)) {
  fs.mkdirSync(quizCoversDir, { recursive: true });
  console.log('🖼️ Đã tạo thư mục uploads/quiz-covers');
}

// ==================== STATIC FILES & DOWNLOADS ====================

// Preview files (không force download)
app.use('/uploads', (req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.header('Cross-Origin-Resource-Policy', 'cross-origin');
  next();
}, express.static(uploadsDir));

// Serve quiz covers
app.use('/uploads/quiz-covers', (req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.header('Cross-Origin-Resource-Policy', 'cross-origin');
  next();
}, express.static(quizCoversDir));

// Serve cover images
app.use('/uploads/covers', (req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.header('Cross-Origin-Resource-Policy', 'cross-origin');
  next();
}, express.static(coversDir));

// Download files (force download)
app.get('/download/:filename', (req, res) => {
  const filename = req.params.filename;
  const filePath = path.join(uploadsDir, filename);
  
  if (!fs.existsSync(filePath)) {
    return res.status(404).json({ message: 'File not found' });
  }
  
  console.log('📥 Downloading file:', filename);
  
  res.download(filePath, filename, (err) => {
    if (err) {
      console.error('❌ Error downloading file:', err);
      if (!res.headersSent) {
        res.status(500).json({ message: 'Error downloading file' });
      }
    } else {
      console.log('✅ File downloaded successfully:', filename);
    }
  });
});

// ==================== DATABASE CONNECTION ====================
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('✅ Đã kết nối MongoDB'))
  .catch(err => console.error('❌ Lỗi kết nối MongoDB:', err));

// ==================== API ROUTES ====================
app.use('/api/auth', authRoutes);
app.use('/api/documents', documentRoutes);
app.use('/api/comments', commentRoutes);
app.use('/api/ratings', ratingRoutes);
app.use('/api/users', userRoutes);
app.use('/api/quizzes', quizRoutes);
app.use('/api/admin', adminRoutes); // ✅ DI CHUYỂN VÀO ĐÂY

// ==================== UTILITY ENDPOINTS ====================

// Test uploads folder
app.get('/test-uploads', (req, res) => {
  try {
    if (!fs.existsSync(uploadsDir)) {
      return res.json({ 
        error: 'Uploads folder does not exist', 
        path: uploadsDir 
      });
    }
    
    const files = fs.readdirSync(uploadsDir);
    const covers = fs.existsSync(coversDir) ? fs.readdirSync(coversDir) : [];
    const quizCovers = fs.existsSync(quizCoversDir) ? fs.readdirSync(quizCoversDir) : [];
    const PORT = process.env.PORT || 5000;
    
    res.json({ 
      message: 'Uploads folder exists',
      path: uploadsDir,
      coversPath: coversDir,
      quizCoversPath: quizCoversDir,
      totalFiles: files.length,
      totalCovers: covers.length,
      totalQuizCovers: quizCovers.length,
      files: files.map(file => ({
        name: file,
        previewUrl: `http://localhost:${PORT}/uploads/${file}`,
        downloadUrl: `http://localhost:${PORT}/download/${file}`,
        size: fs.statSync(path.join(uploadsDir, file)).size
      })),
      covers: covers.map(cover => ({
        name: cover,
        url: `http://localhost:${PORT}/uploads/covers/${cover}`,
        size: fs.statSync(path.join(coversDir, cover)).size
      })),
      quizCovers: quizCovers.map(cover => ({
        name: cover,
        url: `http://localhost:${PORT}/uploads/quiz-covers/${cover}`,
        size: fs.statSync(path.join(quizCoversDir, cover)).size
      }))
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Health check
app.get('/', (req, res) => {
  res.json({ 
    message: 'EDUCONNECT Backend API is running',
    status: 'OK',
    version: '1.0.0',
    endpoints: {
      auth: '/api/auth',
      documents: '/api/documents',
      comments: '/api/comments',
      ratings: '/api/ratings',
      users: '/api/users',
      quizzes: '/api/quizzes',
      admin: '/api/admin',
      uploads: '/uploads',
      covers: '/uploads/covers',
      quizCovers: '/uploads/quiz-covers',
      download: '/download/:filename'
    },
    timestamp: new Date().toISOString()
  });
});

// ==================== ERROR HANDLING ====================

// Global error handler
// eslint-disable-next-line no-unused-vars
app.use((err, req, res, next) => {
  console.error('❌ Server Error:', err.stack);
  res.status(500).json({ 
    message: 'Đã xảy ra lỗi server!',
    error: process.env.NODE_ENV === 'development' ? err.message : 'Internal server error'
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ 
    message: 'Route không tồn tại',
    requestedUrl: req.originalUrl,
    method: req.method
  });
});

// ==================== SERVER START ====================
const PORT = process.env.PORT || 5000;
const server = app.listen(PORT, () => {
  console.log('='.repeat(60));
  console.log('🚀 EDUCONNECT Backend Server');
  console.log('='.repeat(60));
  console.log(`📡 Server đang chạy trên port ${PORT}`);
  console.log(`🌐 API URL: http://localhost:${PORT}`);
  console.log(`📂 Uploads folder: ${uploadsDir}`);
  console.log(`🖼️ Covers folder: ${coversDir}`);
  console.log(`🖼️ Quiz covers folder: ${quizCoversDir}`);
  console.log(`📁 Preview URL: http://localhost:${PORT}/uploads`);
  console.log(`🖼️ Covers URL: http://localhost:${PORT}/uploads/covers`);
  console.log(`🖼️ Quiz Covers URL: http://localhost:${PORT}/uploads/quiz-covers`);
  console.log(`📥 Download URL: http://localhost:${PORT}/download`);
  console.log(`🔍 Test uploads: http://localhost:${PORT}/test-uploads`);
  console.log('='.repeat(60));
  console.log('📋 Available endpoints:');
  console.log('');
  console.log('🔐 Authentication:');
  console.log('   - POST   /api/auth/register');
  console.log('   - POST   /api/auth/login');
  console.log('');
  console.log('📄 Documents:');
  console.log('   - GET    /api/documents');
  console.log('   - GET    /api/documents/search');
  console.log('   - GET    /api/documents/:id');
  console.log('   - GET    /api/documents/:id/preview');
  console.log('   - POST   /api/documents (with cover image)');
  console.log('   - PUT    /api/documents/:id');
  console.log('   - DELETE /api/documents/:id');
  console.log('   - POST   /api/documents/:id/download');
  console.log('   - POST   /api/documents/:id/purchase');
  console.log('   - GET    /api/documents/:id/check-purchase');
  console.log('');
  console.log('💬 Comments:');
  console.log('   - GET    /api/comments/:documentId');
  console.log('   - POST   /api/comments');
  console.log('   - PUT    /api/comments/:id');
  console.log('   - DELETE /api/comments/:id');
  console.log('   - POST   /api/comments/:id/like');
  console.log('');
  console.log('⭐ Ratings:');
  console.log('   - GET    /api/ratings/:documentId');
  console.log('   - POST   /api/ratings');
  console.log('');
  console.log('👤 Users:');
  console.log('   - GET    /api/users/me');
  console.log('   - PUT    /api/users/me');
  console.log('   - GET    /api/users/saved');
  console.log('   - GET    /api/users/saved/check/:documentId');
  console.log('   - POST   /api/users/saved/:documentId');
  console.log('');
  console.log('📝 Quizzes:');
  console.log('   - GET    /api/quizzes');
  console.log('   - GET    /api/quizzes/:id');
  console.log('   - POST   /api/quizzes (with coverImage)');
  console.log('   - PUT    /api/quizzes/:id');
  console.log('   - DELETE /api/quizzes/:id');
  console.log('   - POST   /api/quizzes/:id/start');
  console.log('   - POST   /api/quizzes/:id/submit');
  console.log('');
  console.log('👑 Admin:'); // ✅ THÊM
  console.log('   - GET    /api/admin/statistics');
  console.log('   - GET    /api/admin/users');
  console.log('   - GET    /api/admin/users/:userId/documents');
  console.log('   - PUT    /api/admin/users/:userId/coins');
  console.log('');
  console.log('📁 Files:');
  console.log('   - GET    /uploads/:filename (preview)');
  console.log('   - GET    /uploads/covers/:filename (cover images)');
  console.log('   - GET    /uploads/quiz-covers/:filename (quiz covers)');
  console.log('   - GET    /download/:filename (download)');
  console.log('='.repeat(60));
});

// ==================== GRACEFUL SHUTDOWN ====================
process.on('SIGTERM', () => {
  console.log('👋 SIGTERM received, shutting down gracefully');
  server.close(() => {
    console.log('✅ Server closed');
    mongoose.connection.close(false, () => {
      console.log('✅ MongoDB connection closed');
      process.exit(0);
    });
  });
});

process.on('SIGINT', () => {
  console.log('\n👋 SIGINT received, shutting down gracefully');
  server.close(() => {
    console.log('✅ Server closed');
    mongoose.connection.close(false, () => {
      console.log('✅ MongoDB connection closed');
      process.exit(0);
    });
  });
});
