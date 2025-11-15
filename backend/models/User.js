const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true }, // nhớ sẽ hash
  email: { type: String, unique: true, sparse: true }, // có thể cho phép null
  phone: { type: String },
  fullName: { type: String },
  avatar: { type: String },
  isAdmin: { type: Boolean, default: false },
  points: { type: Number, default: 0 }, // DP
  joinDate: { type: Date, default: Date.now },
  totalUploads: { type: Number, default: 0 },
  totalDownloads: { type: Number, default: 0 },
  totalViews: { type: Number, default: 0 },
  savedDocuments: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Document' }]
}, { timestamps: true });

module.exports = mongoose.model('User', userSchema);
