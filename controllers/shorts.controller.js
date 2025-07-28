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
    const newShort = rows[0];

    // Lấy thông tin username của người đăng
    const userRes = await pool.query(`SELECT username FROM users WHERE id = $1`, [userId]);
    newShort.username = userRes.rows[0].username;

    // Emit sự kiện socket tới client
    const io = req.io; // đã được gán trong middleware hoặc server.js
    io.emit('new_short', newShort); // gửi tới tất cả client

    res.status(201).json(newShort);
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
