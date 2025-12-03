const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  username: { type: String, unique: true, sparse: true }, // Made optional for Google users
  password: { type: String }, // Made optional for Google users
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
  // Google OAuth fields
  googleId: { type: String, unique: true, sparse: true },
  isGoogleUser: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now }
});

// Validation: Either password or googleId must be present
userSchema.pre('validate', function(next) {
  if (!this.password && !this.googleId) {
    return next(new Error('Either password or Google ID is required'));
  }
  next();
});

module.exports = mongoose.model('User', userSchema);