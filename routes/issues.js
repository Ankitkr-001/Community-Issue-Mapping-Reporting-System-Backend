const express = require('express');
const router = express.Router();
const multer = require('multer');
const auth = require('../middleware/auth');
const admin = require('../middleware/admin');
const {
  getIssues,
  createIssue,
  updateStatus,   // <--- make sure this exists in controller
} = require('../controllers/issueController');

// multer memory storage
const storage = multer.memoryStorage();
const upload = multer({ storage });

// Routes
router.get('/', auth, getIssues);
router.post('/', auth, upload.single('image'), createIssue);
router.patch('/:id/status', auth, admin, updateStatus);  // PATCH route

module.exports = router;
