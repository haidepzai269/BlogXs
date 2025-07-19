const express = require('express');
const router = express.Router();

const { authenticateToken } = require('../middleware/auth'); // ✅ Đúng cú pháp
const upload = require('../middleware/upload.middleware');
const profileController = require('../controllers/profile.controller');
const { strictAuthenticate } = require('../middleware/auth'); // Có thể dùng cái này nếu muốn xác thực mạnh hơn

// Lấy profile
router.get('/', authenticateToken, profileController.getProfile);

// Cập nhật profile (text info)
router.put('/', authenticateToken, profileController.updateProfile);

// Upload avatar
router.put('/avatar', authenticateToken, upload.single('avatar'), profileController.updateAvatar);

// Upload cover
router.patch('/cover', authenticateToken, upload.single('cover'), profileController.updateCover);

module.exports = router;
