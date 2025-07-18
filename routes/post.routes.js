const express = require('express');
const router = express.Router();
const postController = require('../controllers/post.controller');
const verifyToken = require('../middleware/auth');

router.get('/', postController.getAllPosts);
router.get('/search', verifyToken, postController.searchPosts);

// ✅ Thêm route lấy bài viết user hiện tại
router.get('/me', verifyToken, postController.getPostsByCurrentUser);
// ✅ Route tạo bài viết mới
router.post('/', verifyToken, postController.createPost);
router.delete('/:id', verifyToken, postController.deletePost);


module.exports = router;
