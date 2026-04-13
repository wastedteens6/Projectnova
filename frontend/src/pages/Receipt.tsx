import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useTheme } from "../context/ThemeContext";
import axios from "axios";

interface ReceiptData {
  company: {
    name: string;
    tagline: string;
    email: string;
    phone: string;
    website: string;
    address: string;
    gst: string;
  };
  transactionId: string;
  receiptNumber: string;
  date: string;
  time: string;
  user: { name: string; email: string };
  project: { name: string; id: string };
  tier: string;
  amount: string;
  amountInPaise: number;
  gst: number;
  totalAmount: number;
  paymentMethod: string;
  status: string;
  orderId: string;
}

export default function Receipt() {
  const { transactionId } = useParams();
  const navigate = useNavigate();
  const { isDark } = useTheme();
  const [receiptData, setReceiptData] = useState<ReceiptData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchReceipt();
  }, [transactionId]);

  const fetchReceipt = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get(
        `${import.meta.env.VITE_API_URL}/receipts/receipt/${transactionId}`,
        {
          headers: {
            Authorization: `Bearer ${token || ""}`,
          },
        }
      );
      if (response.data.success) {
        setReceiptData(response.data.receipt);
      }
    } catch (err: any) {
      setError(err.response?.data?.error || "Failed to load receipt");
    } finally {
      setLoading(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const handleDownload = () => {
    // Use browser print functionality - user can save as PDF
    const printWindow = window.open("", "_blank");
    if (!printWindow) {
      alert("Please allow pop-ups to download receipt as PDF");
      return;
    }

    const receiptElement = document.getElementById("receipt-content");
    if (!receiptElement) {
      alert("Receipt content not found");
      return;
    }

    const receiptHTML = receiptElement.outerHTML;
    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Receipt-${receiptData?.receiptNumber}</title>
          <style>
            * { margin: 0; padding: 0; box-sizing: border-box; }
            body {
              font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
              background: #fff;
              padding: 20px;
            }
            @media print {
              body { padding: 0; }
              .no-print { display: none !important; }
            }
          </style>
        </head>
        <body>
          ${receiptHTML}
          <div class="no-print" style="text-align: center; margin-top: 20px; padding: 20px; background: #f3f4f6; border-radius: 8px;">
            <p style="font-size: 14px; color: #666;">Click "Save as PDF" in the print dialog to download this receipt</p>
          </div>
          <script>
            window.onload = () => {
              // Auto-open print dialog for PDF save
              window.print();
            };
          </script>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  if (loading) {
    return (
      <div
        className={`min-h-screen flex items-center justify-center ${
          isDark ? "bg-gray-900" : "bg-gray-50"
        }`}
      >
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div
        className={`min-h-screen flex items-center justify-center ${
          isDark ? "bg-gray-900" : "bg-gray-50"
        }`}
      >
        <div className="text-center">
          <p className={`text-lg mb-4 ${isDark ? "text-red-400" : "text-red-600"}`}>
            {error}
          </p>
          <button
            onClick={() => navigate("/dashboard")}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  if (!receiptData) return null;

  return (
    <div
      className={`min-h-screen py-8 px-4 ${
        isDark ? "bg-gray-900" : "bg-gradient-to-br from-gray-50 to-gray-100"
      }`}
    >
      {/* Header with Navigation */}
      <div className="max-w-4xl mx-auto mb-6 flex items-center justify-between">
        <button
          onClick={() => navigate("/dashboard")}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg transition ${
            isDark
              ? "bg-gray-800 hover:bg-gray-700 text-gray-200"
              : "bg-white hover:bg-gray-100 text-gray-700"
          }`}
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M19 12H5M12 19l-7-7 7-7"/>
          </svg>
          Back to Dashboard
        </button>
        <div className="flex gap-2 print:hidden">
          <button
            onClick={handlePrint}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="6 9 6 2 18 2 18 9"></polyline>
              <path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"></path>
              <rect x="6" y="14" width="12" height="8"></rect>
            </svg>
            Print
          </button>
          <button
            onClick={handleDownload}
            className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
              <polyline points="7 10 12 15 17 10"></polyline>
              <line x1="12" y1="15" x2="12" y2="3"></line>
            </svg>
            Download
          </button>
        </div>
      </div>

      {/* Receipt Container */}
      <div className="max-w-4xl mx-auto">
        <div
          id="receipt-content"
          className={`rounded-2xl shadow-2xl overflow-hidden ${
            isDark ? "bg-gray-800" : "bg-white"
          }`}
        >
          {/* Receipt Content */}
          <div className={`p-8 ${isDark ? "text-gray-100" : "text-gray-900"}`}>
            {/* Success Header */}
            <div className="text-center mb-8">
              <div className="inline-block mb-4 p-4 bg-gradient-to-br from-green-400 to-green-600 rounded-full">
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="20 6 9 17 4 12"></polyline>
                </svg>
              </div>
              <h1 className="text-3xl font-bold mb-2">Payment Successful!</h1>
              <p className={`${isDark ? "text-gray-400" : "text-gray-600"}`}>
                Thank you for your purchase
              </p>
            </div>

            <hr className={`my-8 ${isDark ? "border-gray-700" : "border-gray-200"}`} />

            {/* Company Header */}
            <div className="text-center mb-8">
              <h2 className="text-4xl font-bold mb-2 bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                {receiptData.company.name}
              </h2>
              <p className={`text-sm mb-4 ${isDark ? "text-gray-400" : "text-gray-600"}`}>
                {receiptData.company.tagline}
              </p>
              <div
                className={`flex items-center justify-center gap-4 text-sm ${
                  isDark ? "text-gray-400" : "text-gray-600"
                }`}
              >
                <span>{receiptData.company.email}</span>
                <span>•</span>
                <span>{receiptData.company.phone}</span>
              </div>
            </div>

            <hr className={`my-8 ${isDark ? "border-gray-700" : "border-gray-200"}`} />

            {/* Receipt Details Grid */}
            <div className="grid md:grid-cols-2 gap-8 mb-8">
              {/* Left Column */}
              <div>
                <h3 className={`text-lg font-semibold mb-4 ${isDark ? "text-blue-400" : "text-blue-600"}`}>
                  Receipt Information
                </h3>
                <div className="space-y-3">
                  <div>
                    <p className={`text-sm ${isDark ? "text-gray-400" : "text-gray-600"}`}>
                      Receipt Number
                    </p>
                    <p className="text-lg font-mono font-bold text-purple-600">
                      {receiptData.receiptNumber}
                    </p>
                  </div>
                  <div>
                    <p className={`text-sm ${isDark ? "text-gray-400" : "text-gray-600"}`}>
                      Date
                    </p>
                    <p className="font-semibold">{receiptData.date}</p>
                  </div>
                  <div>
                    <p className={`text-sm ${isDark ? "text-gray-400" : "text-gray-600"}`}>
                      Time
                    </p>
                    <p className="font-semibold">{receiptData.time}</p>
                  </div>
                  <div>
                    <p className={`text-sm ${isDark ? "text-gray-400" : "text-gray-600"}`}>
                      Status
                    </p>
                    <p className="inline-block px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-semibold">
                      {receiptData.status}
                    </p>
                  </div>
                </div>
              </div>

              {/* Right Column */}
              <div>
                <h3 className={`text-lg font-semibold mb-4 ${isDark ? "text-blue-400" : "text-blue-600"}`}>
                  Customer Information
                </h3>
                <div className="space-y-3">
                  <div>
                    <p className={`text-sm ${isDark ? "text-gray-400" : "text-gray-600"}`}>
                      Name
                    </p>
                    <p className="font-semibold">{receiptData.user.name}</p>
                  </div>
                  <div>
                    <p className={`text-sm ${isDark ? "text-gray-400" : "text-gray-600"}`}>
                      Email
                    </p>
                    <p className="font-semibold break-all">{receiptData.user.email}</p>
                  </div>
                </div>
              </div>
            </div>

            <hr className={`my-8 ${isDark ? "border-gray-700" : "border-gray-200"}`} />

            {/* Project Details */}
            <div className="mb-8">
              <h3 className={`text-lg font-semibold mb-4 ${isDark ? "text-blue-400" : "text-blue-600"}`}>
                Project Details
              </h3>
              <div className={`p-4 rounded-lg ${isDark ? "bg-gray-700" : "bg-gray-50"}`}>
                <div className="grid md:grid-cols-3 gap-4">
                  <div>
                    <p className={`text-sm ${isDark ? "text-gray-400" : "text-gray-600"}`}>
                      Project
                    </p>
                    <p className="font-semibold">{receiptData.project.name}</p>
                  </div>
                  <div>
                    <p className={`text-sm ${isDark ? "text-gray-400" : "text-gray-600"}`}>
                      Package
                    </p>
                    <p className="font-semibold">{receiptData.tier}</p>
                  </div>
                  <div>
                    <p className={`text-sm ${isDark ? "text-gray-400" : "text-gray-600"}`}>
                      Order ID
                    </p>
                    <p className="font-mono text-sm font-semibold break-all">
                      {receiptData.orderId}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Payment Summary */}
            <div className={`rounded-lg p-6 mb-8 gradient-primary ${
              isDark
                ? "bg-gradient-to-r from-blue-900 to-purple-900"
                : "bg-gradient-to-r from-blue-50 to-purple-50"
            }`}>
              <h3 className={`text-lg font-semibold mb-4 ${isDark ? "text-blue-300" : "text-blue-900"}`}>
                Payment Summary
              </h3>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className={`${isDark ? "text-gray-300" : "text-gray-700"}`}>
                    Subtotal
                  </span>
                  <span className="font-semibold">
                    ₹{(receiptData.amountInPaise / 100).toFixed(2)}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className={`${isDark ? "text-gray-300" : "text-gray-700"}`}>
                    GST (18%)
                  </span>
                  <span className="font-semibold">
                    ₹{(receiptData.gst / 100).toFixed(2)}
                  </span>
                </div>
                <hr
                  className={`${isDark ? "border-gray-600" : "border-gray-300"}`}
                />
                <div className="flex justify-between items-center text-lg">
                  <span className="font-bold">Total Amount</span>
                  <span className="font-bold text-xl bg-gradient-to-r from-green-400 to-green-600 bg-clip-text text-transparent">
                    ₹{(receiptData.totalAmount / 100).toFixed(2)}
                  </span>
                </div>
              </div>
            </div>

            {/* Payment Method & Company Info */}
            <div className="grid md:grid-cols-2 gap-6 mb-8">
              <div>
                <h4 className={`font-semibold mb-2 ${isDark ? "text-gray-300" : "text-gray-700"}`}>
                  Payment Method
                </h4>
                <p className="text-lg font-semibold text-blue-600">
                  {receiptData.paymentMethod}
                </p>
              </div>
              <div>
                <h4 className={`font-semibold mb-2 ${isDark ? "text-gray-300" : "text-gray-700"}`}>
                  Company GST
                </h4>
                <p className="font-mono text-sm">
                  {receiptData.company.gst}
                </p>
              </div>
            </div>

            <hr className={`my-8 ${isDark ? "border-gray-700" : "border-gray-200"}`} />

            {/* Footer */}
            <div className="text-center">
              <p className={`text-sm mb-2 ${isDark ? "text-gray-400" : "text-gray-600"}`}>
                {receiptData.company.website} | {receiptData.company.address}
              </p>
              <p className={`text-xs ${isDark ? "text-gray-500" : "text-gray-500"}`}>
                This is an automated receipt. Please retain for your records.
              </p>
              <p className={`text-xs mt-2 ${isDark ? "text-gray-500" : "text-gray-500"}`}>
                Thank you for supporting {receiptData.company.name}!
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Print Styles */}
      <style>{`
        @media print {
          body {
            background: white;
          }
          .print\\:hidden {
            display: none !important;
          }
        }
      `}</style>
    </div>
  );
}
