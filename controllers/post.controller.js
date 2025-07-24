const { indexPostToES, deletePostFromES } = require('../utils/syncElasticsearch');
const { Client } = require('@elastic/elasticsearch');
const client = require('../utils/elasticsearchClient');
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

exports.searchPosts = async (req, res) => {
  const { q } = req.query;

  try {
    // Ghi lại từ khóa đã tìm
    await db.query(`
      INSERT INTO search_queries (query)
      VALUES ($1)
      ON CONFLICT (query) DO UPDATE
      SET count = search_queries.count + 1,
          last_searched_at = CURRENT_TIMESTAMP
    `, [q]);

    // Gửi truy vấn đến Elasticsearch
    const searchQuery = {
      index: 'posts',
      body: {
        query: {
          multi_match: {
            query: q,
            fields: ['content', 'username']
          }
        }
      }
    };

    const result = await client.search(searchQuery);
    const hits = result.body.hits.hits.map(hit => hit._source);
    res.json(hits);
  } catch (error) {
    console.error('❌ Lỗi tìm kiếm:', error.message);
    res.status(500).json({ error: 'Lỗi tìm kiếm bài đăng' });
  }
};


exports.getPopularSearchTerms = async (req, res) => {
  try {
    const result = await db.query(`
      SELECT query FROM search_queries
      ORDER BY count DESC, last_searched_at DESC
      LIMIT 5
    `);
    res.json(result.rows.map(r => r.query));
  } catch (err) {
    console.error('❌ Lỗi lấy gợi ý từ khóa:', err.message);
    res.status(500).json({ error: 'Lỗi lấy gợi ý' });
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

    // ✅ Đồng bộ Elasticsearch nhưng không làm fail nếu lỗi
    try {
      await indexPostToES(result.rows[0]);
    } catch (esError) {
      console.error('⚠️ Lỗi sync Elasticsearch (create):', esError.message || esError);
    }

    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error('❌ Lỗi tạo bài viết:', err);
    res.status(500).json({ error: 'Lỗi server khi tạo bài viết' });
  }
};



exports.deletePost = async (req, res) => {
  const postId = req.params.id;
  const userId = req.user.id;

  try {
    const result = await db.query(
      'DELETE FROM posts WHERE id = $1 AND user_id = $2 RETURNING *',
      [postId, userId]
    );

    if (result.rowCount === 0) {
      return res.status(403).json({ error: 'Không được xoá bài viết của người khác' });
    }

    // ✅ Đồng bộ Elasticsearch nhưng không ảnh hưởng nếu lỗi
    try {
      await deletePostFromES(postId);
    } catch (esError) {
      console.error('⚠️ Lỗi sync Elasticsearch (delete):', esError.message || esError);
    }

    res.json({ message: 'Đã xoá bài viết' });
  } catch (err) {
    console.error('❌ Lỗi khi xoá bài viết:', err);
    res.status(500).json({ error: 'Lỗi server khi xoá bài viết' });
  }
};
