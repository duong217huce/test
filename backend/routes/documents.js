const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const mammoth = require('mammoth');
const Document = require('../models/Document');
const auth = require('../middleware/auth');

// Tạo thư mục uploads nếu chưa tồn tại
const uploadsDir = path.join(__dirname, '../uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Cấu hình multer để lưu file
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadsDir);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 50 * 1024 * 1024 // 50MB
  },
  fileFilter: function (req, file, cb) {
    const allowedTypes = /pdf|doc|docx|ppt|pptx|xls|xlsx|txt/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);

    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error('Chỉ chấp nhận file: PDF, DOC, DOCX, PPT, PPTX, XLS, XLSX, TXT'));
    }
  }
});

// @route   GET /api/documents
// @desc    Get all documents
// @access  Public
router.get('/', async (req, res) => {
  try {
    const { category, uploadedBy } = req.query;
    
    let filter = {};
    
    if (category) {
      filter.category = category;
    }
    
    if (uploadedBy) {
      filter.uploadedBy = uploadedBy;
    }
    
    const documents = await Document.find(filter)
      .populate('uploadedBy', 'username fullName')
      .sort({ uploadDate: -1 });
    
    res.json(documents);
  } catch (error) {
    console.error('❌ Error fetching documents:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

router.get('/search', async (req, res) => {
  try {
    const { q, limit } = req.query;
    
    if (!q || q.trim() === '') {
      return res.json([]);
    }

    // Tìm kiếm theo title, description, tags, category
    const searchRegex = new RegExp(q, 'i'); // 'i' = case insensitive
    
    const documents = await Document.find({
      $or: [
        { title: searchRegex },
        { description: searchRegex },
        { tags: searchRegex },
        { category: searchRegex }
      ]
    })
    .populate('uploadedBy', 'username fullName')
    .limit(parseInt(limit) || 10)
    .sort({ uploadDate: -1 })
    .select('title description category uploadDate views downloads fileType');

    console.log(`🔍 Search query: "${q}" - Found ${documents.length} results`);
    
    res.json(documents);
  } catch (error) {
    console.error('❌ Error searching documents:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});


// @route   GET /api/documents/:id
// @desc    Get single document by ID
// @access  Public
router.get('/:id', async (req, res) => {
  try {
    const document = await Document.findById(req.params.id)
      .populate('uploadedBy', 'username fullName');
    
    if (!document) {
      return res.status(404).json({ message: 'Document not found' });
    }
    
    // Tăng lượt xem
    document.views += 1;
    await document.save();
    
    res.json(document);
  } catch (error) {
    console.error('❌ Error fetching document:', error);
    
    if (error.kind === 'ObjectId') {
      return res.status(404).json({ message: 'Document not found' });
    }
    
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// @route   GET /api/documents/:id/preview
// @desc    Convert DOCX to HTML for preview
// @access  Public
router.get('/:id/preview', async (req, res) => {
  try {
    const document = await Document.findById(req.params.id);
    
    if (!document) {
      return res.status(404).json({ message: 'Document not found' });
    }

    // Chỉ convert file Word
    const fileType = document.fileType || '';
    if (!fileType.includes('word') && !fileType.includes('document')) {
      return res.status(400).json({ message: 'Only Word documents supported' });
    }

    // Lấy đường dẫn file
    const filename = path.basename(document.fileUrl);
    const filePath = path.join(uploadsDir, filename);

    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ message: 'File not found' });
    }

    console.log('📄 Converting DOCX to HTML:', filename);

    // Convert DOCX sang HTML
    const result = await mammoth.convertToHtml({ path: filePath });
    const html = result.value;

    // Trả về HTML với styling
    const styledHtml = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>${document.title}</title>
        <style>
          body {
            font-family: 'Times New Roman', 'Arial', serif;
            line-height: 1.6;
            padding: 40px;
            max-width: 800px;
            margin: 0 auto;
            background: #fff;
            color: #333;
          }
          p { margin-bottom: 1em; }
          h1, h2, h3, h4, h5, h6 { 
            color: #133a5c; 
            margin-top: 1.5em; 
            margin-bottom: 0.5em;
          }
          img { 
            max-width: 100%; 
            height: auto; 
            display: block;
            margin: 1em 0;
          }
          table { 
            border-collapse: collapse; 
            width: 100%; 
            margin: 1em 0; 
          }
          td, th { 
            border: 1px solid #ddd; 
            padding: 8px; 
            text-align: left;
          }
          th {
            background-color: #f5f5f5;
            font-weight: bold;
          }
          ul, ol {
            margin-left: 2em;
            margin-bottom: 1em;
          }
          blockquote {
            border-left: 4px solid #4ba3d6;
            padding-left: 1em;
            margin-left: 0;
            font-style: italic;
            color: #666;
          }
        </style>
      </head>
      <body>
        ${html}
      </body>
      </html>
    `;

    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    res.send(styledHtml);
    
    console.log('✅ DOCX converted successfully');
  } catch (error) {
    console.error('❌ Error converting DOCX:', error);
    res.status(500).json({ message: 'Error converting document', error: error.message });
  }
});

// @route   POST /api/documents
// @desc    Upload a new document
// @access  Private
router.post('/', auth, upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    const { title, description, category, tags, isPaid, price } = req.body;

    const fileUrl = `${req.protocol}://${req.get('host')}/uploads/${req.file.filename}`;
    
    console.log('📤 Upload request from user:', req.user?.id || 'GUEST');
    console.log('📄 File URL:', fileUrl);
    
    let tagsArray = [];
    if (tags) {
      if (typeof tags === 'string') {
        tagsArray = tags.split(',').map(tag => tag.trim()).filter(tag => tag.length > 0);
      } else if (Array.isArray(tags)) {
        tagsArray = tags;
      }
    }

    const newDocument = new Document({
      title,
      description,
      category,
      fileUrl,
      fileType: req.file.mimetype,
      fileSize: req.file.size,
      uploadedBy: req.user?.id || null,
      tags: tagsArray,
      isPaid: isPaid === 'true' || isPaid === true,
      price: price ? parseInt(price) : 0
    });

    const savedDocument = await newDocument.save();
    console.log('✅ Document saved:', savedDocument._id);

    if (req.user?.id) {
      const User = require('../models/User');
      await User.findByIdAndUpdate(req.user.id, {
        $inc: { documentPoints: 10 }
      });
    }

    res.status(201).json({
      message: 'Document uploaded successfully',
      document: savedDocument
    });
  } catch (error) {
    console.error('❌ Error uploading document:', error);
    
    if (req.file && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }
    
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// ========== CHỈNH SỬA TÀI LIỆU (MỚI) ==========
// @route   PUT /api/documents/:id
// @desc    Update a document (title, description, and optionally replace file)
// @access  Private (Owner or Admin only)
router.put('/:id', auth, upload.single('file'), async (req, res) => {
  try {
    const document = await Document.findById(req.params.id);
    
    if (!document) {
      return res.status(404).json({ message: 'Không tìm thấy tài liệu' });
    }

    // Kiểm tra quyền: chỉ người đăng hoặc admin
    const isOwner = document.uploadedBy && document.uploadedBy.toString() === req.user.id;
    const isAdmin = req.user.role === 'admin';

    if (!isOwner && !isAdmin) {
      return res.status(403).json({ message: 'Bạn không có quyền chỉnh sửa tài liệu này' });
    }

    const { title, description, category, tags, isPaid, price } = req.body;

    // Cập nhật thông tin cơ bản
    if (title) document.title = title;
    if (description) document.description = description;
    if (category) document.category = category;
    if (tags) {
      document.tags = Array.isArray(tags) ? tags : tags.split(',').map(t => t.trim());
    }
    if (isPaid !== undefined) document.isPaid = isPaid;
    if (price !== undefined) document.price = price;

    // Nếu có file mới được upload, xóa file cũ và cập nhật
    if (req.file) {
      // Xóa file cũ
      if (document.fileUrl) {
        const oldFilename = path.basename(document.fileUrl);
        const oldFilePath = path.join(uploadsDir, oldFilename);
        
        if (fs.existsSync(oldFilePath)) {
          try {
            fs.unlinkSync(oldFilePath);
            console.log('🗑️ Đã xóa file cũ:', oldFilename);
          } catch (err) {
            console.error('⚠️ Không thể xóa file cũ:', err.message);
          }
        }
      }

      // Cập nhật thông tin file mới
      document.fileUrl = `${req.protocol}://${req.get('host')}/uploads/${req.file.filename}`;
      document.fileType = req.file.mimetype;
      document.fileSize = req.file.size;
      
      console.log('📎 File mới đã được thay thế:', req.file.filename);
    }

    await document.save();
    console.log('✅ Tài liệu đã được cập nhật:', document._id);

    res.json({ 
      message: 'Cập nhật tài liệu thành công', 
      document 
    });

  } catch (error) {
    console.error('❌ Error updating document:', error);
    
    // Nếu có lỗi và đã upload file mới, xóa file đó đi
    if (req.file && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }
    
    res.status(500).json({ 
      message: 'Lỗi server khi cập nhật tài liệu', 
      error: error.message 
    });
  }
});

// @route   DELETE /api/documents/:id
// @desc    Delete a document
// @access  Private
router.delete('/:id', auth, async (req, res) => {
  try {
    const document = await Document.findById(req.params.id);
    
    if (!document) {
      return res.status(404).json({ message: 'Document not found' });
    }

    if (document.uploadedBy && document.uploadedBy.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized' });
    }

    const filename = path.basename(document.fileUrl);
    const filePath = path.join(uploadsDir, filename);
    
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
      console.log('🗑️ Deleted file:', filename);
    }

    await Document.findByIdAndDelete(req.params.id);
    console.log('✅ Document deleted:', req.params.id);

    res.json({ message: 'Document deleted successfully' });
  } catch (error) {
    console.error('❌ Error deleting document:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// @route   POST /api/documents/:id/download
// @desc    Increase download count
// @access  Public
router.post('/:id/download', auth, async (req, res) => {
  try {
    const document = await Document.findById(req.params.id);
    
    if (!document) {
      return res.status(404).json({ message: 'Document not found' });
    }

    // Tăng số lượt download
    document.downloads += 1;
    await document.save();

    console.log('📥 Download count increased for:', document.title);

    res.json({ 
      message: 'Download count updated', 
      downloads: document.downloads 
    });
  } catch (error) {
    console.error('❌ Error updating download count:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;
