// 📁 routes/profile.routes.js
const express = require('express');
const router = express.Router();

const authenticateToken = require('../middleware/auth'); // Gộp vào đây
const upload = require('../middleware/upload.middleware');
const profileController = require('../controllers/profile.controller');

// Lấy profile
router.get('/', authenticateToken, profileController.getProfile);

// Cập nhật profile (text info)
router.put('/', authenticateToken, profileController.updateProfile);

// ✅ Upload ảnh đại diện (1 ảnh)
router.put('/profile/avatar', authenticateToken, upload.single('avatar'), profileController.updateAvatar);

// ✅ Upload ảnh cover
router.patch('/cover', authenticateToken, upload.single('cover'), profileController.updateCover);

module.exports = router;
