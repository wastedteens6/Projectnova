"use client";

import { Bell, Info } from "lucide-react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function NotificationsPage() {
    return (
        <div className="space-y-8">
            <div className="flex flex-col gap-2">
                <h1 className="text-3xl font-black tracking-tight text-gray-900">
                    Notifications
                </h1>
                <p className="text-gray-500 font-medium">
                    Stay updated with your project progress and support tickets.
                </p>
            </div>

            <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="min-h-[400px] flex flex-col items-center justify-center bg-white border border-dashed border-gray-200 rounded-[32px] p-12 text-center"
            >
                <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mb-6">
                    <Bell className="h-8 w-8 text-gray-300" />
                </div>
                
                <h2 className="text-xl font-bold text-gray-900 mb-2">No notifications yet</h2>
                <p className="text-gray-500 max-w-sm mb-8 font-medium">
                    We'll notify you here when there's an update on your projects, 
                    messages from support, or new arrivals.
                </p>

                <div className="flex items-center gap-3">
                    <Link href="/projects">
                        <Button variant="outline" className="rounded-2xl font-bold px-6 border-gray-200">
                            Explore Projects
                        </Button>
                    </Link>
                    <Link href="/dashboard/support">
                        <Button className="bg-black hover:bg-gray-800 text-white rounded-2xl font-bold px-6 shadow-lg shadow-black/10">
                            Contact Support
                        </Button>
                    </Link>
                </div>
            </motion.div>

            <div className="bg-blue-50/50 border border-blue-100 rounded-3xl p-6 flex items-start gap-4">
                <div className="w-10 h-10 bg-blue-100 rounded-2xl flex items-center justify-center flex-shrink-0 text-blue-600">
                    <Info className="h-5 w-5" />
                </div>
                <div>
                    <h4 className="font-bold text-blue-900 mb-1">Notification Settings</h4>
                    <p className="text-sm text-blue-700/80 font-medium leading-relaxed">
                        You are currently receiving email notifications for all order updates. 
                        You can manage your notification preferences in your profile settings.
                    </p>
                </div>
            </div>
        </div>
    );
}
