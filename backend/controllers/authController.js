const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

exports.register = async (req, res) => {
  try {
    const { username, email, password, fullName } = req.body;
    
    const existingUser = await User.findOne({ $or: [{ email }, { username }] });
    if (existingUser) {
      return res.status(400).json({ message: 'User đã tồn tại' });
    }
    
    const hashedPassword = await bcrypt.hash(password, 10);
    
    const user = new User({
      username,
      email,
      password: hashedPassword,
      fullName,
      coins: 0
    });
    
    await user.save();
    console.log('✅ User registered:', username);
    res.status(201).json({ message: 'Đăng ký thành công' });
  } catch (error) {
    console.error('❌ Register error:', error);
    res.status(500).json({ message: error.message });
  }
};

exports.login = async (req, res) => {
  try {
    const { username, password } = req.body;
    
    const user = await User.findOne({ username });
    if (!user) {
      return res.status(401).json({ message: 'Thông tin đăng nhập không đúng' });
    }
    
    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      return res.status(401).json({ message: 'Thông tin đăng nhập không đúng' });
    }
    
    // ✅ Token dùng 'id' để khớp với middleware
    const token = jwt.sign(
      { 
        id: user._id,
        username: user.username,
        role: user.role 
      },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );
    
    console.log('✅ User logged in:', username);
    
    // ✅ TRẢ VỀ ĐẦY ĐỦ THÔNG TIN
    res.json({
      token,
      user: {
        _id: user._id,
        id: user._id,
        username: user.username,
        email: user.email,
        fullName: user.fullName || '',
        phone: user.phone || '',
        hocCap: user.hocCap || '',
        lop: user.lop || '',
        chuyenNganh: user.chuyenNganh || '',
        bio: user.bio || '',
        role: user.role,
        coins: user.coins || 0,
        createdAt: user.createdAt
      }
    });
  } catch (error) {
    console.error('❌ Login error:', error);
    res.status(500).json({ message: error.message });
  }
};

exports.getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    if (!user) {
      return res.status(404).json({ message: 'User không tồn tại' });
    }
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
