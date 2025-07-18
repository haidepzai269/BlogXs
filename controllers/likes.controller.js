const pool = require('../db');

exports.likePost = async (req, res) => {
  const userId = req.user.id;
  const postId = req.params.postId;

  try {
    await pool.query(
      'INSERT INTO likes (user_id, post_id) VALUES ($1, $2) ON CONFLICT DO NOTHING',
      [userId, postId]
    );
    res.status(200).json({ message: 'Liked' });
  } catch (err) {
    console.error('Lỗi like post:', err);
    res.status(500).json({ error: 'Đã xảy ra lỗi khi like post' });
  }
};

exports.unlikePost = async (req, res) => {
  const userId = req.user.id;
  const postId = req.params.postId;

  try {
    await pool.query(
      'DELETE FROM likes WHERE user_id = $1 AND post_id = $2',
      [userId, postId]
    );
    res.status(200).json({ message: 'Unliked' });
  } catch (err) {
    console.error('Lỗi unlike post:', err);
    res.status(500).json({ error: 'Đã xảy ra lỗi khi unlike post' });
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