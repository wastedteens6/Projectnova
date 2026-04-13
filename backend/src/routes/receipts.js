import express from "express";
import { pool } from "../config/database.js";
import { verifyToken } from "../middleware/auth.js";

const router = express.Router();

const COMPANY_INFO = {
  name: "WastedTeens☠️",
  tagline: "Quality Project Solutions",
  email: "support@wastedteens.com",
  phone: "+91 9876543210",
  website: "www.wastedteens.com",
  address: "123 Tech Street, Digital City, India",
  gst: "27AABCT1234H1Z0",
};

const generateReceiptData = (transaction, user, project) => {
  const tierLevel = parseInt(transaction.items?.tier || 1);
  const tierInfo = project.tiers?.find((t) => t.level === tierLevel) || {
    name: `Tier ${tierLevel}`,
    price: 0,
  };

  return {
    company: COMPANY_INFO,
    transactionId: transaction.id,
    receiptNumber: `RCP-${transaction.id.toString().substring(0, 8).toUpperCase()}`,
    date: new Date(transaction.created_at).toLocaleDateString("en-IN"),
    time: new Date(transaction.created_at).toLocaleTimeString("en-IN"),
    user: { name: user.name, email: user.email },
    project: { name: project.title, id: project.id },
    tier: tierInfo.name,
    amount: `₹${transaction.amount_in_paise / 100}`,
    amountInPaise: transaction.amount_in_paise,
    gst: Math.round(transaction.amount_in_paise * 0.18),
    totalAmount: Math.round(transaction.amount_in_paise * 1.18),
    paymentMethod: transaction.payment_info?.provider || "Razorpay",
    status:
      transaction.status.charAt(0).toUpperCase() + transaction.status.slice(1),
    orderId: transaction.payment_info?.orderId || "N/A",
  };
};

router.get("/receipt/:transactionId", verifyToken, async (req, res) => {
  try {
    const { transactionId } = req.params;
    const userId = req.userId; // SECURITY: Get from verified JWT

    const result = await pool.query(
      `
      SELECT t.*, u.name, u.email, p.title, p.tiers, p.id as project_id
      FROM "Transaction" t
      LEFT JOIN "User" u ON t.user_id = u.id
      LEFT JOIN "Project" p ON (t.items->>'projectId')::uuid = p.id
      WHERE t.id = $1
    `,
      [transactionId],
    );

    if (result.rows.length === 0)
      return res.status(404).json({ error: "Not found" });

    const trans = result.rows[0];

    // CRITICAL: Verify user owns this transaction
    if (trans.user_id !== userId) {
      return res.status(403).json({
        error: "Forbidden - You can only view your own receipts",
        code: "USER_MISMATCH",
      });
    }

    const receiptData = generateReceiptData(
      trans,
      { name: trans.name, email: trans.email },
      { title: trans.title, id: trans.project_id, tiers: trans.tiers },
    );

    res.json({ success: true, receipt: receiptData });
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch receipt" });
  }
});

router.get("/download-txt/:transactionId", verifyToken, async (req, res) => {
  try {
    const { transactionId } = req.params;
    const userId = req.userId; // SECURITY: Get from verified JWT

    const result = await pool.query(
      `
      SELECT t.*, u.name, u.email, p.title, p.tiers, p.id as project_id
      FROM "Transaction" t
      LEFT JOIN "User" u ON t.user_id = u.id
      LEFT JOIN "Project" p ON (t.items->>'projectId')::uuid = p.id
      WHERE t.id = $1
    `,
      [transactionId],
    );

    if (result.rows.length === 0)
      return res.status(404).json({ error: "Not found" });

    const trans = result.rows[0];

    // CRITICAL: Verify user owns this transaction
    if (trans.user_id !== userId) {
      return res
        .status(403)
        .json({ error: "Forbidden - You can only download your own receipts" });
    }

    const receipt = generateReceiptData(trans, trans, {
      title: trans.title,
      id: trans.project_id,
      tiers: trans.tiers,
    });

    const txt = `
╔════════════════════════════════════════════════════════════════╗
║                ${COMPANY_INFO.name.padEnd(46)}║
║                ${COMPANY_INFO.tagline.padEnd(46)}║\n╠════════════════════════════════════════════════════════════════╣
║ Receipt Number: ${receipt.receiptNumber.padEnd(45)}║
║ Date: ${receipt.date.padEnd(57)}║
║ Time: ${receipt.time.padEnd(57)}║
╠════════════════════════════════════════════════════════════════╣
║ CUSTOMER INFORMATION                                             ║
║ Name: ${trans.name?.padEnd(59)}║
║ Email: ${trans.email?.padEnd(58)}║
╠════════════════════════════════════════════════════════════════╣
║ PROJECT DETAILS                                                  ║
║ Project: ${receipt.project.name.substring(0, 50).padEnd(50)}║
║ Package: ${receipt.tier.padEnd(54)}║
╠════════════════════════════════════════════════════════════════╣
║ PAYMENT SUMMARY                                                  ║
║ Subtotal: ₹${(receipt.amountInPaise / 100).toFixed(2).padEnd(50)}║
║ GST (18%): ₹${(receipt.gst / 100).toFixed(2).padEnd(48)}║
║ Total Amount: ₹${(receipt.totalAmount / 100).toFixed(2).padEnd(44)}║
║ Payment Method: ${receipt.paymentMethod.padEnd(45)}║
║ Order ID: ${receipt.orderId.padEnd(52)}║
║ Status: ${receipt.status.padEnd(53)}║
╠════════════════════════════════════════════════════════════════╣
║ ${COMPANY_INFO.website.padEnd(61)}║
║ ${COMPANY_INFO.email.padEnd(61)}║
║ GST: ${COMPANY_INFO.gst.padEnd(57)}║
╚════════════════════════════════════════════════════════════════╝
Thank you for your purchase!
    `;
    res.setHeader("Content-Type", "text/plain");
    res.send(txt);
  } catch (err) {
    res.status(500).json({ error: "Download failed" });
  }
});

export default router;
