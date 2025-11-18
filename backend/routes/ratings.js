const express = require('express');
const router = express.Router();
const ratingController = require('../controllers/ratingController');
const auth = require('../middleware/auth');

router.post('/:documentId', auth, ratingController.rateDocument);
router.get('/:documentId/user', auth, ratingController.getUserRating);

module.exports = router;
