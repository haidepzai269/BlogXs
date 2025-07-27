const db = require('../db');

// Lấy comment của 1 bài viết
exports.getCommentsByPost = async (req, res) => {
  const { postId } = req.params;
  try {
    const result = await db.query(
      `SELECT comments.*, users.username 
       FROM comments 
       JOIN users ON comments.user_id = users.id 
       WHERE post_id = $1 
       ORDER BY created_at ASC`,
      [postId]
    );
    res.json(result.rows);
  } catch (err) {
    console.error('Lỗi lấy bình luận:', err);
    res.status(500).json({ error: 'Lỗi server khi lấy bình luận' });
  }
};

// Tạo bình luận mới
exports.createComment = async (req, res) => {
  const { postId } = req.params;
  const { content } = req.body;
  const userId = req.user.id;

  if (!content || content.trim() === '') {
    return res.status(400).json({ error: 'Nội dung không được để trống' });
  }

  try {
    const result = await db.query(
      `INSERT INTO comments (post_id, user_id, content) 
       VALUES ($1, $2, $3) 
       RETURNING *`,
      [postId, userId, content]
    );

    const newComment = result.rows[0];

    // Lấy username của người bình luận
    const userRes = await db.query(
      `SELECT username FROM users WHERE id = $1`,
      [userId]
    );

    const username = userRes.rows[0]?.username || 'Ẩn danh';
    const fullComment = {
      ...newComment,
      username
    };

    // Emit qua Socket.IO
    const io = req.app.get('io');
    io.emit('new_comment', fullComment); // gửi đến tất cả client

    res.status(201).json(fullComment); // trả về cả username luôn
  } catch (err) {
    console.error('Lỗi tạo bình luận:', err);
    res.status(500).json({ error: 'Lỗi server khi tạo bình luận' });
  }
};

