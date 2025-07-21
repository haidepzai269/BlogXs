const db = require('../db');
const { indexPostToES } = require('../utils/syncElasticsearch');
require('dotenv').config();

(async () => {
  try {
    const result = await db.query('SELECT * FROM posts');
    const posts = result.rows;

    console.log(`🔄 Đang đồng bộ ${posts.length} bài viết vào Elasticsearch...`);

    for (const post of posts) {
      try {
        await indexPostToES(post);
        console.log(`✅ Indexed post #${post.id}`);
      } catch (err) {
        console.error(`❌ Lỗi khi index bài #${post.id}:`, err.message);
      }
    }

    console.log('✅ Đồng bộ hoàn tất!');
  } catch (err) {
    console.error('❌ Lỗi khi truy vấn bài viết từ DB:', err.message);
  }
})();
