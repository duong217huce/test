const Rating = require('../models/Rating');
const Document = require('../models/Document');

exports.rateDocument = async (req, res) => {
  try {
    const { rating } = req.body;
    const { documentId } = req.params;
    
    // Kiểm tra đã đánh giá chưa
    let existingRating = await Rating.findOne({
      documentId,
      userId: req.userId
    });
    
    if (existingRating) {
      existingRating.rating = rating;
      await existingRating.save();
    } else {
      existingRating = new Rating({
        documentId,
        userId: req.userId,
        rating
      });
      await existingRating.save();
    }
    
    // Cập nhật average rating
    const ratings = await Rating.find({ documentId });
    const avgRating = ratings.reduce((sum, r) => sum + r.rating, 0) / ratings.length;
    
    await Document.findByIdAndUpdate(documentId, {
      averageRating: avgRating
    });
    
    res.json({ message: 'Đánh giá thành công', rating: existingRating });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getUserRating = async (req, res) => {
  try {
    const rating = await Rating.findOne({
      documentId: req.params.documentId,
      userId: req.userId
    });
    
    res.json(rating);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
