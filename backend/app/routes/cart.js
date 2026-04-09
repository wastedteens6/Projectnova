import express from 'express';

const router = express.Router();

router.get('/', (req, res) => {
  res.json({ success: true, cartItems: [] });
});

router.post('/add', (req, res) => {
  res.json({ success: true, message: 'Added to cart' });
});

export default router;
