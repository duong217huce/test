const mongoose = require('mongoose');

const ratingSchema = new mongoose.Schema({
  document: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Document',
    required: true
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  rating: {
    type: Number,
    required: true,
    min: 1,
    max: 5
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Index để tránh user đánh giá nhiều lần
ratingSchema.index({ document: 1, user: 1 }, { unique: true });

module.exports = mongoose.model('Rating', ratingSchema);
