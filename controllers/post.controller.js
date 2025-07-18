const db = require('../db');

// Lấy tất cả bài viết
exports.getAllPosts = async (req, res) => {
  try {
    const result = await db.query('SELECT * FROM posts ORDER BY created_at DESC');
    res.json(result.rows);
  } catch (err) {
    console.error('Lỗi truy vấn bài viết:', err);
    res.status(500).json({ error: 'Lỗi máy chủ' });
  }
};

// Tìm kiếm bài viết
exports.searchPosts = async (req, res) => {
  try {
    const query = req.query.q;
    if (!query) return res.status(400).json({ error: 'Thiếu từ khóa tìm kiếm' });

    const result = await db.query(
      'SELECT * FROM posts WHERE content ILIKE $1 ORDER BY created_at DESC',
      [`%${query}%`]
    );

    res.json(result.rows);
  } catch (error) {
    console.error('Lỗi tìm kiếm bài đăng:', error);
    res.status(500).json({ error: 'Lỗi server khi tìm kiếm' });
  }
};

// ✅ Lấy bài viết của user hiện tại
exports.getPostsByCurrentUser = async (req, res) => {
  try {
    const userId = req.user.id;
    const result = await db.query(
      `SELECT posts.*, users.username 
       FROM posts 
       JOIN users ON posts.user_id = users.id 
       WHERE user_id = $1 
       ORDER BY posts.created_at DESC`,
      [userId]
    );
    res.json(result.rows);
  } catch (error) {
    console.error('Lỗi lấy bài viết người dùng:', error);
    res.status(500).json({ error: 'Lỗi server khi lấy bài viết' });
  }
};
// ✅ Tạo bài viết mới
// ✅ Tạo bài viết mới
exports.createPost = async (req, res) => {
  try {
    const userId = req.user.id;
    const username = req.user.username;
    const { content } = req.body;

    if (!content || content.trim() === '') {
      return res.status(400).json({ error: 'Nội dung không được để trống' });
    }

    const result = await db.query(
      `INSERT INTO posts (user_id, username, content) 
       VALUES ($1, $2, $3) 
       RETURNING *`,
      [userId, username, content]
    );

    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error('Lỗi tạo bài viết:', err);
    res.status(500).json({ error: 'Lỗi server khi tạo bài viết' });
  }
};

exports.deletePost = async (req, res) => {
  const postId = req.params.id;
  const userId = req.user.id;

  try {
    const result = await db.query('DELETE FROM posts WHERE id = $1 AND user_id = $2 RETURNING *', [
      postId,
      userId
    ]);

    if (result.rowCount === 0) {
      return res.status(403).json({ error: 'Không được xoá bài viết của người khác' });
    }

    res.json({ message: 'Đã xoá bài viết' });
  } catch (err) {
    console.error('Lỗi khi xoá bài viết:', err);
    res.status(500).json({ error: 'Lỗi server khi xoá bài viết' });
  }
};
