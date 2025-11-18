const express = require('express');
const router = express.Router();
const Comment = require('../models/Comment');
const auth = require('../middleware/auth');

// @route   GET /api/comments/:documentId
// @desc    Get all comments for a document
// @access  Public
router.get('/:documentId', async (req, res) => {
  try {
    const comments = await Comment.find({ 
      document: req.params.documentId,
      parentComment: null
    })
      .populate('user', 'username fullName email')
      .populate({
        path: 'likes',
        select: 'username'
      })
      .sort({ createdAt: -1 });

    const commentsWithReplies = await Promise.all(
      comments.map(async (comment) => {
        const replies = await Comment.find({ parentComment: comment._id })
          .populate('user', 'username fullName email')
          .populate('likes', 'username')
          .sort({ createdAt: 1 });
        
        return {
          ...comment.toObject(),
          replies: replies
        };
      })
    );

    console.log('💬 Loaded comments:', commentsWithReplies.length);
    res.json(commentsWithReplies);
  } catch (error) {
    console.error('❌ Error fetching comments:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// @route   POST /api/comments
// @desc    Create a new comment or reply
// @access  Private
router.post('/', auth, async (req, res) => {
  try {
    const { documentId, content, parentCommentId } = req.body;

    if (!content || content.trim().length === 0) {
      return res.status(400).json({ message: 'Comment content is required' });
    }

    if (content.length > 1000) {
      return res.status(400).json({ message: 'Comment too long (max 1000 characters)' });
    }

    const newComment = new Comment({
      document: documentId,
      user: req.user.id,
      content: content.trim(),
      parentComment: parentCommentId || null
    });

    await newComment.save();
    
    const populatedComment = await Comment.findById(newComment._id)
      .populate('user', 'username fullName email')
      .populate('likes', 'username');

    console.log('✅ Comment created by:', populatedComment.user?.username);

    res.status(201).json(populatedComment);
  } catch (error) {
    console.error('❌ Error creating comment:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// @route   PUT /api/comments/:id
// @desc    Edit a comment
// @access  Private (only owner)
router.put('/:id', auth, async (req, res) => {
  try {
    const comment = await Comment.findById(req.params.id);

    if (!comment) {
      return res.status(404).json({ message: 'Comment not found' });
    }

    if (comment.user.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    const { content } = req.body;

    if (!content || content.trim().length === 0) {
      return res.status(400).json({ message: 'Comment content is required' });
    }

    comment.content = content.trim();
    comment.updatedAt = Date.now();
    await comment.save();

    const updatedComment = await Comment.findById(comment._id)
      .populate('user', 'username fullName email')
      .populate('likes', 'username');

    res.json(updatedComment);
  } catch (error) {
    console.error('❌ Error updating comment:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// @route   DELETE /api/comments/:id
// @desc    Delete a comment
// @access  Private (only owner)
router.delete('/:id', auth, async (req, res) => {
  try {
    const comment = await Comment.findById(req.params.id);

    if (!comment) {
      return res.status(404).json({ message: 'Comment not found' });
    }

    if (comment.user.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    await Comment.deleteMany({ parentComment: comment._id });
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

    const userId = req.user.id;
    const likeIndex = comment.likes.indexOf(userId);

    if (likeIndex > -1) {
      comment.likes.splice(likeIndex, 1);
    } else {
      comment.likes.push(userId);
    }

    await comment.save();

    const updatedComment = await Comment.findById(comment._id)
      .populate('user', 'username fullName email')
      .populate('likes', 'username');

    res.json(updatedComment);
  } catch (error) {
    console.error('❌ Error liking comment:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;
