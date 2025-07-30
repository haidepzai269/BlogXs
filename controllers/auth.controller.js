const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const pool = require('../db');
const nodemailer = require("nodemailer");
const crypto = require("crypto");
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
// forgot-password


// ⚠️ cấu hình email thực tế của bạn ở đây:
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,      // Từ .env
    pass: process.env.EMAIL_PASS,
  },
});

// Tạo mã xác thực
function generateCode() {
  return Math.floor(100000 + Math.random() * 900000).toString(); // 6 số
}

// Gửi mã đến email người dùng
exports.forgotPassword = async (req, res) => {
  const { email } = req.body;
  if (!email) return res.status(400).json({ message: "Email là bắt buộc." });

  try {
    const userRes = await pool.query("SELECT id FROM users WHERE email = $1", [email]);
    if (userRes.rows.length === 0) {
      return res.status(404).json({ message: "Email không tồn tại." });
    }

    const code = generateCode();
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000); // hết hạn sau 15 phút

    await pool.query(`
      INSERT INTO password_reset_codes (email, code, expires_at)
      VALUES ($1, $2, $3)
      ON CONFLICT (email) DO UPDATE
      SET code = $2, expires_at = $3
    `, [email, code, expiresAt]);

    await transporter.sendMail({
      from: `"BlogXs" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: "Mã đặt lại mật khẩu của bạn",
      text: `Mã xác nhận của bạn là: ${code}`,
    });

    res.json({ message: "Mã xác nhận đã được gửi đến email." });
  } catch (err) {
    console.error("❌ Forgot password error:", err);
    res.status(500).json({ message: "Lỗi máy chủ." });
  }
};


// Xác minh mã và đặt lại mật khẩu
exports.resetPassword = async (req, res) => {
  const { email, code, newPassword } = req.body;
  if (!email || !code || !newPassword) {
    return res.status(400).json({ message: "Thiếu thông tin." });
  }

  try {
    const result = await pool.query(`
      SELECT * FROM password_reset_codes
      WHERE email = $1 AND code = $2 AND expires_at > NOW()
    `, [email, code]);

    if (result.rows.length === 0) {
      return res.status(400).json({ message: "Mã không hợp lệ hoặc đã hết hạn." });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    await pool.query(`
      UPDATE users SET password = $1 WHERE email = $2
    `, [hashedPassword, email]);

    await pool.query(`DELETE FROM password_reset_codes WHERE email = $1`, [email]);

    res.json({ message: "Đặt lại mật khẩu thành công." });
  } catch (err) {
    console.error("❌ Reset password error:", err);
    res.status(500).json({ message: "Lỗi máy chủ." });
  }
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
//
// Đảm bảo bạn có: const db = require('../db'); hoặc pool tùy tên bạn
exports.verifyCode = async (req, res) => {
  try {
    const { email, code } = req.body;
    if (!email || !code) {
      return res.status(400).json({ message: "Thiếu email hoặc mã xác nhận" });
    }

    const result = await pool.query( // ✅ Dùng pool
      "SELECT * FROM password_reset_codes WHERE email = $1 AND code = $2 AND expires_at > NOW()",
      [email, code]
    );

    if (result.rows.length === 0) {
      return res.status(400).json({ message: "Mã xác nhận không đúng hoặc hết hạn" });
    }

    res.status(200).json({ message: "Mã xác nhận hợp lệ" });
  } catch (err) {
    console.error("Lỗi verify-code:", err);
    res.status(500).json({ message: "Lỗi máy chủ" });
  }
};

