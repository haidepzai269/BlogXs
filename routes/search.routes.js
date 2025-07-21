const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../middleware/auth');
const client = require('../utils/elasticsearchClient');

// Tìm kiếm bài viết bằng Elasticsearch
router.get('/', authenticateToken, async (req, res) => {
  const q = req.query.q || '';
  if (!q) return res.status(400).json({ error: 'Thiếu từ khóa tìm kiếm' });

  try {
    const esResult = await client.search({
      index: 'posts',
      query: {
        multi_match: {
          query: q,
          fields: ['content^2', 'title'],
          fuzziness: 'AUTO'
        }
      }
    });

    const hits = esResult.hits.hits.map(hit => hit._source);
    res.json(hits);
  } catch (err) {
    console.error('❌ Lỗi Elasticsearch:', err.message);
    res.status(500).json({ error: 'Không thể tìm kiếm' });
  }
});

module.exports = router;
