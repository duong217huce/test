const express = require('express');
const router = express.Router();
const Document = require('../models/Document');
const User = require('../models/User');
const auth = require('../middleware/auth');
const { isAdmin } = require('../middleware/auth');

// Middleware: Tất cả routes admin phải authenticate và check admin
router.use(auth);
router.use(isAdmin);

// GET /api/admin/statistics
router.get('/statistics', async (req, res) => {
  try {
    const { filterType, date } = req.query;
    
    // Tính toán khoảng thời gian dựa vào filterType
    const now = new Date(date || Date.now());
    let startDate;
    
    switch(filterType) {
      case 'day':
        startDate = new Date(now.setHours(0, 0, 0, 0));
        break;
      case 'week':
        startDate = new Date(now.setDate(now.getDate() - 7));
        break;
      case 'month':
        startDate = new Date(now.setMonth(now.getMonth() - 1));
        break;
      case 'year':
        startDate = new Date(now.setFullYear(now.getFullYear() - 1));
        break;
      default:
        startDate = new Date(now.setMonth(now.getMonth() - 1));
    }

    console.log('📊 Fetching statistics from:', startDate.toISOString());

    // Tổng số tài liệu trong khoảng thời gian
    const totalDocuments = await Document.countDocuments({
      uploadDate: { $gte: startDate }
    });

    // Chủ đề phổ biến nhất
    const categoryStats = await Document.aggregate([
      { $match: { uploadDate: { $gte: startDate } } },
      { $group: { _id: '$category', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 1 }
    ]);
    const topCategory = categoryStats[0]?._id || 'N/A';

    // Môn học phổ biến nhất
    const subjectStats = await Document.aggregate([
      { $match: { uploadDate: { $gte: startDate }, subject: { $exists: true, $ne: '' } } },
      { $group: { _id: '$subject', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 1 }
    ]);
    const topSubject = subjectStats[0]?._id || 'N/A';

    // Cấp độ phổ biến nhất
    const gradeStats = await Document.aggregate([
      { $match: { uploadDate: { $gte: startDate }, grade: { $exists: true, $ne: '' } } },
      { $group: { _id: '$grade', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 1 }
    ]);
    const topGrade = gradeStats[0]?._id || 'N/A';

    // Tài liệu nhiều bình luận nhất
    const mostCommentedDoc = await Document.findOne({
      uploadDate: { $gte: startDate }
    })
    .populate('uploadedBy', 'username')
    .sort({ commentCount: -1 })
    .limit(1);

    // Tài liệu đánh giá cao nhất
    const highestRatedDoc = await Document.findOne({
      uploadDate: { $gte: startDate },
      totalRatings: { $gt: 0 }
    })
    .populate('uploadedBy', 'username')
    .sort({ averageRating: -1 })
    .limit(1);

    console.log('✅ Statistics fetched successfully');

    res.json({
      totalDocuments,
      topCategory,
      topSubject,
      topGrade,
      mostCommentedDoc,
      highestRatedDoc
    });
  } catch (error) {
    console.error('❌ Error fetching statistics:', error);
    res.status(500).json({ message: error.message });
  }
});

// GET /api/admin/users - Danh sách người dùng
router.get('/users', async (req, res) => {
  try {
    const users = await User.find()
      .select('-password')
      .sort({ createdAt: -1 });
    
    console.log(`✅ Fetched ${users.length} users`);
    res.json(users);
  } catch (error) {
    console.error('❌ Error fetching users:', error);
    res.status(500).json({ message: error.message });
  }
});

// GET /api/admin/users/:userId/documents - Tài liệu của user
router.get('/users/:userId/documents', async (req, res) => {
  try {
    const documents = await Document.find({ 
      uploadedBy: req.params.userId 
    })
    .sort({ uploadDate: -1 });
    
    console.log(`✅ Fetched ${documents.length} documents for user ${req.params.userId}`);
    res.json(documents);
  } catch (error) {
    console.error('❌ Error fetching user documents:', error);
    res.status(500).json({ message: error.message });
  }
});

// PUT /api/admin/users/:userId/coins - Cập nhật DP
router.put('/users/:userId/coins', async (req, res) => {
  try {
    const { coins } = req.body;
    
    if (typeof coins !== 'number' || coins < 0) {
      return res.status(400).json({ message: 'Invalid coins value' });
    }
    
    const user = await User.findByIdAndUpdate(
      req.params.userId,
      { coins: parseInt(coins) },
      { new: true }
    ).select('-password');
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    console.log(`✅ Updated coins for user ${user.username}: ${coins} DP`);
    res.json({ message: 'Coins updated successfully', user });
  } catch (error) {
    console.error('❌ Error updating coins:', error);
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
