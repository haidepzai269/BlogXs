// 📁 routes/profile.routes.js
const express = require('express');
const router = express.Router();

const authenticateToken = require('../middleware/auth');
const upload = require('../middleware/upload.middleware');
const profileController = require('../controllers/profile.controller');
const verifyToken = require('../middleware/auth.js'); // hoặc đúng đường dẫn file của bạn
const authenticate = require('../middleware/authenticate'); // 🛠 Thêm dòng này


// Lấy profile
router.get('/', authenticateToken, profileController.getProfile);

// Cập nhật profile (text info)
router.put('/', authenticateToken, profileController.updateProfile);

// ✅ Upload ảnh đại diện (1 ảnh)

  
  // ✅ Gọi controller thay vì viết trực tiếp ở đây
  router.put('/profile/avatar', authenticate, upload.single('avatar'), updateAvatar);
  router.patch('/cover', verifyToken, upload.single('cover'), profileController.updateCover);
  
module.exports = router;
