const pool = require('../db');

exports.getNotifications = async (req, res) => {
  const userId = req.user.id;

  try {
    const result = await pool.query(
      `SELECT n.*, u.username AS sender_name
       FROM notify n
       JOIN users u ON n.sender_id = u.id
       WHERE n.receiver_id = $1
       ORDER BY n.created_at DESC`,
      [userId]
    );

    res.json(result.rows);
  } catch (err) {
    console.error('Get notifications error:', err);
    res.status(500).json({ message: 'Error fetching notifications' });
  }
};
