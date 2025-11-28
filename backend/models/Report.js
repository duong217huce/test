const mongoose = require('mongoose');

const reportSchema = new mongoose.Schema({
  type: {
    type: String,
    enum: ['document', 'comment'],
    required: true
  },
  reportedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  documentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Document',
    required: true
  },
  documentTitle: {
    type: String,
    required: true
  },
  commentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Comment'
  },
  commentContent: {
    type: String
  },
  reasons: {
    violateStandards: {
      type: Boolean,
      default: false
    },
    offensiveSpeech: {
      type: Boolean,
      default: false
    },
    spam: {
      type: Boolean,
      default: false
    },
    additional: {
      type: String,
      default: ''
    }
  },
  isRead: {
    type: Boolean,
    default: false
  },
  status: {
    type: String,
    enum: ['pending', 'reviewed', 'resolved'],
    default: 'pending'
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Index for faster queries
reportSchema.index({ isRead: 1, createdAt: -1 });
reportSchema.index({ type: 1 });
reportSchema.index({ documentId: 1 });

module.exports = mongoose.model('Report', reportSchema);
