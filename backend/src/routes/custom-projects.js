import express from 'express';
import { pool } from '../config/database.js';
import { adminAuth } from '../middleware/adminAuth.js';

const router = express.Router();

/**
 * @route POST /api/custom-projects/submit
 */
router.post('/submit', async (req, res) => {
  try {
    const {
      userEmail,
      projectName,
      description,
      technologies,
      domain,
      inputOutput,
      deliverables,
      expectedDeadline,
      phone,
      budget
    } = req.body;

    if (!userEmail || !projectName || !description) {
      return res.status(400).json({ success: false, message: 'Missing fields' });
    }

    const details = {
      technologies,
      domain,
      inputOutput,
      deliverables: deliverables || [],
      expectedDeadline,
      phone,
      budget
    };

    const result = await pool.query(`
      INSERT INTO "CustomRequest" (
        user_email, project_name, description, details, status
      ) VALUES ($1, $2, $3, $4, $5)
      RETURNING *;
    `, [userEmail, projectName, description, JSON.stringify(details), 'pending']);

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
 * @route GET /api/admin/custom-projects
 */
router.get('/', adminAuth, async (req, res) => {
  try {
    const { status = 'all' } = req.query;
    let query = 'SELECT * FROM "CustomRequest"';
    const params = [];

    if (status !== 'all') {
      query += ' WHERE status = $1';
      params.push(status);
    }
    query += ' ORDER BY created_at DESC';

    const result = await pool.query(query, params);
    
    // Flatten details for frontend compatibility if needed
    const data = result.rows.map(row => ({
      ...row,
      ...row.details // Spreading details into top level
    }));

    res.json({ success: true, count: data.length, data });
  } catch (error) {
    console.error('Error fetching custom projects:', error);
    res.status(500).json({ success: false, message: 'Fetch failed' });
  }
});

/**
 * @route GET /api/admin/custom-projects/:id
 */
router.get('/:id', adminAuth, async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query('SELECT * FROM "CustomRequest" WHERE id = $1', [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Not found' });
    }

    const row = result.rows[0];
    res.json({ success: true, data: { ...row, ...row.details } });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Fetch failed' });
  }
});

/**
 * @route PATCH /api/admin/custom-projects/:id
 */
router.patch('/:id', adminAuth, async (req, res) => {
  try {
    const { id } = req.params;
    const { status, adminNotes } = req.body;

    const result = await pool.query(`
      UPDATE "CustomRequest"
      SET status = COALESCE($1, status),
          admin_notes = COALESCE($2, admin_notes),
          updated_at = CURRENT_TIMESTAMP
      WHERE id = $3
      RETURNING *;
    `, [status || null, adminNotes || null, id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Not found' });
    }

    res.json({ success: true, message: 'Updated successfully', data: result.rows[0] });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Update failed' });
  }
});

/**
 * @route DELETE /api/admin/custom-projects/:id
 */
router.delete('/:id', adminAuth, async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query('DELETE FROM "CustomRequest" WHERE id = $1 RETURNING id', [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Not found' });
    }

    res.json({ success: true, message: 'Deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Delete failed' });
  }
});

export default router;
