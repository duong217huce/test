const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const mammoth = require('mammoth');
const { promisify } = require('util');
const { exec } = require('child_process');
const execPromise = promisify(exec);
const Document = require('../models/Document');
const User = require('../models/User');
const auth = require('../middleware/auth');

// Tạo thư mục uploads nếu chưa tồn tại
const uploadsDir = path.join(__dirname, '../uploads');
const coversDir = path.join(__dirname, '../uploads/covers');

if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

if (!fs.existsSync(coversDir)) {
  fs.mkdirSync(coversDir, { recursive: true });
}

// Cấu hình multer để lưu file
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    if (file.fieldname === 'coverImage') {
      cb(null, coversDir);
    } else {
      cb(null, uploadsDir);
    }
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
    if (file.fieldname === 'coverImage') {
      const allowedImageTypes = /jpeg|jpg|png|gif/;
      const extname = allowedImageTypes.test(path.extname(file.originalname).toLowerCase());
      const mimetype = allowedImageTypes.test(file.mimetype);
      
      if (mimetype && extname) {
        return cb(null, true);
      } else {
        cb(new Error('Chỉ chấp nhận ảnh: JPG, PNG, GIF'));
      }
    } else {
      const allowedTypes = /pdf|doc|docx|ppt|pptx|xls|xlsx|txt/;
      const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
      const mimetype = allowedTypes.test(file.mimetype);

      if (mimetype && extname) {
        return cb(null, true);
      } else {
        cb(new Error('Chỉ chấp nhận file: PDF, DOC, DOCX, PPT, PPTX, XLS, XLSX, TXT'));
      }
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

// @route   GET /api/documents/search
// @desc    Search documents
// @access  Public
router.get('/search', async (req, res) => {
  try {
    const { q, limit } = req.query;
    
    if (!q || q.trim() === '') {
      return res.json([]);
    }

    const searchRegex = new RegExp(q, 'i');
    
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
    .select('title description category uploadDate views downloads fileType isPaid price coverImage');

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

    const fileType = document.fileType || '';
    if (!fileType.includes('word') && !fileType.includes('document')) {
      return res.status(400).json({ message: 'Only Word documents supported' });
    }

    const filename = path.basename(document.fileUrl);
    const filePath = path.join(uploadsDir, filename);

    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ message: 'File not found' });
    }

    console.log('📄 Converting DOCX to HTML:', filename);

    const result = await mammoth.convertToHtml({ path: filePath });
    const html = result.value;

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
router.post('/', auth, upload.fields([
  { name: 'file', maxCount: 1 },
  { name: 'coverImage', maxCount: 1 }
]), async (req, res) => {
  try {
    if (!req.files || !req.files.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    const documentFile = req.files.file[0];
    const coverImageFile = req.files.coverImage ? req.files.coverImage[0] : null;

    const { title, description, category, tags } = req.body;
    const fileUrl = `${req.protocol}://${req.get('host')}/uploads/${documentFile.filename}`;
    
    if (!req.user || !req.user.id) {
      return res.status(401).json({ message: 'User not authenticated' });
    }
    
    console.log('📤 Upload request from user:', req.user.id);
    console.log('📄 File URL:', fileUrl);
    console.log('📦 File size:', documentFile.size, 'bytes');
    
    let tagsArray = [];
    if (tags) {
      if (typeof tags === 'string') {
        tagsArray = tags.split(',').map(tag => tag.trim()).filter(tag => tag.length > 0);
      } else if (Array.isArray(tags)) {
        tagsArray = tags;
      }
    }

    // ✅ XỬ LÝ ẢNH BÌA
    let coverImageUrl = null;

    if (coverImageFile) {
      // User đã upload ảnh bìa
      coverImageUrl = `${req.protocol}://${req.get('host')}/uploads/covers/${coverImageFile.filename}`;
      console.log('🖼️ User uploaded cover:', coverImageFile.filename);
    } else if (documentFile.mimetype === 'application/pdf') {
      // ✅ TỰ ĐỘNG TẠO ẢNH BÌA TỪ PDF
      try {
        const pdfPath = documentFile.path;
        const outputFilename = `cover-${Date.now()}.jpg`;
        const outputBasePath = path.join(coversDir, outputFilename.replace('.jpg', ''));

        console.log('🔄 Generating cover from PDF...');
        const command = `pdftoppm -f 1 -l 1 -jpeg -singlefile "${pdfPath}" "${outputBasePath}"`;
        
        await execPromise(command);
        
        coverImageUrl = `${req.protocol}://${req.get('host')}/uploads/covers/${outputFilename}`;
        console.log('✅ Auto-generated cover:', outputFilename);
      } catch (error) {
        console.error('⚠️ PDF cover generation failed:', error.message);
      }
    } else {
      console.log('📄 Non-PDF file without cover');
    }

    // ✅ TỰ ĐỘNG XÁC ĐỊNH TÀI LIỆU TRẢ PHÍ (>= 4MB)
    const FOUR_MB = 4 * 1024 * 1024;
    const isPaid = documentFile.size >= FOUR_MB;
    const price = isPaid ? 10 : 0;

    console.log(`💰 Document type: ${isPaid ? 'PAID' : 'FREE'} (${(documentFile.size / (1024 * 1024)).toFixed(2)} MB)`);

    const newDocument = new Document({
      title,
      description,
      category,
      fileUrl,
      coverImage: coverImageUrl,
      fileType: documentFile.mimetype,
      fileSize: documentFile.size,
      uploadedBy: req.user.id,
      tags: tagsArray,
      isPaid: isPaid,
      price: price
    });

    const savedDocument = await newDocument.save();
    console.log('✅ Document saved:', savedDocument._id);

    // Thưởng điểm cho người upload
    await User.findByIdAndUpdate(req.user.id, {
      $inc: { coins: 10 }
    });

    res.status(201).json({
      message: 'Document uploaded successfully',
      document: savedDocument
    });
  } catch (error) {
    console.error('❌ Error uploading document:', error);
    
    if (req.files) {
      if (req.files.file && fs.existsSync(req.files.file[0].path)) {
        fs.unlinkSync(req.files.file[0].path);
      }
      if (req.files.coverImage && fs.existsSync(req.files.coverImage[0].path)) {
        fs.unlinkSync(req.files.coverImage[0].path);
      }
    }
    
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// @route   PUT /api/documents/:id
// @desc    Update a document
// @access  Private (Owner or Admin only)
router.put('/:id', auth, upload.single('file'), async (req, res) => {
  try {
    const document = await Document.findById(req.params.id);
    
    if (!document) {
      return res.status(404).json({ message: 'Không tìm thấy tài liệu' });
    }

    const isOwner = document.uploadedBy && document.uploadedBy.toString() === req.user.id;
    const isAdmin = req.user.role === 'admin';

    if (!isOwner && !isAdmin) {
      return res.status(403).json({ message: 'Bạn không có quyền chỉnh sửa tài liệu này' });
    }

    const { title, description, category, tags } = req.body;

    if (title) document.title = title;
    if (description) document.description = description;
    if (category) document.category = category;
    if (tags) {
      document.tags = Array.isArray(tags) ? tags : tags.split(',').map(t => t.trim());
    }

    if (req.file) {
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

      document.fileUrl = `${req.protocol}://${req.get('host')}/uploads/${req.file.filename}`;
      document.fileType = req.file.mimetype;
      document.fileSize = req.file.size;

      // ✅ Cập nhật lại isPaid và price dựa trên fileSize mới
      const FOUR_MB = 4 * 1024 * 1024;
      document.isPaid = req.file.size >= FOUR_MB;
      document.price = document.isPaid ? 10 : 0;
      
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

    // Xóa ảnh bìa nếu có
    if (document.coverImage) {
      const coverFilename = path.basename(document.coverImage);
      const coverPath = path.join(coversDir, coverFilename);
      if (fs.existsSync(coverPath)) {
        fs.unlinkSync(coverPath);
        console.log('🗑️ Deleted cover:', coverFilename);
      }
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
// @access  Private
router.post('/:id/download', auth, async (req, res) => {
  try {
    const document = await Document.findById(req.params.id);
    
    if (!document) {
      return res.status(404).json({ message: 'Document not found' });
    }

    // ✅ KIỂM TRA TÀI LIỆU TRẢ PHÍ
    if (document.isPaid) {
      const user = await User.findById(req.user.id);
      
      // Kiểm tra đã mua chưa
      if (!user.purchasedDocuments.includes(req.params.id)) {
        return res.status(403).json({ 
          message: 'Vui lòng mua tài liệu để tải xuống',
          isPaid: true,
          price: document.price,
          needPurchase: true
        });
      }
    }

    // Tăng số lượt download
    document.downloads += 1;
    await document.save();

    console.log('📥 Download count increased for:', document.title);

    res.json({ 
      message: 'Download count updated', 
      downloads: document.downloads,
      fileUrl: document.fileUrl
    });
  } catch (error) {
    console.error('❌ Error updating download count:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// ============ CHỨC NĂNG TÀI LIỆU TRẢ PHÍ ============

// @route   POST /api/documents/:id/purchase
// @desc    Mua tài liệu trả phí
// @access  Private
router.post('/:id/purchase', auth, async (req, res) => {
  try {
    const documentId = req.params.id;
    const userId = req.user.id;

    const document = await Document.findById(documentId);
    if (!document) {
      return res.status(404).json({ message: 'Tài liệu không tồn tại' });
    }

    if (!document.isPaid) {
      return res.status(400).json({ message: 'Tài liệu này miễn phí' });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User không tồn tại' });
    }

    // Kiểm tra đã mua chưa
    if (user.purchasedDocuments.includes(documentId)) {
      return res.json({ 
        success: true,
        message: 'Bạn đã mua tài liệu này rồi',
        alreadyPurchased: true 
      });
    }

    // Kiểm tra số dư
    if (user.coins < document.price) {
      return res.status(400).json({ 
        message: 'Số dư không đủ',
        required: document.price,
        current: user.coins,
        needRecharge: true
      });
    }

    // Trừ tiền và thêm vào danh sách đã mua
    user.coins -= document.price;
    user.purchasedDocuments.push(documentId);
    await user.save();

    // Cộng tiền cho người upload (nếu khác người mua)
    if (document.uploadedBy.toString() !== userId) {
      await User.findByIdAndUpdate(
        document.uploadedBy,
        { $inc: { coins: document.price } }
      );
      console.log(`💰 Cộng ${document.price} DP cho người upload`);
    }

    console.log(`✅ User ${user.username} purchased document ${document.title}`);

    res.json({
      success: true,
      message: 'Mua tài liệu thành công!',
      remainingCoins: user.coins,
      document: {
        id: document._id,
        title: document.title
      }
    });
  } catch (error) {
    console.error('❌ Error purchasing document:', error);
    res.status(500).json({ message: 'Lỗi server', error: error.message });
  }
});

// @route   GET /api/documents/:id/check-purchase
// @desc    Kiểm tra user đã mua tài liệu chưa
// @access  Private
router.get('/:id/check-purchase', auth, async (req, res) => {
  try {
    const documentId = req.params.id;
    const userId = req.user.id;

    const user = await User.findById(userId);
    const isPurchased = user.purchasedDocuments.includes(documentId);

    res.json({ isPurchased });
  } catch (error) {
    console.error('❌ Error checking purchase:', error);
    res.status(500).json({ message: 'Lỗi server', error: error.message });
  }
});

module.exports = router;
