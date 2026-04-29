import express from 'express';
import jwt from 'jsonwebtoken';
import { pool } from '../config/database.js';
import { adminAuth } from '../middleware/adminAuth.js';
import nodemailer from 'nodemailer';
import { emailConfig } from '../config/email.js';

const router = express.Router();

const verifyToken = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(" ")[1];
    if (!token) return res.status(401).json({ error: "Unauthorized - Token required" });
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.userId = decoded.id;
    req.userEmail = decoded.email;
    next();
  } catch (err) {
    res.status(401).json({ error: "Invalid token" });
  }
};

/**
 * POST /api/custom-projects/submit
 */
router.post('/submit', verifyToken, async (req, res) => {
  try {
    const {
      projectName, description, technologies, domain,
      inputOutput, deliverables, expectedDeadline, phone, budget
    } = req.body;

    const userId = req.userId;
    const userEmail = req.userEmail;

    if (!projectName || !description) {
      return res.status(400).json({ success: false, message: 'Missing required fields' });
    }

    const details = { technologies, domain, inputOutput, deliverables: deliverables || [], expectedDeadline, phone, budget };

    // Use the consolidated Request table with type='custom_project'
    const result = await pool.query(`
      INSERT INTO "Request" (user_id, user_email, type, subject, description, status, details)
      VALUES ($1, $2, 'custom_project', $3, $4, 'pending', $5)
      RETURNING *;
    `, [userId, userEmail, projectName, description, JSON.stringify(details)]);

    res.status(201).json({
      success: true,
      message: 'Custom project request submitted successfully',
      data: result.rows[0]
    });
  } catch (error) {
    console.error('Error submitting custom project:', error);
    res.status(500).json({ success: false, message: 'Submission failed' });
  }
});

/**
 * GET /api/custom-projects/my-requests
 */
router.get('/my-requests', verifyToken, async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT * FROM "Request" WHERE user_id = $1 AND type = 'custom_project' ORDER BY created_at DESC`,
      [req.userId]
    );
    res.json({ success: true, count: result.rows.length, data: result.rows });
  } catch (error) {
    console.error('Error fetching user requests:', error);
    res.status(500).json({ success: false, message: 'Fetch failed' });
  }
});

/**
 * GET /api/admin/custom-projects — Admin: all custom project requests
 */
router.get('/', adminAuth, async (req, res) => {
  try {
    const { status = 'all' } = req.query;
    let query = `SELECT * FROM "Request" WHERE type = 'custom_project'`;
    const params = [];

    if (status !== 'all') {
      query += ` AND status = $1`;
      params.push(status);
    }
    query += ' ORDER BY created_at DESC';

    const result = await pool.query(query, params);
    const data = result.rows.map(row => ({
      ...row,
      ...(row.details || {}),   // flatten details for frontend compat
      project_name: row.subject, // alias
    }));

    res.json({ success: true, count: data.length, data });
  } catch (error) {
    console.error('Error fetching custom projects:', error);
    res.status(500).json({ success: false, message: 'Fetch failed' });
  }
});

/**
 * GET /api/admin/custom-projects/:id
 */
router.get('/:id', adminAuth, async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query(
      `SELECT * FROM "Request" WHERE id = $1 AND type = 'custom_project'`,
      [id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Not found' });
    }
    const row = result.rows[0];
    res.json({ success: true, data: { ...row, ...(row.details || {}), project_name: row.subject } });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Fetch failed' });
  }
});

/**
 * PATCH /api/admin/custom-projects/:id
 */
router.patch('/:id', adminAuth, async (req, res) => {
  try {
    const { id } = req.params;
    const { status, adminNotes } = req.body;

    const result = await pool.query(`
      UPDATE "Request"
      SET status = COALESCE($1, status),
          admin_notes = COALESCE($2, admin_notes),
          updated_at = CURRENT_TIMESTAMP
      WHERE id = $3 AND type = 'custom_project'
      RETURNING *;
    `, [status || null, adminNotes || null, id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Not found' });
    }

    const updatedRequest = result.rows[0];

    // Notification System Logic
    try {
      // 1. Database Notification
      let noticeMessage = `The status of your custom project request "${updatedRequest.subject}" has been updated to: ${String(status).toUpperCase()}.`;
      if (adminNotes) {
        noticeMessage += ` Admin Note: ${adminNotes}`;
      }

      console.log('Sending notification to user:', updatedRequest.user_id);
      console.log('Notification message:', noticeMessage);

      await pool.query(
        'INSERT INTO "Notification" (user_id, title, message, type) VALUES ($1, $2, $3, $4)',
        [updatedRequest.user_id, 'Project Status Update', noticeMessage, 'status_update']
      );
      console.log('Notification inserted successfully');

      // 2. Notification Email Logic
      const transporter = nodemailer.createTransport({
        host: emailConfig.host,
        port: emailConfig.port,
        auth: {
          user: emailConfig.user,
          pass: emailConfig.password
        }
      });

      let emailSubject = `Update on your Custom Project: ${updatedRequest.subject}`;
      let emailBody = `Hello,\n\nThe status of your custom project request "${updatedRequest.subject}" has been updated to: ${String(status).toUpperCase()}.\n\n`;
      
      if (status === 'approved') {
        emailBody += "Great news! Your project request has been approved. Our team will reach out with the next steps shortly.\n";
      } else if (status === 'rejected') {
        emailBody += "Unfortunately, we are unable to accept your project request at this time.\n";
      } else if (status === 'revived') {
        emailBody += "We are currently reviewing your project details. Please stand by for the final decision.\n";
      }

      if (updatedRequest.admin_notes || adminNotes) {
        emailBody += `\nAdmin Notes: ${updatedRequest.admin_notes || adminNotes}\n`;
      }
      emailBody += `\nThank you,\nThe ProjectNova Team`;

      // Only dispatch actual SMTP mail if credentials are bound, else log a mock representation for dev
      if (emailConfig.user && emailConfig.password) {
        await transporter.sendMail({
          from: emailConfig.from,
          to: updatedRequest.user_email,
          subject: emailSubject,
          text: emailBody
        });
      } else {
        console.log("Skipping email send: SMTP credentials not fully configured.");
        console.log(`Mock Email explicitly intended to send to ${updatedRequest.user_email}: [${emailSubject}]`);
      }
    } catch (emailErr) {
      console.error("Failed to send notification email:", emailErr);
      // Fallback: Proceed independently if email faults to prevent request blocker
    }

    res.json({ success: true, message: 'Updated successfully', data: updatedRequest });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Update failed' });
  }
});

/**
 * DELETE /api/admin/custom-projects/:id
 */
router.delete('/:id', adminAuth, async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query(
      `DELETE FROM "Request" WHERE id = $1 AND type = 'custom_project' RETURNING id`,
      [id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Not found' });
    }
    res.json({ success: true, message: 'Deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Delete failed' });
  }
});

export default router;
