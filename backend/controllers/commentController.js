const Comment = require('../models/Comment');

exports.getCommentsByDocument = async (req, res) => {
  try {
    const comments = await Comment.find({ documentId: req.params.documentId })
      .populate('userId', 'username fullName')
      .sort('-createdAt');
    
    res.json(comments);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.createComment = async (req, res) => {
  try {
    const { content } = req.body;
    const { documentId } = req.params;
    
    const comment = new Comment({
      documentId,
      userId: req.userId,
      content
    });
    
    await comment.save();
    await comment.populate('userId', 'username fullName');
    
    res.status(201).json(comment);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.deleteComment = async (req, res) => {
  try {
    const comment = await Comment.findById(req.params.id);
    
    if (!comment) {
      return res.status(404).json({ message: 'Không tìm thấy bình luận' });
    }
    
    // Chỉ cho phép xóa bình luận của chính mình
    if (comment.userId.toString() !== req.userId) {
      return res.status(403).json({ message: 'Không có quyền xóa bình luận này' });
    }
    
    await comment.deleteOne();
    res.json({ message: 'Xóa bình luận thành công' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};