const mongoose = require('mongoose');

const documentSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  category: { type: String, required: true },
  fileUrl: { type: String, required: true },
  coverImage: { type: String, default: null },
  fileType: { type: String, required: true },
  fileSize: { type: Number, required: true },
  uploadedBy: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User',  
    required: true
  },
  uploadDate: { type: Date, default: Date.now },
  tags: [{ type: String }],
  downloads: { type: Number, default: 0 },
  views: { type: Number, default: 0 },
  isPaid: { type: Boolean, default: false }, // ✅ Tự động tính dựa vào fileSize
  price: { type: Number, default: 10 }, // ✅ Giá cố định 10 DP
  averageRating: { type: Number, default: 0 },
  totalRatings: { type: Number, default: 0 },
});

// ✅ Middleware: Tự động set isPaid = true nếu fileSize >= 10MB
documentSchema.pre('save', function(next) {
  const TEN_MB = 4 * 1024 * 1024; // 10MB in bytes
  if (this.fileSize >= TEN_MB) {
    this.isPaid = true;
    this.price = 10;
  } else {
    this.isPaid = false;
    this.price = 0;
  }
  next();
});

module.exports = mongoose.model('Document', documentSchema);
