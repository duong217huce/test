const Document = require('../models/Document');
const User = require('../models/User');
const Transaction = require('../models/Transaction');

exports.getAllDocuments = async (req, res) => {
  try {
    const { category, search, sortBy } = req.query;
    let query = {};
    
    if (category) query.category = category;
    if (search) query.title = { $regex: search, $options: 'i' };
    
    const documents = await Document.find(query)
      .populate('uploadedBy', 'username fullName')
      .sort(sortBy || '-uploadDate');
      
    res.json(documents);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getDocumentById = async (req, res) => {
  try {
    const document = await Document.findById(req.params.id)
      .populate('uploadedBy', 'username fullName');
    
    if (!document) {
      return res.status(404).json({ message: 'Không tìm thấy tài liệu' });
    }
    
    // Tăng lượt xem
    document.views += 1;
    await document.save();
    
    res.json(document);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.uploadDocument = async (req, res) => {
  try {
    const { title, description, category, fileType, fileSize, price, isPaid, tags } = req.body;
    
    if (!req.file) {
      return res.status(400).json({ message: 'Vui lòng upload file' });
    }
    
    const document = new Document({
      title,
      description,
      category,
      fileType,
      fileSize,
      price: isPaid ? price : 0,
      isPaid,
      tags: tags ? tags.split(',') : [],
      uploadedBy: req.userId,
      fileUrl: req.file.path
    });
    
    await document.save();
    
    // Thưởng điểm cho người upload
    await User.findByIdAndUpdate(req.userId, {
      $inc: { documentPoints: 10 }
    });
    
    // Tạo transaction
    await new Transaction({
      userId: req.userId,
      documentId: document._id,
      type: 'upload_reward',
      amount: 10
    }).save();
    
    res.status(201).json(document);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.downloadDocument = async (req, res) => {
  try {
    const document = await Document.findById(req.params.id);
    
    if (!document) {
      return res.status(404).json({ message: 'Không tìm thấy tài liệu' });
    }
    
    // Kiểm tra tài liệu có phải trả phí không
    if (document.isPaid) {
      const user = await User.findById(req.userId);
      
      if (user.documentPoints < document.price) {
        return res.status(400).json({ message: 'Không đủ DP để tải tài liệu' });
      }
      
      // Trừ điểm
      user.documentPoints -= document.price;
      await user.save();
      
      // Tạo transaction
      await new Transaction({
        userId: req.userId,
        documentId: document._id,
        type: 'purchase',
        amount: -document.price
      }).save();
    }
    
    // Tăng lượt tải
    document.downloads += 1;
    await document.save();
    
    res.json({ fileUrl: document.fileUrl });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.saveDocument = async (req, res) => {
  try {
    const user = await User.findById(req.userId);
    
    if (user.savedDocuments.includes(req.params.id)) {
      // Bỏ lưu
      user.savedDocuments = user.savedDocuments.filter(
        doc => doc.toString() !== req.params.id
      );
    } else {
      // Lưu tài liệu
      user.savedDocuments.push(req.params.id);
    }
    
    await user.save();
    res.json({ message: 'Cập nhật thành công' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getSavedDocuments = async (req, res) => {
  try {
    const user = await User.findById(req.userId)
      .populate({
        path: 'savedDocuments',
        populate: { path: 'uploadedBy', select: 'username fullName' }
      });
    
    res.json(user.savedDocuments);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
