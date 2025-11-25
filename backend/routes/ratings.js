const express = require('express');
const router = express.Router();
const Rating = require('../models/Rating');
const Document = require('../models/Document');
const auth = require('../middleware/auth');

// @route   GET /api/ratings/:documentId
// @desc    Lấy rating của user cho tài liệu
// @access  Private
router.get('/:documentId', auth, async (req, res) => {
  try {
    const documentId = req.params.documentId;
    const userId = req.user.id;

    const rating = await Rating.findOne({ 
      document: documentId, 
      user: userId 
    });

    if (!rating) {
      return res.json({ userRating: 0 });
    }

    res.json({ userRating: rating.rating });
  } catch (error) {
    console.error('❌ Error fetching rating:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// @route   POST /api/ratings
// @desc    Đánh giá tài liệu
// @access  Private
router.post('/', auth, async (req, res) => {
  try {
    const { documentId, rating } = req.body;
    const userId = req.user.id;

    // Validate rating (1-5 sao)
    if (!rating || rating < 1 || rating > 5) {
      return res.status(400).json({ message: 'Rating phải từ 1 đến 5 sao' });
    }

    // Kiểm tra tài liệu tồn tại
    const document = await Document.findById(documentId);
    if (!document) {
      return res.status(404).json({ message: 'Tài liệu không tồn tại' });
    }

    // Kiểm tra đã đánh giá chưa
    let existingRating = await Rating.findOne({ 
      document: documentId, 
      user: userId 
    });

    if (existingRating) {
      // Cập nhật rating cũ
      existingRating.rating = rating;
      await existingRating.save();
      console.log('⭐ Updated rating:', rating);
    } else {
      // Tạo rating mới
      existingRating = new Rating({
        document: documentId,
        user: userId,
        rating
      });
      await existingRating.save();
      console.log('⭐ Created rating:', rating);
    }

    // Tính lại average rating
    const allRatings = await Rating.find({ document: documentId });
    const totalRatings = allRatings.length;
    const sumRatings = allRatings.reduce((sum, r) => sum + r.rating, 0);
    const averageRating = totalRatings > 0 ? (sumRatings / totalRatings).toFixed(1) : 0;

    // Cập nhật document
    document.averageRating = averageRating;
    document.totalRatings = totalRatings;
    await document.save();

    res.json({
      message: `Bạn đã đánh giá ${rating} sao cho tài liệu`,
      userRating: rating,
      averageRating,
      totalRatings
    });
  } catch (error) {
    console.error('❌ Error creating rating:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;
