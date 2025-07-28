const pool = require('../db');

// 1. Lấy danh sách thông báo của người dùng
exports.getNotifications = async (req, res) => {
  const userId = req.user.id;

  try {
    const result = await pool.query(
      `SELECT 
         n.id, 
         n.sender_id, 
         n.post_id, 
         n.is_read, 
         n.created_at, 
         u.username AS sender_username,
         p.content AS post
       FROM post_like_notifications n
       JOIN users u ON n.sender_id = u.id
       JOIN posts p ON n.post_id = p.id
       WHERE n.receiver_id = $1
       ORDER BY n.created_at DESC
       LIMIT 30`,
      [userId]
    );

    res.json({ notifications: result.rows });
  } catch (err) {
    console.error('Lỗi khi lấy thông báo:', err);
    res.status(500).json({ error: 'Không thể lấy thông báo' });
  }
};


// 2. Đánh dấu tất cả là đã đọc
exports.markAsRead = async (req, res) => {
  const userId = req.user.id;

  try {
    await pool.query(
      'UPDATE post_like_notifications SET is_read = TRUE WHERE receiver_id = $1 AND is_read = FALSE',
      [userId]
    );

    res.json({ message: 'Đã đánh dấu tất cả thông báo là đã đọc' });
  } catch (err) {
    console.error('Lỗi khi đánh dấu đã đọc:', err);
    res.status(500).json({ error: 'Không thể đánh dấu đã đọc' });
  }
};

// Xoá 1 thông báo theo id (và chỉ khi user là người nhận)
exports.deleteNotification = async (req, res) => {
  const userId = req.user.id;
  const notificationId = req.params.id;

  try {
    const result = await pool.query(
      'DELETE FROM post_like_notifications WHERE id = $1 AND receiver_id = $2',
      [notificationId, userId]
    );

    if (result.rowCount === 0) {
      return res.status(403).json({ error: 'Không có quyền hoặc thông báo không tồn tại' });
    }

    res.json({ message: 'Đã xoá thông báo' });
  } catch (err) {
    console.error('Lỗi khi xoá thông báo:', err);
    res.status(500).json({ error: 'Không thể xoá thông báo' });
  }
};

