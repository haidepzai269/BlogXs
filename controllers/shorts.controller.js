const { uploadToCloudinary } = require('../utils/cloudinary');
const pool = require('../db'); // Kết nối PostgreSQL

// [POST] Upload video
exports.uploadShort = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'Không có video được tải lên' });
    }

    const { caption } = req.body;
    const userId = req.user.id;

    // Upload lên Cloudinary
    const result = await uploadToCloudinary(req.file.buffer, 'video');

    // Lưu vào database
    const insertQuery = `
      INSERT INTO shorts (user_id, video_url, caption)
      VALUES ($1, $2, $3)
      RETURNING *;
    `;
    const values = [userId, result.secure_url, caption || null];
    const { rows } = await pool.query(insertQuery, values);

    res.status(201).json(rows[0]);
  } catch (err) {
    console.error('❌ Upload short failed:', err);
    res.status(500).json({ message: 'Lỗi máy chủ khi upload short' });
  }
};

// [GET] Lấy danh sách shorts mới nhất
exports.getAllShorts = async (req, res) => {
  try {
    const query = `
      SELECT s.*, u.username
      FROM shorts s
      JOIN users u ON u.id = s.user_id
      ORDER BY s.created_at DESC;
    `;
    const { rows } = await pool.query(query);
    res.json(rows);
  } catch (err) {
    console.error('❌ Fetch shorts failed:', err);
    res.status(500).json({ message: 'Lỗi máy chủ khi lấy danh sách shorts' });
  }
};
