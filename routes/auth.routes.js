const express = require('express');
const router = express.Router();
const authController = require('../controllers/auth.controller');
const { authenticateToken } = require('../middleware/auth');
router.post('/register', authController.register);

// Đăng nhập
router.post('/login', authController.login);

// Làm mới token
router.post('/refresh', authController.refreshToken);

// Đăng xuất
router.post('/logout', authController.logout);
//
// Route mới này để lấy thông tin người dùng từ token
router.get('/me', authenticateToken, async (req, res) => {
    try {
      const userId = req.user.id;
      const result = await db.query('SELECT id, username, email FROM users WHERE id = $1', [userId]);
      if (result.rows.length === 0) {
        return res.status(404).json({ message: 'Không tìm thấy người dùng' });
      }
      res.json(result.rows[0]);
    } catch (err) {
      res.status(500).json({ message: 'Lỗi server' });
    }
  });
  
module.exports = router;
