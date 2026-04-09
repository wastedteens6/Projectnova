import express from "express";
import { pool } from "../config/database.js";

const router = express.Router();

const generateReceiptData = (transaction, user, project) => {
  const tierLevel = parseInt(transaction.items?.tier || 1);
  const tierInfo = project.tiers?.find(t => t.level === tierLevel) || { name: `Tier ${tierLevel}`, price: 0 };
  
  return {
    transactionId: transaction.id,
    receiptNumber: `RCP-${transaction.id.toString().substring(0, 8).toUpperCase()}`,
    date: new Date(transaction.created_at).toLocaleDateString("en-IN"),
    time: new Date(transaction.created_at).toLocaleTimeString("en-IN"),
    user: { name: user.name, email: user.email },
    project: { name: project.title, id: project.id },
    tier: tierInfo.name,
    amount: `₹${transaction.amount_in_paise / 100}`,
    amountInPaise: transaction.amount_in_paise,
    paymentMethod: transaction.payment_info?.provider || "Razorpay",
    status: transaction.status,
    orderId: transaction.payment_info?.orderId || "N/A",
  };
};

router.get("/receipt/:transactionId", async (req, res) => {
  try {
    const { transactionId } = req.params;
    const { userId } = req.query;

    const result = await pool.query(`
      SELECT t.*, u.name, u.email, p.title, p.tiers, p.id as project_id
      FROM "Transaction" t
      LEFT JOIN "User" u ON t.user_id = u.id
      LEFT JOIN "Project" p ON (t.items->>'projectId')::uuid = p.id
      WHERE t.id = $1
    `, [transactionId]);

    if (result.rows.length === 0) return res.status(404).json({ error: "Not found" });
    const trans = result.rows[0];

    const receiptData = generateReceiptData(
      trans,
      { name: trans.name, email: trans.email },
      { title: trans.title, id: trans.project_id, tiers: trans.tiers }
    );

    res.json({ success: true, receipt: receiptData });
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch receipt" });
  }
});

router.get("/download-txt/:transactionId", async (req, res) => {
  try {
    const { transactionId } = req.params;
    const result = await pool.query(`
      SELECT t.*, u.name, u.email, p.title, p.tiers, p.id as project_id
      FROM "Transaction" t
      LEFT JOIN "User" u ON t.user_id = u.id
      LEFT JOIN "Project" p ON (t.items->>'projectId')::uuid = p.id
      WHERE t.id = $1
    `, [transactionId]);

    if (result.rows.length === 0) return res.status(404).json({ error: "Not found" });
    const trans = result.rows[0];
    const receipt = generateReceiptData(trans, trans, { title: trans.title, id: trans.project_id, tiers: trans.tiers });

    const txt = `
RECEIPT: ${receipt.receiptNumber}
Project: ${receipt.project.name}
Amount: ${receipt.amount}
Date: ${receipt.date}
Status: ${receipt.status}
    `;
    res.setHeader("Content-Type", "text/plain");
    res.send(txt);
  } catch (err) {
    res.status(500).json({ error: "Download failed" });
  }
});

export default router;
