const express = require('express');
const router = express.Router();
const multer = require('multer');
const shortsController = require('../controllers/shorts.controller');
const { strictAuthenticate } = require('../middleware/auth');

const storage = multer.memoryStorage(); // Upload video vào RAM
const upload = multer({ storage });

// GET /api/shorts - lấy danh sách shorts
router.get('/', shortsController.getAllShorts);

// POST /api/shorts - upload video (yêu cầu đăng nhập)
router.post('/', strictAuthenticate, upload.single('video'), shortsController.uploadShort);

module.exports = router;
