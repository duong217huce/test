const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
require('dotenv').config();

const authRoutes = require('./routes/auth');
const documentRoutes = require('./routes/documents');
const commentRoutes = require('./routes/comments');
const ratingRoutes = require('./routes/ratings');

const app = express();

// Middleware
app.use(cors({
  origin: ['http://localhost:3000', 'http://localhost:5173'],
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Tạo thư mục uploads nếu chưa tồn tại
const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
  console.log('📁 Đã tạo thư mục uploads');
}

// Serve static files từ thư mục uploads
app.use('/uploads', (req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET');
  res.header('Cross-Origin-Resource-Policy', 'cross-origin');
  next();
}, express.static(uploadsDir));

// Database connection
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('✅ Đã kết nối MongoDB'))
  .catch(err => console.error('❌ Lỗi kết nối MongoDB:', err));

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/documents', documentRoutes);
app.use('/api/comments', commentRoutes);
app.use('/api/ratings', ratingRoutes);

// Test route để kiểm tra uploads
app.get('/test-uploads', (req, res) => {
  try {
    if (!fs.existsSync(uploadsDir)) {
      return res.json({ 
        error: 'Uploads folder does not exist', 
        path: uploadsDir 
      });
    }
    
    const files = fs.readdirSync(uploadsDir);
    res.json({ 
      message: 'Uploads folder exists',
      path: uploadsDir,
      totalFiles: files.length,
      files: files.map(file => ({
        name: file,
        url: `http://localhost:${PORT}/uploads/${file}`,
        size: fs.statSync(path.join(uploadsDir, file)).size
      }))
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Health check endpoint
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
      uploads: '/uploads'
    },
    timestamp: new Date().toISOString()
  });
});

// Error handling middleware
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

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log('='.repeat(50));
  console.log('🚀 EDUCONNECT Backend Server');
  console.log('='.repeat(50));
  console.log(`📡 Server đang chạy trên port ${PORT}`);
  console.log(`🌐 API URL: http://localhost:${PORT}`);
  console.log(`📂 Uploads folder: ${uploadsDir}`);
  console.log(`📁 Uploads URL: http://localhost:${PORT}/uploads`);
  console.log(`🔍 Test uploads: http://localhost:${PORT}/test-uploads`);
  console.log('='.repeat(50));
  console.log('📋 Available endpoints:');
  console.log('   - POST   /api/auth/register');
  console.log('   - POST   /api/auth/login');
  console.log('   - GET    /api/documents');
  console.log('   - GET    /api/documents/:id');
  console.log('   - POST   /api/documents');
  console.log('   - GET    /api/comments/:documentId');
  console.log('   - POST   /api/comments');
  console.log('   - POST   /api/comments/:id/like');
  console.log('   - PUT    /api/comments/:id');
  console.log('   - DELETE /api/comments/:id');
  console.log('='.repeat(50));
});

// Graceful shutdown
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
