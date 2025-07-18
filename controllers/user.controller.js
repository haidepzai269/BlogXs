const pool = require('../db');
const bcrypt = require('bcryptjs');

// Lấy thông tin profile
exports.getProfile = async (req, res) => {
  const userId = req.user.id;
  try {
    const result = await pool.query(
      'SELECT id, username, email FROM users WHERE id = $1',
      [userId]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Người dùng không tồn tại' });
    }
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Lỗi lấy thông tin người dùng:', error);
    res.status(500).json({ message: 'Lỗi server' });
  }
};

// Cập nhật profile
exports.updateProfile = async (req, res) => {
  const userId = req.user.id;
  const { username, email, password } = req.body;

  try {
    // Lấy thông tin hiện tại
    const result = await pool.query('SELECT * FROM users WHERE id = $1', [userId]);
    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Người dùng không tồn tại' });
    }

    // Cập nhật
    const hashedPassword = password ? await bcrypt.hash(password, 10) : result.rows[0].password;

    await pool.query(
      'UPDATE users SET username = $1, email = $2, password = $3 WHERE id = $4',
      [username, email, hashedPassword, userId]
    );

    res.json({ message: 'Cập nhật thành công' });
  } catch (error) {
    console.error('Lỗi cập nhật người dùng:', error);
    res.status(500).json({ message: 'Lỗi server' });
  }
};
