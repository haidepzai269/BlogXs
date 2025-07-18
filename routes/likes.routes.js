const express = require('express');
const router = express.Router();
const likesController = require('../controllers/likes.controller');
const authenticateToken = require('../middleware/auth');

router.post('/posts/:postId/like', authenticateToken, likesController.likePost);
router.delete('/posts/:postId/unlike', authenticateToken, likesController.unlikePost);
router.get('/posts/liked', authenticateToken, likesController.getLikedPosts);

module.exports = router;
