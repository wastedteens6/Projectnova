"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { 
  ArrowRight, 
  DollarSign, 
  ShoppingBag, 
  Users, 
  Package,
  type LucideIcon 
} from "lucide-react";

interface StatItem {
  label: string;
  value: string | number;
  icon: string; // Pass icon name as string for serialization
  color: string;
  bg: string;
  href: string;
}

const IconMap: Record<string, LucideIcon> = {
  "dollar-sign": DollarSign,
  "shopping-bag": ShoppingBag,
  "users": Users,
  "package": Package,
};

interface DashboardStatsProps {
  stats: StatItem[];
}

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
};

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 }
};

export function DashboardStats({ stats }: DashboardStatsProps) {
  return (
    <motion.div 
      variants={container}
      initial="hidden"
      animate="show"
      className="grid grid-cols-2 lg:grid-cols-4 gap-4"
    >
      {stats.map((stat) => {
        const Icon = IconMap[stat.icon] || Package;
        return (
          <motion.div key={stat.label} variants={item}>
            <Link
              href={stat.href}
              className="group block admin-card p-6 h-full relative overflow-hidden"
            >
              {/* Background Accent */}
              <div className={`absolute top-0 right-0 w-24 h-24 ${stat.bg} blur-3xl opacity-20 -mr-8 -mt-8 transition-transform group-hover:scale-150 duration-700`} />
              
              <div className="flex items-center justify-between mb-4 relative z-10">
                <div className={`rounded-2xl p-3 ${stat.bg} ring-1 ring-inset ring-white/10 shadow-sm transition-transform group-hover:scale-110 duration-300`}>
                  <Icon className={`h-6 w-6 ${stat.color}`} />
                </div>
                <div className="w-8 h-8 rounded-full bg-gray-50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 translate-x-4 group-hover:translate-x-0">
                  <ArrowRight className="h-4 w-4 text-gray-400 group-hover:text-black transition-colors" />
                </div>
              </div>
              
              <div className="relative z-10">
                <div className="text-3xl font-black tracking-tight text-gray-900 mb-1">{stat.value}</div>
                <div className="text-sm font-bold text-gray-500 uppercase tracking-wider">{stat.label}</div>
              </div>
            </Link>
          </motion.div>
        );
      })}
    </motion.div>
  );
}
