const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../middleware/auth'); // ✅ Đúng
const userController = require('../controllers/user.controller');
const usersController = require('../controllers/user.controller');

// Lấy thông tin tài khoản đang đăng nhập
router.get('/profile', authenticateToken, userController.getProfile);

// Cập nhật thông tin tài khoản đang đăng nhập
router.put('/profile', authenticateToken, userController.updateProfile);
// Route hover
router.get('/hover/:username', usersController.getUserMiniProfile);
// Theme
router.put('/theme', authenticateToken, usersController.updateTheme);

module.exports = router;
