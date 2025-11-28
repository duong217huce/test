const express = require('express');
const router = express.Router();
const Report = require('../models/Report');
const auth = require('../middleware/auth');

// Create document report
router.post('/document', auth, async (req, res) => {
  try {
    const { documentId, documentTitle, reasons } = req.body;

    // Check if user already reported this document
    const existingReport = await Report.findOne({
      type: 'document',
      documentId,
      reportedBy: req.user.userId
    });

    if (existingReport) {
      return res.status(400).json({ message: 'Ban da bao cao tai lieu nay roi' });
    }

    const report = new Report({
      type: 'document',
      reportedBy: req.user.userId,
      documentId,
      documentTitle,
      reasons
    });

    await report.save();
    res.status(201).json({ message: 'Bao cao thanh cong', report });
  } catch (error) {
    console.error('Error creating document report:', error);
    res.status(500).json({ message: 'Loi server' });
  }
});

// Create comment report
router.post('/comment', auth, async (req, res) => {
  try {
    const { commentId, commentContent, documentId, documentTitle, reasons } = req.body;

    // Check if user already reported this comment
    const existingReport = await Report.findOne({
      type: 'comment',
      commentId,
      reportedBy: req.user.userId
    });

    if (existingReport) {
      return res.status(400).json({ message: 'Ban da bao cao binh luan nay roi' });
    }

    const report = new Report({
      type: 'comment',
      reportedBy: req.user.userId,
      documentId,
      documentTitle,
      commentId,
      commentContent,
      reasons
    });

    await report.save();
    res.status(201).json({ message: 'Bao cao thanh cong', report });
  } catch (error) {
    console.error('Error creating comment report:', error);
    res.status(500).json({ message: 'Loi server' });
  }
});

module.exports = router;
