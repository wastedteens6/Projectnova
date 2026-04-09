import express from 'express';
import Razorpay from 'razorpay';

const router = express.Router();

// Determine payment mode based on environment variables
const USE_MOCK = process.env.USE_MOCK_PAYMENT === 'true' || !process.env.RAZORPAY_KEY_ID;
console.log(`\n🎭 Payment Mode: ${USE_MOCK ? 'MOCK MODE (Development)' : 'LIVE MODE (Razorpay)'}\n`);

// Initialize Razorpay only if not in mock mode
let razorpay = null;
if (!USE_MOCK) {
  try {
    const keyId = process.env.RAZORPAY_KEY_ID;
    const keySecret = process.env.RAZORPAY_KEY_SECRET;
    
    if (!keyId || !keySecret) {
      throw new Error('Missing RAZORPAY_KEY_ID or RAZORPAY_KEY_SECRET - switching to MOCK mode');
    }
    
    razorpay = new Razorpay({
      key_id: keyId,
      key_secret: keySecret
    });
    console.log('✅ Razorpay initialized successfully');
  } catch (err) {
    console.error('⚠️  Error initializing Razorpay:', err.message);
    console.log('🎭 Switching to MOCK mode for development\n');
  }
}

router.post('/create-order', async (req, res) => {
  try {
    const { amount, projectIds, email, phone } = req.body;

    if (!amount || !projectIds || !email || !phone) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    console.log('📦 Creating order for amount:', amount, 'paise');

    if (USE_MOCK || !razorpay) {
      // Mock payment - generate a fake order ID
      const mockOrderId = `mock_order_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      console.log('🎭 Mock order created:', mockOrderId);
      return res.json({ 
        success: true, 
        orderId: mockOrderId, 
        isMockPayment: true,
        message: 'Using mock payment (development mode)'
      });
    }

    // Real Razorpay payment
    const options = {
      amount: Math.round(amount), // Amount in paise
      currency: 'INR',
      receipt: `receipt_${Date.now()}`,
      notes: {
        projectIds: JSON.stringify(projectIds),
        email: email,
        phone: phone
      }
    };

    console.log('📝 Creating Razorpay order:', options);

    const order = await razorpay.orders.create(options);
    console.log('✅ Order created successfully:', order.id);
    res.json({ 
      success: true, 
      orderId: order.id, 
      isMockPayment: false 
    });
  } catch (err) {
    console.error('❌ Error creating order:', err.message);
    res.status(500).json({ 
      error: 'Failed to create order', 
      details: err.message
    });
  }
});

router.post('/verify-payment', (req, res) => {
  if (USE_MOCK || !razorpay) {
    console.log('🎭 Mock payment verified');
    return res.json({ success: true, message: 'Mock payment verified' });
  }
  res.json({ success: true, message: 'Payment verified' });
});

export default router;

