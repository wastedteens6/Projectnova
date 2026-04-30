import express from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { pool } from '../config/database.js';
import { adminAuth } from '../middleware/adminAuth.js';

const router = express.Router();

// Create branding uploads directory
const brandingDir = 'uploads/branding';
if (!fs.existsSync(brandingDir)) {
  fs.mkdirSync(brandingDir, { recursive: true });
}

// Configure multer for branding
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, brandingDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ 
  storage,
  limits: { fileSize: 2 * 1024 * 1024 }, // 2MB limit
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|svg|ico|webp/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);
    if (extname && mimetype) {
      return cb(null, true);
    }
    cb(new Error('Only images (jpg, png, svg, ico, webp) are allowed'));
  }
});

// GET /api/settings - Publicly available settings
router.get('/', async (req, res) => {
  try {
    const result = await pool.query('SELECT key, value FROM "Settings"');
    const settings = {};
    result.rows.forEach(row => {
      settings[row.key] = row.value;
    });
    res.json({ success: true, settings });
  } catch (err) {
    console.error('Error fetching settings:', err);
    res.status(500).json({ success: false, error: 'Failed to fetch settings' });
  }
});

// PUT /api/settings - Update settings (Admin only)
router.put('/', adminAuth, async (req, res) => {
  const { settings } = req.body;
  if (!settings || typeof settings !== 'object') {
    return res.status(400).json({ success: false, error: 'Invalid settings data' });
  }

  try {
    // We use a transaction to ensure all settings are updated or none
    await pool.query('BEGIN');
    
    for (const [key, value] of Object.entries(settings)) {
      await pool.query(
        'INSERT INTO "Settings" (key, value) VALUES ($1, $2) ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value',
        [key, String(value)]
      );
    }
    
    await pool.query('COMMIT');
    res.json({ success: true, message: 'Settings updated successfully' });
  } catch (err) {
    await pool.query('ROLLBACK');
    console.error('Error updating settings:', err);
    res.status(500).json({ success: false, error: 'Failed to update settings' });
  }
});

// POST /api/settings/upload - Upload branding files
router.post('/upload', adminAuth, upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, error: 'No file uploaded' });
    }

    const type = req.body.type; // 'logo' or 'favicon'
    if (!['logo', 'favicon'].includes(type)) {
      return res.status(400).json({ success: false, error: 'Invalid upload type' });
    }

    const filePath = `/uploads/branding/${req.file.filename}`;
    
    // Update settings table immediately
    await pool.query(
      'INSERT INTO "Settings" (key, value) VALUES ($1, $2) ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value',
      [type, filePath]
    );

    res.json({ success: true, url: filePath });
  } catch (err) {
    console.error('Error uploading branding file:', err);
    res.status(500).json({ success: false, error: 'Upload failed' });
  }
});

export default router;
