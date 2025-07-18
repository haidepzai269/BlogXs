const express = require('express');
const router = express.Router();
const authController = require('../controllers/auth.controller');

// Đăng ký
router.post('/register', authController.register);

// Đăng nhập
router.post('/login', authController.login);

// Làm mới token
router.post('/refresh', authController.refreshToken);

// Đăng xuất
router.post('/logout', authController.logout);

module.exports = router;
