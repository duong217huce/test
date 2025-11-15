const Document = require('../models/Document');

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
    
    res.json(document);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.uploadDocument = async (req, res) => {
  try {
    const document = new Document({
      ...req.body,
      uploadedBy: req.userId,
      fileUrl: req.file.path
    });
    
    await document.save();
    res.status(201).json(document);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
