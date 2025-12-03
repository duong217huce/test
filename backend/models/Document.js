const mongoose = require('mongoose');

const documentSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  category: { type: String, required: true },
  subject: { type: String }, // ✅ Môn học
  grade: { type: String }, // ✅ Cấp độ
  field: { type: String }, // ✅ Lĩnh vực
  fileUrl: { type: String, required: true },
  fileName: { type: String },
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
  commentCount: { type: Number, default: 0 }, // ✅ Số lượng bình luận
  isPaid: { type: Boolean, default: false },
  price: { type: Number, default: 10 },
  averageRating: { type: Number, default: 0 },
  totalRatings: { type: Number, default: 0 }
});

// ✅ Middleware: Tự động set isPaid = true nếu fileSize >= 10MB
documentSchema.pre('save', function(next) {
  const TEN_MB = 10 * 1024 * 1024; // 10MB in bytes
  if (this.fileSize >= TEN_MB) {
    this.isPaid = true;
    this.price = 10;
  } else {
    this.isPaid = false;
    this.price = 0;
  }
  next();
});

// ✅ Index để tăng tốc độ query
documentSchema.index({ uploadDate: -1 });
documentSchema.index({ category: 1 });
documentSchema.index({ subject: 1 });
documentSchema.index({ grade: 1 });
documentSchema.index({ averageRating: -1 });
documentSchema.index({ commentCount: -1 });
documentSchema.index({ uploadedBy: 1 });

module.exports = mongoose.model('Document', documentSchema);