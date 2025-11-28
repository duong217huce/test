const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  fullName: { type: String },
  phone: { type: String },
  hocCap: { type: String },
  lop: { type: String },
  chuyenNganh: { type: String },
  bio: { type: String },
  avatarUrl: { type: String },
  coins: { type: Number, default: 0 },
  role: { type: String, enum: ['user', 'admin'], default: 'user' }, // ✅ Role field
  purchasedDocuments: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Document' }],
  savedDocuments: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Document' }],
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('User', userSchema);
