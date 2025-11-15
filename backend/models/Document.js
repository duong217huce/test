const mongoose = require('mongoose');

const documentSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String },
  pages: { type: Number },
  fileSize: { type: String },
  fileUrl: { type: String },
  thumbnailUrl: { type: String },
  uploadedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  grade: { type: String },    // "Lớp 10", "Đại học", ...
  subject: { type: String },
  category: { type: String }, // "education", "literature", "thesis"...
  tags: [String],
  rating: { type: Number, default: 0 },
  totalRatings: { type: Number, default: 0 },
  downloads: { type: Number, default: 0 },
  views: { type: Number, default: 0 },
  isPrivate: { type: Boolean, default: false },
  isPremium: { type: Boolean, default: false },
  price: { type: Number, default: 0 }, // DP price nếu là tài liệu tính phí
  uploadDate: { type: Date, default: Date.now }
}, { timestamps: true });

module.exports = mongoose.model('Document', documentSchema);
