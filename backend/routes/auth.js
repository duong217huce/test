const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { OAuth2Client } = require('google-auth-library');
const User = require('../models/User');

// Initialize Google OAuth client
const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

// @route   POST /api/auth/register
// @desc    Register a new user
// @access  Public
router.post('/register', async (req, res) => {
  try {
    const { username, email, password, fullName } = req.body;

    // Validation
    if (!username || !email || !password) {
      return res.status(400).json({ message: 'Please enter all fields' });
    }

    // Check if user exists
    const existingUser = await User.findOne({ 
      $or: [{ email }, { username }] 
    });

    if (existingUser) {
      if (existingUser.email === email) {
        return res.status(400).json({ message: 'Email already exists' });
      }
      if (existingUser.username === username) {
        return res.status(400).json({ message: 'Username already exists' });
      }
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create new user
    const newUser = new User({
      username,
      email,
      password: hashedPassword,
      fullName: fullName || username,
      phone: req.body.phone || '',
      role: 'user',
      coins: 0
    });

    const savedUser = await newUser.save();

    // Create token
    const payload = {
      id: savedUser.id,
      username: savedUser.username,
      role: savedUser.role
    };

    const token = jwt.sign(payload, process.env.JWT_SECRET, { 
      expiresIn: '30d' 
    });

    console.log('✅ User registered:', savedUser.username);

    // ✅ Trả về đầy đủ thông tin user (trừ password)
    res.status(201).json({
      token,
      user: {
        id: savedUser.id,
        _id: savedUser._id,
        username: savedUser.username,
        email: savedUser.email,
        fullName: savedUser.fullName,
        role: savedUser.role,
        coins: savedUser.coins || 0,
        hocCap: savedUser.hocCap || '',
        lop: savedUser.lop || '',
        chuyenNganh: savedUser.chuyenNganh || '',
        phone: savedUser.phone || '',
        bio: savedUser.bio || '',
        avatarUrl: savedUser.avatarUrl || '',
        createdAt: savedUser.createdAt,
        purchasedDocuments: [],
        savedDocuments: []
      }
    });
  } catch (error) {
    console.error('❌ Register error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// @route   POST /api/auth/login
// @desc    Login user
// @access  Public
router.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;

    // Validation
    if (!username || !password) {
      return res.status(400).json({ message: 'Please enter all fields' });
    }

    // Check if user exists
    const user = await User.findOne({ username });
    if (!user) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    // Validate password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    // Create token with correct payload structure
    const payload = {
      id: user.id,  // ✅ Phải là 'id', không phải 'userId'
      username: user.username,
      role: user.role
    };

    const token = jwt.sign(payload, process.env.JWT_SECRET, { 
      expiresIn: '30d' 
    });

    console.log('✅ User logged in:', user.username);

    // ✅ Trả về đầy đủ thông tin user (trừ password)
    res.json({
      token,
      user: {
        id: user.id,
        _id: user._id,
        username: user.username,
        email: user.email,
        fullName: user.fullName,
        role: user.role,
        coins: user.coins || 0,
        hocCap: user.hocCap || '',
        lop: user.lop || '',
        chuyenNganh: user.chuyenNganh || '',
        phone: user.phone || '',
        bio: user.bio || '',
        avatarUrl: user.avatarUrl || '',
        createdAt: user.createdAt,
        purchasedDocuments: user.purchasedDocuments || [],
        savedDocuments: user.savedDocuments || []
      }
    });
  } catch (error) {
    console.error('❌ Login error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// @route   GET /api/auth/user
// @desc    Get user data (verify token)
// @access  Private
router.get('/user', async (req, res) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({ message: 'No token, authorization denied' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id).select('-password');
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json(user);
  } catch (error) {
    console.error('❌ Get user error:', error);
    res.status(401).json({ message: 'Token is not valid' });
  }
});

// @route   POST /api/auth/google
// @desc    Authenticate user with Google
// @access  Public
router.post('/google', async (req, res) => {
  try {
    const { tokenId } = req.body;

    if (!tokenId) {
      return res.status(400).json({ message: 'Google token is required' });
    }

    // Verify Google token
    const ticket = await client.verifyIdToken({
      idToken: tokenId,
      audience: process.env.GOOGLE_CLIENT_ID
    });

    const payload = ticket.getPayload();
    const { sub: googleId, email, name, picture } = payload;

    // Check if user exists by Google ID
    let user = await User.findOne({ googleId });

    if (!user) {
      // Check if user exists by email (in case they registered with email first)
      user = await User.findOne({ email });

      if (user) {
        // Link Google account to existing user
        user.googleId = googleId;
        user.isGoogleUser = true;
        if (!user.avatarUrl && picture) {
          user.avatarUrl = picture;
        }
        if (!user.fullName && name) {
          user.fullName = name;
        }
        await user.save();
      } else {
        // Create new user with Google account
        // Generate username from email or name
        const baseUsername = email.split('@')[0] || name.toLowerCase().replace(/\s+/g, '');
        let username = baseUsername;
        let counter = 1;
        
        // Ensure username is unique
        while (await User.findOne({ username })) {
          username = `${baseUsername}${counter}`;
          counter++;
        }

        user = new User({
          username,
          email,
          fullName: name || username,
          avatarUrl: picture || '',
          googleId,
          isGoogleUser: true,
          role: 'user',
          coins: 0
        });

        await user.save();
        console.log('✅ New Google user created:', user.username);
      }
    } else {
      // Update user info if changed
      if (picture && user.avatarUrl !== picture) {
        user.avatarUrl = picture;
      }
      if (name && user.fullName !== name) {
        user.fullName = name;
      }
      await user.save();
    }

    // Create JWT token
    const jwtPayload = {
      id: user.id,
      username: user.username,
      role: user.role
    };

    const token = jwt.sign(jwtPayload, process.env.JWT_SECRET, {
      expiresIn: '30d'
    });

    console.log('✅ Google user logged in:', user.username);

    // Return user data
    res.json({
      token,
      user: {
        id: user.id,
        _id: user._id,
        username: user.username,
        email: user.email,
        fullName: user.fullName,
        role: user.role,
        coins: user.coins || 0,
        hocCap: user.hocCap || '',
        lop: user.lop || '',
        chuyenNganh: user.chuyenNganh || '',
        phone: user.phone || '',
        bio: user.bio || '',
        avatarUrl: user.avatarUrl || '',
        createdAt: user.createdAt,
        purchasedDocuments: user.purchasedDocuments || [],
        savedDocuments: user.savedDocuments || [],
        isGoogleUser: user.isGoogleUser
      }
    });
  } catch (error) {
    console.error('❌ Google auth error:', error);
    res.status(500).json({ message: 'Google authentication failed', error: error.message });
  }
});

module.exports = router;