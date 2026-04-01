"use client";

import { motion } from "framer-motion";
import { Book, Code, FileText, Search, ExternalLink } from "lucide-react";
import { Input } from "@/components/ui/input";
import Link from "next/link";

export default function DocsPage() {
    return (
        <div className="min-h-screen bg-white pt-32 pb-20">
            <div className="container mx-auto px-4 max-w-5xl">
                <div className="text-center mb-16">
                    <motion.h1 
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-4xl md:text-6xl font-black tracking-tight text-gray-900 mb-6"
                    >
                        Project <span className="text-pink-500">Documentation</span>
                    </motion.h1>
                    <p className="text-lg text-gray-600 font-medium max-w-2xl mx-auto">
                        Everything you need to know about setting up, customizing, and running our projects.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
                    {[
                        { icon: Book, title: "Getting Started", desc: "Basic setup and environment configuration." },
                        { icon: Code, title: "Customization", desc: "How to tailor projects to your specific needs." },
                        { icon: FileText, title: "Reports & PPTs", desc: "Documentation standards and report templates." },
                    ].map((item) => (
                        <div key={item.title} className="p-8 bg-gray-50 rounded-[32px] hover:bg-pink-50 transition-colors group">
                            <item.icon className="h-8 w-8 text-black mb-4 group-hover:text-pink-500 transition-colors" />
                            <h3 className="text-xl font-bold text-gray-900 mb-2">{item.title}</h3>
                            <p className="text-gray-500 font-medium text-sm leading-relaxed">{item.desc}</p>
                        </div>
                    ))}
                </div>

                <div className="bg-gray-900 rounded-[40px] p-8 md:p-12 text-white relative overflow-hidden">
                    <div className="relative z-10 max-w-2xl">
                        <h2 className="text-3xl font-bold mb-4">Can't find what you're looking for?</h2>
                        <p className="text-gray-400 font-medium mb-8">
                            Our technical team is available to help you with any issues related to project setup or deployment.
                        </p>
                        <Link href="/support">
                            <button className="px-8 py-4 bg-white text-black rounded-full font-bold hover:bg-pink-500 hover:text-white transition-all">
                                Contact Support
                            </button>
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
}
