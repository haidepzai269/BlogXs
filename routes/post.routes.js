const express = require('express');
const router = express.Router();
const postController = require('../controllers/post.controller');

// 👇 Destructure đúng middleware cần dùng
const { authenticateToken } = require('../middleware/auth');

router.get('/', postController.getAllPosts);
router.get('/search', authenticateToken, postController.searchPosts);

// ✅ Lấy bài viết user hiện tại
router.get('/me', authenticateToken, postController.getPostsByCurrentUser);

// ✅ Tạo bài viết mới
router.post('/', authenticateToken, postController.createPost);

// ✅ Xóa bài viết
router.delete('/:id', authenticateToken, postController.deletePost);
// Từ khóa phổ biến 
router.get('/popular-queries', postController.getPopularSearchTerms);

module.exports = router;
