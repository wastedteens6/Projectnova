import express from 'express';
import jwt from 'jsonwebtoken';
import { pool } from '../config/database.js';
import { adminAuth } from '../middleware/adminAuth.js';

const router = express.Router();

// Middleware to verify JWT token
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
 * Get all support tickets (Admin only)
 */
router.get('/tickets', adminAuth, async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT 
        s.id,
        s.user_id,
        u.email,
        u.name,
        s.subject,
        s.status,
        s.conversation,
        s.created_at,
        s.updated_at
      FROM "Support" s
      LEFT JOIN "User" u ON s.user_id = u.id
      ORDER BY s.updated_at DESC
    `);

    res.json({ success: true, tickets: result.rows });
  } catch (err) {
    console.error('Error fetching tickets:', err);
    res.status(500).json({ success: false, message: 'Failed to fetch tickets' });
  }
});

/**
 * Get user's support tickets
 */
router.get('/my-tickets', verifyToken, async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT 
        id,
        subject,
        status,
        conversation,
        created_at,
        updated_at
      FROM "Support"
      WHERE user_id = $1
      ORDER BY updated_at DESC
    `, [req.userId]);

    res.json({ success: true, tickets: result.rows });
  } catch (err) {
    console.error('Error fetching user tickets:', err);
    res.status(500).json({ success: false, message: 'Failed to fetch tickets' });
  }
});

/**
 * Create a new support ticket
 */
router.post('/tickets', verifyToken, async (req, res) => {
  try {
    const { subject, message } = req.body;
    const userId = req.userId;

    if (!subject || !message) {
      return res.status(400).json({ success: false, message: 'Subject and message required' });
    }

    // Initialize conversation with user's message
    const conversation = [
      {
        sender: 'user',
        message: message,
        timestamp: new Date().toISOString()
      }
    ];

    const result = await pool.query(`
      INSERT INTO "Support" (user_id, subject, status, conversation)
      VALUES ($1, $2, $3, $4)
      RETURNING *
    `, [userId, subject, 'open', JSON.stringify(conversation)]);

    res.status(201).json({
      success: true,
      message: 'Support ticket created',
      ticket: result.rows[0]
    });
  } catch (err) {
    console.error('Error creating ticket:', err);
    res.status(500).json({ success: false, message: 'Failed to create ticket' });
  }
});

/**
 * Get specific ticket (User can view own, Admin can view any)
 */
router.get('/tickets/:id', verifyToken, async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query(`
      SELECT * FROM "Support" WHERE id = $1
    `, [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Ticket not found' });
    }

    const ticket = result.rows[0];

    // SECURITY: User can only view their own tickets, unless they're admin
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
 * Add message to support ticket
 */
router.post('/tickets/:id/message', verifyToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { message } = req.body;

    if (!message) {
      return res.status(400).json({ success: false, message: 'Message required' });
    }

    const ticketResult = await pool.query(`
      SELECT * FROM "Support" WHERE id = $1
    `, [id]);

    if (ticketResult.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Ticket not found' });
    }

    const ticket = ticketResult.rows[0];

    // SECURITY: Only ticket owner or admin can add messages
    if (req.role !== 'admin' && ticket.user_id !== req.userId) {
      return res.status(403).json({ success: false, message: 'Forbidden - You can only update your own tickets' });
    }

    // Determine sender based on role
    const sender = req.role === 'admin' ? 'admin' : 'user';

    // Update conversation array
    const updatedConversation = ticket.conversation || [];
    updatedConversation.push({
      sender: sender,
      message: message,
      timestamp: new Date().toISOString()
    });

    const result = await pool.query(`
      UPDATE "Support"
      SET conversation = $1, updated_at = CURRENT_TIMESTAMP
      WHERE id = $2
      RETURNING *
    `, [JSON.stringify(updatedConversation), id]);

    res.json({
      success: true,
      message: 'Message added to ticket',
      ticket: result.rows[0]
    });
  } catch (err) {
    console.error('Error adding message:', err);
    res.status(500).json({ success: false, message: 'Failed to add message' });
  }
});

/**
 * Close support ticket
 */
router.patch('/tickets/:id/close', verifyToken, async (req, res) => {
  try {
    const { id } = req.params;

    const ticketResult = await pool.query(`
      SELECT * FROM "Support" WHERE id = $1
    `, [id]);

    if (ticketResult.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Ticket not found' });
    }

    const ticket = ticketResult.rows[0];

    // SECURITY: Only ticket owner or admin can close tickets
    if (req.role !== 'admin' && ticket.user_id !== req.userId) {
      return res.status(403).json({ success: false, message: 'Forbidden' });
    }

    const result = await pool.query(`
      UPDATE "Support"
      SET status = 'closed', updated_at = CURRENT_TIMESTAMP
      WHERE id = $1
      RETURNING *
    `, [id]);

    res.json({
      success: true,
      message: 'Ticket closed',
      ticket: result.rows[0]
    });
  } catch (err) {
    console.error('Error closing ticket:', err);
    res.status(500).json({ success: false, message: 'Failed to close ticket' });
  }
});

export default router;
