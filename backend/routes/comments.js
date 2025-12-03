const express = require('express');
const router = express.Router();
const Comment = require('../models/Comment');
const Document = require('../models/Document');
const auth = require('../middleware/auth');

// @route   POST /api/comments
// @desc    Create a new comment or reply
// @access  Private
router.post('/', auth, async (req, res) => {
  try {
    const { documentId, content, parentCommentId } = req.body;

    // Validate document exists
    const document = await Document.findById(documentId);
    if (!document) {
      return res.status(404).json({ message: 'Document not found' });
    }

    // Create new comment
    const newComment = new Comment({
      user: req.user.id,
      document: documentId,
      content,
      parentComment: parentCommentId || null
    });

    await newComment.save();

    // Populate user info before returning
    const populatedComment = await Comment.findById(newComment._id)
      .populate('user', 'username fullName avatarUrl')
      .populate({
        path: 'replies',
        populate: [
          { path: 'user', select: 'username fullName avatarUrl' },
          { path: 'likes' }
        ]
      })
      .populate('likes');

    console.log('✅ Comment created:', newComment._id);
    res.status(201).json(populatedComment);
  } catch (error) {
    console.error('❌ Error creating comment:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// @route   GET /api/comments/:documentId
// @desc    Get all comments for a document
// @access  Public
router.get('/:documentId', async (req, res) => {
  try {
    const comments = await Comment.find({
      document: req.params.documentId,
      parentComment: null // Only get top-level comments
    })
      .populate('user', 'username fullName avatarUrl')
      .populate({
        path: 'replies',
        populate: [
          { path: 'user', select: 'username fullName avatarUrl' },
          { path: 'likes' }
        ]
      })
      .populate('likes')
      .sort({ createdAt: -1 });

    console.log('✅ Fetched comments for document:', req.params.documentId, '- Count:', comments.length);
    res.json(comments);
  } catch (error) {
    console.error('❌ Error fetching comments:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// @route   PUT /api/comments/:id
// @desc    Update a comment
// @access  Private (only owner)
router.put('/:id', auth, async (req, res) => {
  try {
    const { content } = req.body;

    const comment = await Comment.findById(req.params.id);

    if (!comment) {
      return res.status(404).json({ message: 'Comment not found' });
    }

    // Check if user is the comment owner
    if (comment.user.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    comment.content = content;
    comment.updatedAt = Date.now();
    await comment.save();

    const updatedComment = await Comment.findById(comment._id)
      .populate('user', 'username fullName avatarUrl')
      .populate({
        path: 'replies',
        populate: [
          { path: 'user', select: 'username fullName avatarUrl' },
          { path: 'likes' }
        ]
      })
      .populate('likes');

    console.log('✅ Comment updated:', comment._id);
    res.json(updatedComment);
  } catch (error) {
    console.error('❌ Error updating comment:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// @route   DELETE /api/comments/:id
// @desc    Delete a comment
// @access  Private (owner or admin)
router.delete('/:id', auth, async (req, res) => {
  try {
    const comment = await Comment.findById(req.params.id);

    if (!comment) {
      return res.status(404).json({ message: 'Comment not found' });
    }

    // Check if user is comment owner OR admin
    if (comment.user.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized' });
    }

    // Delete all replies first
    await Comment.deleteMany({ parentComment: comment._id });
    
    // Delete the comment itself
    await Comment.findByIdAndDelete(req.params.id);

    console.log('✅ Comment deleted:', req.params.id);
    res.json({ message: 'Comment deleted successfully' });
  } catch (error) {
    console.error('❌ Error deleting comment:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// @route   POST /api/comments/:id/like
// @desc    Like/Unlike a comment
// @access  Private
router.post('/:id/like', auth, async (req, res) => {
  try {
    const comment = await Comment.findById(req.params.id);

    if (!comment) {
      return res.status(404).json({ message: 'Comment not found' });
    }

    const likeIndex = comment.likes.indexOf(req.user.id);

    if (likeIndex > -1) {
      // Unlike
      comment.likes.splice(likeIndex, 1);
    } else {
      // Like
      comment.likes.push(req.user.id);
    }

    await comment.save();

    const updatedComment = await Comment.findById(comment._id)
      .populate('user', 'username fullName avatarUrl')
      .populate('likes')
      .populate({
        path: 'replies',
        populate: [
          { path: 'user', select: 'username fullName avatarUrl' },
          { path: 'likes' }
        ]
      });

    console.log('✅ Comment like toggled:', comment._id);
    res.json(updatedComment);
  } catch (error) {
    console.error('❌ Error toggling like:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;
