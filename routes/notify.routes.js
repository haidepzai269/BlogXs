const express = require('express');
const router = express.Router();
const pool = require('../db');

router.get('/', async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT * FROM notifications ORDER BY created_at DESC LIMIT 10'
    );
    res.json(result.rows);
  } catch (err) {
    console.error('Lỗi lấy thông báo:', err);
    res.status(500).json({ message: 'Lỗi server' });
  }
});

module.exports = router;
