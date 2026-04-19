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

const generateReceiptData = (order, user, project, tierName) => {
  return {
    company: COMPANY_INFO,
    transactionId: order.id,
    receiptNumber: `RCP-${order.id.toString().substring(0, 8).toUpperCase()}`,
    date: new Date(order.created_at).toLocaleDateString("en-IN"),
    time: new Date(order.created_at).toLocaleTimeString("en-IN"),
    user: { name: user.name, email: user.email },
    project: { name: project.title, id: project.id },
    tier: tierName || "Unknown",
    amount: `₹${order.amount_in_paise / 100}`,
    amountInPaise: order.amount_in_paise,
    gst: Math.round(order.amount_in_paise * 0.18),
    totalAmount: Math.round(order.amount_in_paise * 1.18),
    paymentMethod: order.payment_info?.provider || "Razorpay",
    status: order.status
      ? order.status.charAt(0).toUpperCase() + order.status.slice(1)
      : "Completed",
    orderId: order.order_id || "N/A",
  };
};

// ─── GET /api/receipts/receipt/:transactionId ─────────────────────────
router.get("/receipt/:transactionId", verifyToken, async (req, res) => {
  try {
    const { transactionId } = req.params;
    const userId = req.userId;

    const result = await pool.query(
      `
      SELECT o.*, u.name, u.email, p.title, p.tiers, p.id as project_id,
             tier.name as tier_name
      FROM "Order" o
      LEFT JOIN "User" u ON o.user_id = u.id
      LEFT JOIN "Project" p ON o.project_id = p.id
      LEFT JOIN "Tier" tier ON o.tier_id = tier.id
      WHERE o.id = $1
    `,
      [transactionId],
    );

    if (result.rows.length === 0)
      return res.status(404).json({ error: "Not found" });

    const order = result.rows[0];

    if (order.user_id !== userId) {
      return res.status(403).json({
        error: "Forbidden - You can only view your own receipts",
        code: "USER_MISMATCH",
      });
    }

    const receiptData = generateReceiptData(
      order,
      { name: order.name, email: order.email },
      { title: order.title, id: order.project_id, tiers: order.tiers },
      order.tier_name,
    );

    res.json({ success: true, receipt: receiptData });
  } catch (err) {
    console.error("Receipt error:", err);
    res.status(500).json({ error: "Failed to fetch receipt" });
  }
});

// ─── GET /api/receipts/download-txt/:transactionId ───────────────────
router.get("/download-txt/:transactionId", verifyToken, async (req, res) => {
  try {
    const { transactionId } = req.params;
    const userId = req.userId;

    const result = await pool.query(
      `
      SELECT o.*, u.name, u.email, p.title, p.tiers, p.id as project_id,
             tier.name as tier_name
      FROM "Order" o
      LEFT JOIN "User" u ON o.user_id = u.id
      LEFT JOIN "Project" p ON o.project_id = p.id
      LEFT JOIN "Tier" tier ON o.tier_id = tier.id
      WHERE o.id = $1
    `,
      [transactionId],
    );

    if (result.rows.length === 0)
      return res.status(404).json({ error: "Not found" });

    const order = result.rows[0];

    if (order.user_id !== userId) {
      return res
        .status(403)
        .json({ error: "Forbidden - You can only download your own receipts" });
    }

    const receipt = generateReceiptData(
      order,
      { name: order.name, email: order.email },
      { title: order.title, id: order.project_id, tiers: order.tiers },
      order.tier_name,
    );

    const txt = `
╔════════════════════════════════════════════════════════════════╗
║                ${COMPANY_INFO.name.padEnd(46)}║
║                ${COMPANY_INFO.tagline.padEnd(46)}║
╠════════════════════════════════════════════════════════════════╣
║ Receipt Number: ${receipt.receiptNumber.padEnd(45)}║
║ Date: ${receipt.date.padEnd(57)}║
║ Time: ${receipt.time.padEnd(57)}║
╠════════════════════════════════════════════════════════════════╣
║ CUSTOMER INFORMATION                                             ║
║ Name: ${(order.name || "").padEnd(59)}║
║ Email: ${(order.email || "").padEnd(58)}║
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
    console.error("Download error:", err);
    res.status(500).json({ error: "Download failed" });
  }
});

export default router;
