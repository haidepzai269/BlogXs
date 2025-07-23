const express = require('express');
const router = express.Router();
const commentController = require('../controllers/comment.controller');
const { authenticateToken } = require('../middleware/auth');

// GET bình luận theo postId
router.get('/:postId', commentController.getCommentsByPost);

// POST bình luận mới cho postId
router.post('/:postId', authenticateToken, commentController.createComment);

module.exports = router;
