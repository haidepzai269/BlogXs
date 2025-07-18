const pool = require('./db');

(async () => {
  try {
    const res = await pool.query('SELECT NOW()');
    console.log('✅ Kết nối thành công:', res.rows[0]);
  } catch (err) {
    console.error('❌ Lỗi kết nối DB:', err.message);
  } finally {
    pool.end();
  }
})();
