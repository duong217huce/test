const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  fullName: { type: String },
  phone: { type: String },
  hocCap: { type: String },
  lop: { type: String },
  chuyenNganh: { type: String },
  bio: { type: String, default: 'Thành viên của EDUCONNECT' },
  avatar: { type: String, default: '' },
  role: { type: String, enum: ['user', 'admin'], default: 'user' },
  coins: { type: Number, default: 0 }, // DP (Document Points)
  savedDocuments: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Document' }],
  purchasedDocuments: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Document' }], // ✅ THÊM
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('User', userSchema);
