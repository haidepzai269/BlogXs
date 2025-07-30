// controllers/profile.controller.js
const pool = require('../db');
const sanitizeHtml = require('sanitize-html');
const authenticateToken = require('../middleware/auth');


exports.getProfile = async (req, res) => {
  try {
    const userId = req.user.id;
    const result = await pool.query('SELECT id, username, email FROM users WHERE id = $1', [userId]);
    if (result.rows.length === 0) return res.sendStatus(404);
    const cleanData = {
      ...result.rows[0],
      username: sanitizeHtml(result.rows[0].username, { allowedTags: [], allowedAttributes: {} }),
      email: sanitizeHtml(result.rows[0].email, { allowedTags: [], allowedAttributes: {} })
    };
    res.json(cleanData);
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

    // Lọc và kiểm tra username
    if (username) {
      const cleanUsername = sanitizeHtml(username, {
        allowedTags: [],
        allowedAttributes: {}
      }).trim();

      if (!cleanUsername) {
        return res.status(400).json({ message: 'Tên không hợp lệ' });
      }

      fields.push(`username = $${paramIndex++}`);
      values.push(cleanUsername);
    }

    // Lọc và kiểm tra email
    if (email) {
      const cleanEmail = sanitizeHtml(email, {
        allowedTags: [],
        allowedAttributes: {}
      }).trim();

      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!cleanEmail || !emailRegex.test(cleanEmail)) {
        return res.status(400).json({ message: 'Email không hợp lệ' });
      }

      fields.push(`email = $${paramIndex++}`);
      values.push(cleanEmail);
    }

    // Mã hóa mật khẩu nếu có
    if (password) {
      const bcrypt = require('bcryptjs');
      const hashedPassword = await bcrypt.hash(password, 10);
      fields.push(`password = $${paramIndex++}`);
      values.push(hashedPassword);
    }

    if (fields.length === 0) {
      return res.status(400).json({ message: 'Không có gì để cập nhật' });
    }

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
  try {
    const avatarUrl = req.file.path; // Cloudinary trả về đường dẫn URL
    const userId = req.user.id;

    await pool.query(
      'UPDATE users SET avatar_url = $1 WHERE id = $2',
      [avatarUrl, userId]
    );

    res.json({ message: 'Cập nhật ảnh đại diện thành công', avatarUrl });
  } catch (err) {
    console.error('Lỗi cập nhật avatar:', err);
    res.status(500).json({ message: 'Lỗi server khi cập nhật avatar' });
  }
};
exports.updateCover = async (req, res) => {
  try {
    const coverUrl = req.file.path; // Cloudinary trả về URL đầy đủ
    const userId = req.user.id;

    // Cập nhật cover_url vào bảng users
    await pool.query(
      'UPDATE users SET cover_url = $1 WHERE id = $2',
      [coverUrl, userId]
    );

    // Lưu vào bảng images nếu cần
    await pool.query(
      'INSERT INTO images (user_id, type, url) VALUES ($1, $2, $3)',
      [userId, 'cover', coverUrl]
    );

    res.json({ message: 'Cập nhật ảnh bìa thành công', cover_url: coverUrl });
  } catch (err) {
    console.error('Lỗi cập nhật cover:', err);
    res.status(500).json({ message: 'Lỗi server khi cập nhật ảnh bìa' });
  }
};
