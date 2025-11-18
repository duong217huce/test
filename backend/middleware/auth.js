const jwt = require('jsonwebtoken');

module.exports = function(req, res, next) {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    console.log('🔐 Auth middleware - Token:', token ? 'Có' : 'Không có');

    if (!token) {
      console.log('⚠️ No token provided');
      return res.status(401).json({ message: 'No token, authorization denied' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    
    console.log('✅ User authenticated:', { id: decoded.id, username: decoded.username });
    next();
  } catch (error) {
    console.error('❌ Auth error:', error.message);
    res.status(401).json({ message: 'Token is not valid' });
  }
};
