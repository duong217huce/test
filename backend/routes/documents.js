const express = require('express');
const router = express.Router();
const documentController = require('../controllers/documentController');
const auth = require('../middleware/auth');

router.get('/', documentController.getAllDocuments);
router.get('/:id', documentController.getDocumentById);
router.post('/', auth, documentController.uploadDocument);

module.exports = router;
