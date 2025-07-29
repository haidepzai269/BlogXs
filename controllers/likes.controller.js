const pool = require('../db');

exports.likePost = async (req, res) => {
  const userId = req.user.id;
  const postId = req.params.postId;

  try {
    const { rows: postRows } = await pool.query(
      'SELECT user_id FROM posts WHERE id = $1',
      [postId]
    );

    if (postRows.length === 0) {
      return res.status(404).json({ error: 'Post not found' });
    }

    const receiverId = postRows[0].user_id;
    const receiverKey = String(receiverId);

    const { rows: likeRows } = await pool.query(
      'SELECT * FROM likes WHERE user_id = $1 AND post_id = $2',
      [userId, postId]
    );

    const io = req.app.get('io');
    const onlineUsers = req.app.get('onlineUsers');

    const { rows: senderRows } = await pool.query(
      'SELECT username FROM users WHERE id = $1',
      [userId]
    );
    const senderUsername = senderRows[0]?.username || 'Unknown';

    if (likeRows.length > 0) {
      await pool.query(
        'DELETE FROM likes WHERE user_id = $1 AND post_id = $2',
        [userId, postId]
      );

      if (userId !== receiverId) {
        await pool.query(
          'DELETE FROM post_like_notifications WHERE sender_id = $1 AND post_id = $2',
          [userId, postId]
        );
      }

      return res.status(200).json({ message: 'Unliked' });
    }

    await pool.query(
      'INSERT INTO likes (user_id, post_id) VALUES ($1, $2)',
      [userId, postId]
    );

    // 🔒 Chỉ tạo thông báo nếu user khác người đăng
    if (userId !== receiverId) {
      await pool.query(
        'INSERT INTO post_like_notifications (sender_id, receiver_id, post_id) VALUES ($1, $2, $3)',
        [userId, receiverId, postId]
      );

      const insertedNotification = await pool.query(
        `SELECT id FROM post_like_notifications 
         WHERE sender_id = $1 AND receiver_id = $2 AND post_id = $3 
         ORDER BY created_at DESC LIMIT 1`,
        [userId, receiverId, postId]
      );

      const { rows: postInfoRows } = await pool.query(
        'SELECT content FROM posts WHERE id = $1',
        [postId]
      );

      let postContent = 'bài viết';
      if (postInfoRows.length > 0 && postInfoRows[0].content) {
        postContent = postInfoRows[0].content;
      }

      // 👇 Gửi socket nếu online
      if (onlineUsers.has(receiverKey)) {
        const receiverSocketId = onlineUsers.get(receiverKey);
        console.log('🎯 Gửi socket đến người nhận:', {
          receiverId,
          receiverSocketId,
          senderUsername,
          postId,
        });

        io.to(`user_${receiverKey}`).emit('new-like-notification', {
          id: insertedNotification.rows[0].id,
          sender_username: senderUsername,
          postId,
          post: postContent,
          createdAt: new Date(),
          is_read: false
        });
      }
    }

    // Đếm lại lượt like
    const countRes = await pool.query(
      'SELECT COUNT(*) FROM likes WHERE post_id = $1',
      [postId]
    );
    const likeCount = parseInt(countRes.rows[0].count);

    // Broadcast
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
      'DELETE FROM post_like_notifications WHERE sender_id = $1 AND post_id = $2',
      [userId, postId]
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