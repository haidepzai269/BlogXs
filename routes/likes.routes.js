const express = require('express');
const router = express.Router();
const likesController = require('../controllers/likes.controller');
const { authenticateToken } = require('../middleware/auth'); // ✅ Đúng cú pháp

router.post('/posts/:postId/like', authenticateToken, likesController.likePost);
router.delete('/posts/:postId/like', authenticateToken, likesController.unlikePost); // ✅ CHUẨN
router.get('/posts/liked', authenticateToken, likesController.getLikedPosts);
router.get('/likes/count', likesController.getLikesCount);

module.exports = router;
