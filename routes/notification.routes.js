const express = require('express');
const router = express.Router();
const { getNotifications, markAsRead, deleteNotification } = require('../controllers/notify.controller');
const { authenticateToken } = require('../middleware/auth'); 
// Route: Lấy danh sách thông báo của người dùng
router.get('/',authenticateToken, getNotifications);

// Route: Đánh dấu tất cả là đã đọc
router.put('/read',authenticateToken, markAsRead);
router.delete('/:id', authenticateToken, deleteNotification);

module.exports = router;
