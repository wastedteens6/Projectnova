"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { ArrowRight, Eye, LayoutGrid } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface TopProject {
  id: string;
  title: string;
  views: number;
  isPublished: boolean;
}

interface DashboardTopProjectsProps {
  projects: TopProject[];
}

export function DashboardTopProjects({ projects }: DashboardTopProjectsProps) {
  return (
    <motion.div 
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.5, delay: 0.4 }}
      className="admin-card p-6 h-full flex flex-col"
    >
      <div className="flex flex-row items-center justify-between mb-8">
        <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-pink-500/10 flex items-center justify-center text-pink-500">
                <LayoutGrid className="h-5 w-5" />
            </div>
            <h3 className="text-xl font-black text-gray-900">Top Projects</h3>
        </div>
        <Link href="/admin/projects" className="text-sm font-bold text-pink-500 hover:text-pink-600 flex items-center gap-1 group">
          Manage <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
        </Link>
      </div>

      <div className="space-y-4 flex-grow">
        {projects.map((project, i) => (
          <motion.div 
            key={project.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 + i * 0.05 }}
            className="flex items-center gap-4 p-3 rounded-2xl hover:bg-gray-50/50 transition-colors group"
          >
            <div className="w-8 h-8 rounded-xl bg-gray-50 flex items-center justify-center text-xs font-black text-gray-400 group-hover:text-black group-hover:bg-white transition-all">
              {i + 1}
            </div>
            
            <div className="flex-1 min-w-0">
              <p className="text-sm font-black text-gray-900 truncate group-hover:text-pink-500 transition-colors">{project.title}</p>
              <div className="flex items-center gap-1 text-[11px] font-bold text-gray-500 mt-0.5">
                <Eye className="h-3 w-3" />
                {project.views.toLocaleString()} views
              </div>
            </div>
            
            <Badge className={`text-[9px] font-black uppercase px-2 py-0 border-none rounded-full flex-shrink-0 ${
                project.isPublished
                  ? 'bg-green-100 text-green-700'
                  : 'bg-gray-100 text-gray-600'
              }`}>
              {project.isPublished ? 'Live' : 'Draft'}
            </Badge>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
}
