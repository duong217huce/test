const jwt = require('jsonwebtoken');

// Middleware xác thực token
const authenticateToken = (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    console.log('🔐 Auth middleware - Token:', token ? 'Có' : 'Không có');

    if (!token) {
      console.log('⚠️ No token provided');
      return res.status(401).json({ message: 'No token, authorization denied' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    
    console.log('✅ User authenticated:', { 
      id: decoded.id, 
      username: decoded.username,
      role: decoded.role 
    });
    
    next();
  } catch (error) {
    console.error('❌ Auth error:', error.message);
    res.status(401).json({ message: 'Token is not valid' });
  }
};

// Middleware kiểm tra admin
const isAdmin = (req, res, next) => {
  console.log('👤 Checking admin role:', req.user?.role);
  
  if (!req.user) {
    console.log('❌ No user in request');
    return res.status(401).json({ message: 'Authentication required' });
  }
  
  if (req.user.role !== 'admin') {
    console.log('❌ User is not admin:', req.user.username);
    return res.status(403).json({ message: 'Admin access required' });
  }
  
  console.log('✅ Admin access granted:', req.user.username);
  next();
};

// Export cả 2 cách để tương thích với code cũ và mới
module.exports = authenticateToken; // Default export cho code cũ
module.exports.authenticateToken = authenticateToken;
module.exports.isAdmin = isAdmin;
