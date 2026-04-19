import express from 'express';
import jwt from 'jsonwebtoken';
import { pool } from '../config/database.js';
import { adminAuth } from '../middleware/adminAuth.js';

const router = express.Router();

// Local verifyToken middleware (for support tickets)
const verifyToken = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(" ")[1];
    if (!token) return res.status(401).json({ error: "Unauthorized - Token required" });
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.userId = decoded.id;
    req.role = decoded.role;
    next();
  } catch (err) {
    res.status(401).json({ error: "Invalid token" });
  }
};

/**
 * GET /api/support/tickets — Admin: get all support tickets
 */
router.get('/tickets', adminAuth, async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT 
        r.id, r.user_id, u.email, u.name, r.subject,
        r.status, r.conversation, r.created_at, r.updated_at
      FROM "Request" r
      LEFT JOIN "User" u ON r.user_id = u.id
      WHERE r.type = 'support'
      ORDER BY r.updated_at DESC
    `);
    res.json({ success: true, tickets: result.rows });
  } catch (err) {
    console.error('Error fetching tickets:', err);
    res.status(500).json({ success: false, message: 'Failed to fetch tickets' });
  }
});

/**
 * GET /api/support/my-tickets — User: get own tickets
 */
router.get('/my-tickets', verifyToken, async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT id, subject, status, conversation, created_at, updated_at
      FROM "Request"
      WHERE user_id = $1 AND type = 'support'
      ORDER BY updated_at DESC
    `, [req.userId]);
    res.json({ success: true, tickets: result.rows });
  } catch (err) {
    console.error('Error fetching user tickets:', err);
    res.status(500).json({ success: false, message: 'Failed to fetch tickets' });
  }
});

/**
 * POST /api/support/tickets — Create a new support ticket
 */
router.post('/tickets', verifyToken, async (req, res) => {
  try {
    const { subject, message } = req.body;
    const userId = req.userId;
    if (!subject || !message) {
      return res.status(400).json({ success: false, message: 'Subject and message required' });
    }
    const conversation = [{ sender: 'user', message, timestamp: new Date().toISOString() }];
    const result = await pool.query(`
      INSERT INTO "Request" (user_id, type, subject, status, description, conversation)
      VALUES ($1, 'support', $2, 'open', $3, $4)
      RETURNING *
    `, [userId, subject, message, JSON.stringify(conversation)]);
    res.status(201).json({ success: true, message: 'Support ticket created', ticket: result.rows[0] });
  } catch (err) {
    console.error('Error creating ticket:', err);
    res.status(500).json({ success: false, message: 'Failed to create ticket' });
  }
});

/**
 * GET /api/support/tickets/:id — Get specific ticket
 */
router.get('/tickets/:id', verifyToken, async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query(
      `SELECT * FROM "Request" WHERE id = $1 AND type = 'support'`,
      [id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Ticket not found' });
    }
    const ticket = result.rows[0];
    if (req.role !== 'admin' && ticket.user_id !== req.userId) {
      return res.status(403).json({ success: false, message: 'Forbidden - You can only view your own tickets' });
    }
    res.json({ success: true, ticket });
  } catch (err) {
    console.error('Error fetching ticket:', err);
    res.status(500).json({ success: false, message: 'Failed to fetch ticket' });
  }
});

/**
 * POST /api/support/tickets/:id/message — Add message to ticket
 */
router.post('/tickets/:id/message', verifyToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { message } = req.body;
    if (!message) {
      return res.status(400).json({ success: false, message: 'Message required' });
    }
    const ticketResult = await pool.query(
      `SELECT * FROM "Request" WHERE id = $1 AND type = 'support'`,
      [id]
    );
    if (ticketResult.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Ticket not found' });
    }
    const ticket = ticketResult.rows[0];
    if (req.role !== 'admin' && ticket.user_id !== req.userId) {
      return res.status(403).json({ success: false, message: 'Forbidden - You can only update your own tickets' });
    }
    const sender = req.role === 'admin' ? 'admin' : 'user';
    const updatedConversation = ticket.conversation || [];
    updatedConversation.push({ sender, message, timestamp: new Date().toISOString() });
    const result = await pool.query(`
      UPDATE "Request" SET conversation = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2
      RETURNING *
    `, [JSON.stringify(updatedConversation), id]);
    res.json({ success: true, message: 'Message added to ticket', ticket: result.rows[0] });
  } catch (err) {
    console.error('Error adding message:', err);
    res.status(500).json({ success: false, message: 'Failed to add message' });
  }
});

/**
 * PATCH /api/support/tickets/:id/close — Close ticket
 */
router.patch('/tickets/:id/close', verifyToken, async (req, res) => {
  try {
    const { id } = req.params;
    const ticketResult = await pool.query(
      `SELECT * FROM "Request" WHERE id = $1 AND type = 'support'`,
      [id]
    );
    if (ticketResult.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Ticket not found' });
    }
    const ticket = ticketResult.rows[0];
    if (req.role !== 'admin' && ticket.user_id !== req.userId) {
      return res.status(403).json({ success: false, message: 'Forbidden' });
    }
    const result = await pool.query(`
      UPDATE "Request" SET status = 'closed', updated_at = CURRENT_TIMESTAMP WHERE id = $1
      RETURNING *
    `, [id]);
    res.json({ success: true, message: 'Ticket closed', ticket: result.rows[0] });
  } catch (err) {
    console.error('Error closing ticket:', err);
    res.status(500).json({ success: false, message: 'Failed to close ticket' });
  }
});

export default router;
