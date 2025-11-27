const express = require('express');
const router = express.Router();
const User = require('../models/User');
const auth = require('../middleware/auth');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// ✅ CẤU HÌNH MULTER CHO AVATAR
const avatarStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    const avatarDir = path.join(__dirname, '../uploads/avatars');
    if (!fs.existsSync(avatarDir)) {
      fs.mkdirSync(avatarDir, { recursive: true });
    }
    cb(null, avatarDir);
  },
  filename: (req, file, cb) => {
    const uniqueName = `avatar-${req.user.id}-${Date.now()}${path.extname(file.originalname)}`;
    cb(null, uniqueName);
  }
});

const avatarUpload = multer({
  storage: avatarStorage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);
    if (extname && mimetype) {
      cb(null, true);
    } else {
      cb(new Error('Chỉ chấp nhận file ảnh (jpg, png, gif)'));
    }
  }
});

// ✅ ROUTE UPLOAD AVATAR
router.post('/avatar', auth, avatarUpload.single('avatar'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'Vui lòng chọn file ảnh' });
    }

    const avatarUrl = `/uploads/avatars/${req.file.filename}`;
    
    // Xóa avatar cũ nếu có
    const user = await User.findById(req.user.id);
    if (user.avatar && user.avatar.startsWith('/uploads/avatars/')) {
      const oldAvatarPath = path.join(__dirname, '..', user.avatar);
      if (fs.existsSync(oldAvatarPath)) {
        fs.unlinkSync(oldAvatarPath);
        console.log('🗑️ Deleted old avatar');
      }
    }

    // Cập nhật avatar mới
    user.avatar = avatarUrl;
    await user.save();

    console.log('✅ Avatar uploaded:', avatarUrl);
    res.json({ 
      message: 'Upload ảnh đại diện thành công',
      avatarUrl: avatarUrl
    });
  } catch (error) {
    console.error('❌ Error uploading avatar:', error);
    if (req.file && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }
    res.status(500).json({ message: 'Lỗi server', error: error.message });
  }
});

// ... các route cũ giữ nguyên ...

router.get('/me', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    console.log('✅ Fetched user info:', user.username);
    res.json(user);
  } catch (err) {
    console.error('❌ Error getting user:', err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

router.put('/me', auth, async (req, res) => {
  try {
    const { fullName, hocCap, lop, chuyenNganh, phone, bio } = req.body;
    const userId = req.user.id;

    console.log('📝 Updating user:', userId);
    console.log('📄 Update data:', req.body);

    const updateFields = {};
    if (fullName !== undefined) updateFields.fullName = fullName;
    if (hocCap !== undefined) updateFields.hocCap = hocCap;
    if (lop !== undefined) updateFields.lop = lop;
    if (chuyenNganh !== undefined) updateFields.chuyenNganh = chuyenNganh;
    if (phone !== undefined) updateFields.phone = phone;
    if (bio !== undefined) updateFields.bio = bio;

    const user = await User.findByIdAndUpdate(
      userId,
      updateFields,
      { new: true, runValidators: true }
    ).select('-password');

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    console.log('✅ User updated successfully:', user.username);
    res.json(user);
  } catch (err) {
    console.error('❌ Error updating user:', err);
    res.status(500).json({ message: 'Lỗi server', error: err.message });
  }
});

router.post('/saved/:documentId', auth, async (req, res) => {
  try {
    const userId = req.user.id;
    const documentId = req.params.documentId;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const isSaved = user.savedDocuments.includes(documentId);

    if (isSaved) {
      user.savedDocuments = user.savedDocuments.filter(
        id => id.toString() !== documentId
      );
      await user.save();
      console.log('📕 Removed from saved:', documentId);
      return res.json({ message: 'Đã bỏ lưu tài liệu', isSaved: false });
    } else {
      user.savedDocuments.push(documentId);
      await user.save();
      console.log('📗 Added to saved:', documentId);
      return res.json({ message: 'Đã lưu tài liệu', isSaved: true });
    }
  } catch (error) {
    console.error('❌ Error toggling saved document:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

router.get('/saved', auth, async (req, res) => {
  try {
    const userId = req.user.id;

    const user = await User.findById(userId)
      .populate({
        path: 'savedDocuments',
        populate: {
          path: 'uploadedBy',
          select: 'username fullName'
        }
      });

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    console.log('📚 Fetched saved documents:', user.savedDocuments.length);
    res.json(user.savedDocuments);
  } catch (error) {
    console.error('❌ Error fetching saved documents:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

router.get('/saved/check/:documentId', auth, async (req, res) => {
  try {
    const userId = req.user.id;
    const documentId = req.params.documentId;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const isSaved = user.savedDocuments.includes(documentId);
    res.json({ isSaved });
  } catch (error) {
    console.error('❌ Error checking saved status:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;
