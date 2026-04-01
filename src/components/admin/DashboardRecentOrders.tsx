"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { ArrowRight, ShoppingCart } from "lucide-react";

interface RecentOrder {
  id: string;
  totalAmount: number;
  status: string;
  user: { name: string | null; email: string };
  items: { project: { title: string } }[];
}

interface DashboardRecentOrdersProps {
  orders: RecentOrder[];
}

export function DashboardRecentOrders({ orders }: DashboardRecentOrdersProps) {
  return (
    <motion.div 
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.5, delay: 0.2 }}
      className="admin-card p-6 h-full flex flex-col"
    >
      <div className="flex flex-row items-center justify-between mb-8">
        <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-orange-500/10 flex items-center justify-center text-orange-500">
                <ShoppingCart className="h-5 w-5" />
            </div>
            <h3 className="text-xl font-black text-gray-900">Recent Orders</h3>
        </div>
        <Link href="/admin/orders" className="text-sm font-bold text-orange-500 hover:text-orange-600 flex items-center gap-1 group">
          View all <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
        </Link>
      </div>

      <div className="space-y-4 flex-grow">
        {orders.map((order, idx) => (
          <motion.div
            key={order.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 + idx * 0.05 }}
            className="flex items-center justify-between p-4 rounded-2xl bg-gray-50/50 hover:bg-white border border-transparent hover:border-gray-100 hover:shadow-sm transition-all group"
          >
            <div className="min-w-0 pr-4">
              <p className="font-black text-gray-900 truncate">
                {order.user.name || order.user.email}
              </p>
              <p className="text-xs font-bold text-gray-500 truncate mt-0.5">
                {order.items.map((i) => i.project.title).join(', ')}
              </p>
            </div>
            <div className="text-right flex-shrink-0">
              <p className="font-black text-gray-900">₹{order.totalAmount.toLocaleString('en-IN')}</p>
              <span className={`inline-block text-[10px] px-2 py-0.5 rounded-full font-black uppercase mt-1 ${
                order.status === 'PAID'
                  ? 'bg-green-100 text-green-700'
                  : 'bg-yellow-100 text-yellow-700'
              }`}>
                {order.status}
              </span>
            </div>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
}
