import express from 'express';
import jwt from 'jsonwebtoken';
import { pool } from '../config/database.js';

const router = express.Router();

// verifyToken middleware
const verifyToken = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(" ")[1];
    if (!token) return res.status(401).json({ error: "Unauthorized - Token required" });
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.userId = decoded.id;
    next();
  } catch (err) {
    res.status(401).json({ error: "Invalid token" });
  }
};

/**
 * GET /api/notifications
 */
router.get('/', verifyToken, async (req, res) => {
  try {
    console.log('Fetching notifications for user:', req.userId);
    const result = await pool.query(
      'SELECT * FROM "Notification" WHERE user_id = $1 ORDER BY created_at DESC LIMIT 50',
      [req.userId]
    );
    res.json({ success: true, data: result.rows });
  } catch (err) {
    console.error('Error fetching notifications:', err);
    res.status(500).json({ success: false, message: 'Failed to fetch notifications' });
  }
});

/**
 * PATCH /api/notifications/:id/read
 */
router.patch('/:id/read', verifyToken, async (req, res) => {
  try {
    const { id } = req.params;
    await pool.query(
      'UPDATE "Notification" SET is_read = true WHERE id = $1 AND user_id = $2',
      [id, req.userId]
    );
    res.json({ success: true, message: 'Notification marked as read' });
  } catch (err) {
    console.error('Error marking notification as read:', err);
    res.status(500).json({ success: false, message: 'Failed to update notification' });
  }
});

/**
 * PATCH /api/notifications/read-all
 */
router.patch('/read-all', verifyToken, async (req, res) => {
  try {
    await pool.query(
      'UPDATE "Notification" SET is_read = true WHERE user_id = $1',
      [req.userId]
    );
    res.json({ success: true, message: 'All notifications marked as read' });
  } catch (err) {
    console.error('Error marking all notifications as read:', err);
    res.status(500).json({ success: false, message: 'Failed to update notifications' });
  }
});

/**
 * DELETE /api/notifications/clear-all
 */
router.delete('/clear-all', verifyToken, async (req, res) => {
  try {
    await pool.query(
      'DELETE FROM "Notification" WHERE user_id = $1',
      [req.userId]
    );
    res.json({ success: true, message: 'All notifications cleared' });
  } catch (err) {
    console.error('Error clearing notifications:', err);
    res.status(500).json({ success: false, message: 'Failed to clear notifications' });
  }
});

export default router;
