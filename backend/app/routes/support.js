import express from 'express';

const router = express.Router();

router.get('/tickets', (req, res) => {
  res.json({ success: true, tickets: [] });
});

router.post('/tickets', (req, res) => {
  res.json({ success: true, message: 'Ticket created' });
});

export default router;
