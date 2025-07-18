const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const pool = require('../db');

const generateAccessToken = (user) => {
  return jwt.sign({ id: user.id, username: user.username }, process.env.ACCESS_TOKEN_SECRET, { expiresIn: '15m' });
};

const generateRefreshToken = (user) => {
  return jwt.sign({ id: user.id }, process.env.REFRESH_TOKEN_SECRET, { expiresIn: '7d' });
};

const setRefreshTokenCookie = (res, token) => {
  res.cookie('refreshToken', token, {
    httpOnly: true,
    secure: false, // 🔧 false vì đang test ở localhost
    sameSite: 'Lax',
    maxAge: 7 * 24 * 60 * 60 * 1000
  });
};

// ================= REGISTER =================
exports.register = async (req, res) => {
  const { username, email, password } = req.body;
  if (!username || !email || !password)
    return res.status(400).json({ message: 'Thiếu thông tin.' });

  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    const result = await pool.query(
      'INSERT INTO users (username, email, password) VALUES ($1, $2, $3) RETURNING *',
      [username, email, hashedPassword]
    );

    const user = result.rows[0];
    const accessToken = generateAccessToken(user);
    const refreshToken = generateRefreshToken(user);

    await pool.query('UPDATE users SET refresh_token = $1 WHERE id = $2', [refreshToken, user.id]);
    setRefreshTokenCookie(res, refreshToken);

    res.json({ user: { id: user.id, username: user.username, email: user.email }, accessToken });
  } catch (err) {
    if (err.code === '23505' && err.detail?.includes('email')) {
      return res.status(400).json({ message: 'Email đã được sử dụng.' });
    }

    console.error('Đăng ký lỗi:', err);
    res.status(500).json({ message: 'Lỗi server.' });
  }
};

// ================= LOGIN =================
exports.login = async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password)
    return res.status(400).json({ message: 'Thiếu email hoặc mật khẩu.' });

  try {
    const result = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
    if (result.rows.length === 0)
      return res.status(401).json({ message: 'Email không tồn tại.' });

    const user = result.rows[0];
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch)
      return res.status(401).json({ message: 'Sai mật khẩu.' });

    const accessToken = generateAccessToken(user);
    const refreshToken = generateRefreshToken(user);

    await pool.query('UPDATE users SET refresh_token = $1 WHERE id = $2', [refreshToken, user.id]);
    setRefreshTokenCookie(res, refreshToken);

    res.json({ user: { id: user.id, username: user.username, email: user.email }, accessToken });
  } catch (err) {
    console.error('Đăng nhập lỗi:', err);
    res.status(500).json({ message: 'Lỗi server.' });
  }
};

// ================= REFRESH =================
exports.refreshToken = async (req, res) => {
  const refreshToken = req.cookies?.refreshToken;
  if (!refreshToken) return res.status(401).json({ message: 'Thiếu refresh token.' });

  try {
    const decoded = jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET);
    const result = await pool.query('SELECT * FROM users WHERE id = $1', [decoded.id]);
    const user = result.rows[0];

    if (!user || user.refresh_token !== refreshToken)
      return res.status(403).json({ message: 'Refresh token không hợp lệ.' });

    const newAccessToken = generateAccessToken(user);
    res.json({ accessToken: newAccessToken });
  } catch (err) {
    console.error('Lỗi refresh token:', err);
    res.status(403).json({ message: 'Token không hợp lệ.' });
  }
};

// ================= LOGOUT =================
exports.logout = async (req, res) => {
  const userId = req.body.userId;
  if (!userId) return res.status(400).json({ message: 'Thiếu userId.' });

  try {
    await pool.query('UPDATE users SET refresh_token = NULL WHERE id = $1', [userId]);
    res.clearCookie('refreshToken');
    res.json({ message: 'Đã đăng xuất.' });
  } catch (err) {
    res.status(500).json({ message: 'Lỗi khi đăng xuất.' });
  }
};
