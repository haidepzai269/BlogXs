// controllers/profile.controller.js
const pool = require('../db');

exports.getProfile = async (req, res) => {
  try {
    const userId = req.user.id;
    const result = await pool.query('SELECT id, username, email FROM users WHERE id = $1', [userId]);
    if (result.rows.length === 0) return res.sendStatus(404);
    res.json(result.rows[0]);
  } catch (err) {
    console.error('Lỗi khi lấy profile:', err);
    res.sendStatus(500);
  }
};

exports.updateProfile = async (req, res) => {
  try {
    const userId = req.user.id;
    const { username, email, password } = req.body;

    const fields = [];
    const values = [];
    let paramIndex = 1;

    if (username) {
      fields.push(`username = $${paramIndex++}`);
      values.push(username);
    }
    if (email) {
      fields.push(`email = $${paramIndex++}`);
      values.push(email);
    }
    if (password) {
      const bcrypt = require('bcryptjs');
      const hashedPassword = await bcrypt.hash(password, 10);
      fields.push(`password = $${paramIndex++}`);
      values.push(hashedPassword);
    }

    if (fields.length === 0) return res.status(400).json({ message: 'Không có gì để cập nhật' });

    values.push(userId);
    const query = `UPDATE users SET ${fields.join(', ')} WHERE id = $${paramIndex}`;
    await pool.query(query, values);

    res.json({ message: 'Cập nhật thành công' });
  } catch (err) {
    console.error('Lỗi khi cập nhật profile:', err);
    res.sendStatus(500);
  }
};

exports.updateAvatar = async (req, res) => {
  const userId = req.user.id;
  const avatarPath = `/uploads/${req.file.filename}`;

  try {
    // Cập nhật bảng users
    await pool.query('UPDATE users SET avatar_url = $1 WHERE id = $2', [avatarPath, userId]);

    // Thêm vào bảng images
    await pool.query(
      'INSERT INTO images (user_id, type, url) VALUES ($1, $2, $3)',
      [userId, 'avatar', avatarPath]
    );

    res.json({ message: 'Avatar updated successfully', avatar_url: avatarPath });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error' });
  }
};
exports.updateCover = async (req, res) => {
  const userId = req.user.id;
  const coverPath = `/uploads/${req.file.filename}`;

  try {
    await pool.query('UPDATE users SET cover_url = $1 WHERE id = $2', [coverPath, userId]);

    await pool.query(
      'INSERT INTO images (user_id, type, url) VALUES ($1, $2, $3)',
      [userId, 'cover', coverPath]
    );

    res.json({ message: 'Cover updated successfully', cover_url: coverPath });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error' });
  }
};
