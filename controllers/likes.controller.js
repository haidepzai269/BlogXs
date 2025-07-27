const pool = require('../db');

exports.likePost = async (req, res) => {
  const userId = req.user.id;
  const postId = req.params.postId;

  try {
    // Lấy user_id của người đăng bài
    const { rows: postRows } = await pool.query(
      'SELECT user_id FROM posts WHERE id = $1',
      [postId]
    );

    if (postRows.length === 0) {
      return res.status(404).json({ error: 'Post not found' });
    }

    const receiverId = postRows[0].user_id;

    // Kiểm tra đã like chưa
    const { rows: likeRows } = await pool.query(
      'SELECT * FROM likes WHERE user_id = $1 AND post_id = $2',
      [userId, postId]
    );

    const io = req.app.get('io');
    const onlineUsers = req.app.get('onlineUsers');

    // Lấy tên người gửi
    const { rows: senderRows } = await pool.query(
      'SELECT username FROM users WHERE id = $1',
      [userId]
    );
    const senderUsername = senderRows[0]?.username || 'Unknown';

    if (likeRows.length > 0) {
      // Nếu đã like → unlike
      await pool.query(
        'DELETE FROM likes WHERE user_id = $1 AND post_id = $2',
        [userId, postId]
      );
      await pool.query(
        'DELETE FROM notify WHERE sender_id = $1 AND post_id = $2 AND type = $3',
        [userId, postId, 'like']
      );

      return res.status(200).json({ message: 'Unliked' });
    }

    // Nếu chưa like → like
    await pool.query(
      'INSERT INTO likes (user_id, post_id) VALUES ($1, $2)',
      [userId, postId]
    );
    await pool.query(
      'INSERT INTO notify (sender_id, receiver_id, post_id, type) VALUES ($1, $2, $3, $4)',
      [userId, receiverId, postId, 'like']
    );

    // Gửi thông báo qua Socket nếu người nhận đang online
    if (onlineUsers.has(receiverId)) {
      const receiverSocketId = onlineUsers.get(receiverId);
      io.to(receiverSocketId).emit('new-like-notification', {
        senderUsername,
        postId,
        type: 'like',
        createdAt: new Date()
      });
    }

// Đếm lại tổng số lượt like sau khi đã insert
const countRes = await pool.query(
  'SELECT COUNT(*) FROM likes WHERE post_id = $1',
  [postId]
);
const likeCount = parseInt(countRes.rows[0].count);

// Gửi realtime đến tất cả client
io.emit('like_updated', {
  postId: parseInt(postId),
  likeCount
});

return res.status(200).json({ message: 'Liked', likeCount });

  } catch (err) {
    console.error('Lỗi khi like/unlike post:', err);
    return res.status(500).json({ error: 'Đã xảy ra lỗi khi xử lý like post' });
  }
};


exports.unlikePost = async (req, res) => {
  const userId = req.user.id;
  const postId = req.params.postId;

  try {
    const postOwner = await pool.query(
      'SELECT user_id FROM posts WHERE id = $1',
      [postId]
    );

    if (postOwner.rows.length === 0) {
      return res.status(404).json({ error: 'Post not found' });
    }

    const receiverId = postOwner.rows[0].user_id;

    // Kiểm tra đã like chưa
    const liked = await pool.query(
      'SELECT * FROM likes WHERE user_id = $1 AND post_id = $2',
      [userId, postId]
    );

    if (liked.rows.length === 0) {
      return res.status(400).json({ error: 'Post chưa được like' });
    }

    // Xoá like
    await pool.query(
      'DELETE FROM likes WHERE user_id = $1 AND post_id = $2',
      [userId, postId]
    );

    // Xoá notify nếu cần
    await pool.query(
      'DELETE FROM notify WHERE sender_id = $1 AND post_id = $2 AND type = $3',
      [userId, postId, 'like']
    );

    // Gửi socket nếu muốn (optional)
    const io = req.app.get('io');
    const onlineUsers = req.app.get('onlineUsers');
    const sender = await pool.query('SELECT username FROM users WHERE id = $1', [userId]);

    if (onlineUsers.has(receiverId)) {
      const receiverSocketId = onlineUsers.get(receiverId);
      io.to(receiverSocketId).emit('unlike-notification', {
        senderUsername: sender.rows[0].username,
        postId,
        type: 'unlike',
        createdAt: new Date()
      });
    }

// Đếm lại lượt like
const countRes = await pool.query(
  'SELECT COUNT(*) FROM likes WHERE post_id = $1',
  [postId]
);
const likeCount = parseInt(countRes.rows[0].count);

// Emit realtime
io.emit('like_updated', {
  postId: parseInt(postId),
  likeCount
});

return res.status(200).json({ message: 'Unliked', likeCount });


  } catch (err) {
    console.error('Lỗi unlike post:', err);
    return res.status(500).json({ error: 'Đã xảy ra lỗi khi unlike post' });
  }
};


exports.getLikedPosts = async (req, res) => {
  const userId = req.user.id;

  try {
    const result = await pool.query(
        `SELECT 
           posts.id AS post_id,
           posts.content,
           posts.created_at,
           users.username
         FROM likes
         JOIN posts ON posts.id = likes.post_id
         JOIN users ON users.id = posts.user_id
         WHERE likes.user_id = $1
         ORDER BY likes.created_at DESC`,
        [userId]
      );
      
      res.json({ likedPosts: result.rows });
      
  } catch (err) {
    console.error('Lỗi lấy liked posts:', err);
    res.status(500).json({ error: 'Lỗi khi lấy danh sách liked posts' });
  }
};

exports.getLikesCount = async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT post_id, COUNT(*) as like_count
      FROM likes
      GROUP BY post_id
    `);
    res.json(result.rows); // [{ post_id: 1, like_count: 5 }, ...]
  } catch (err) {
    console.error('Lỗi lấy số lượt like:', err);
    res.status(500).json({ error: 'Lỗi khi lấy số lượt like' });
  }
};