const mongoose = require('mongoose');

const commentSchema = new mongoose.Schema({
  documentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Document', required: true },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  content: { type: String, required: true },
  parentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Comment', default: null }, // reply comment
  isReported: { type: Boolean, default: false },
}, { timestamps: true });

module.exports = mongoose.model('Comment', commentSchema);
