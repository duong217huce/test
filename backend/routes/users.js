const express = require('express');
const router = express.Router();
const User = require('../models/User');
const auth = require('../middleware/auth');

// @route   POST /api/users/saved/:documentId
// @desc    Lưu hoặc bỏ lưu tài liệu
// @access  Private
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
      return res.json({ 
        message: 'Đã bỏ lưu tài liệu', 
        isSaved: false 
      });
    } else {
      user.savedDocuments.push(documentId);
      await user.save();
      console.log('📗 Added to saved:', documentId);
      return res.json({ 
        message: 'Đã lưu tài liệu', 
        isSaved: true 
      });
    }
  } catch (error) {
    console.error('❌ Error toggling saved document:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// @route   GET /api/users/saved
// @desc    Lấy danh sách tài liệu đã lưu
// @access  Private
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

// @route   GET /api/users/saved/check/:documentId
// @desc    Kiểm tra tài liệu đã lưu chưa
// @access  Private
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
