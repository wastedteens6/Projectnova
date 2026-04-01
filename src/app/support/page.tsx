"use client";

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { Mail, MessageSquare, Send, Phone, MapPin } from "lucide-react";
import { motion } from "framer-motion";

export default function SupportPage() {
    const [isLoading, setIsLoading] = useState(false);
    const { toast } = useToast();
    const [formData, setFormData] = useState({
        name: "",
        email: "",
        subject: "",
        message: "",
    });

    const searchParams = useSearchParams();
    const intent = searchParams.get("intent");

    useEffect(() => {
        if (intent === "project-brief") {
            setFormData(prev => ({ ...prev, subject: "Project Brief Submission" }));
        }
    }, [intent]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);

        try {
            const response = await fetch("/api/contact", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(formData),
            });

            const data = await response.json();

            if (response.ok) {
                toast({
                    title: "Message Sent",
                    description: data.message,
                });
                setFormData({ name: "", email: "", subject: "", message: "" });
            } else {
                throw new Error(data.error || "Something went wrong");
            }
        } catch (error: any) {
            toast({
                title: "Error",
                description: error.message,
                variant: "destructive",
            });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-white pt-32 pb-20">
            <div className="container mx-auto px-4 max-w-6xl">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
                    {/* Left Side: Contact Info */}
                    <motion.div 
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="space-y-8"
                    >
                        <div>
                            <h1 className="text-4xl md:text-5xl font-black tracking-tight text-gray-900 mb-6">
                                Contact <span className="text-pink-500">Support</span>
                            </h1>
                            <p className="text-lg text-gray-600 font-medium leading-relaxed">
                                Have questions about a project or need technical assistance? 
                                Our team of experts is here to help you succeed in your academics.
                            </p>
                        </div>

                        <div className="space-y-6">
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 bg-pink-50 rounded-2xl flex items-center justify-center text-pink-500">
                                    <Mail className="h-6 w-6" />
                                </div>
                                <div>
                                    <h3 className="font-bold text-gray-900">Email Us</h3>
                                    <p className="text-gray-500 text-sm font-medium">support@projectnova.com</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 bg-blue-50 rounded-2xl flex items-center justify-center text-blue-500">
                                    <MessageSquare className="h-6 w-6" />
                                </div>
                                <div>
                                    <h3 className="font-bold text-gray-900">Live Chat</h3>
                                    <p className="text-gray-500 text-sm font-medium">Available Mon-Fri, 9am-6pm</p>
                                </div>
                            </div>
                        </div>

                        <div className="pt-8 border-t border-gray-100">
                            <div className="p-6 bg-gray-50 rounded-3xl">
                                <h4 className="font-bold text-gray-900 mb-2">Office Hours</h4>
                                <p className="text-sm text-gray-500 font-medium">
                                    Our typical response time is within 2-4 business hours. 
                                    For urgent project delivery issues, please use the live chat.
                                </p>
                            </div>
                        </div>
                    </motion.div>

                    {/* Right Side: Form */}
                    <motion.div 
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="bg-white p-8 md:p-10 rounded-[40px] border border-gray-100 shadow-2xl shadow-gray-200/50"
                    >
                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className="text-sm font-bold text-gray-700 ml-1">Your Name</label>
                                    <Input 
                                        required
                                        placeholder="John Doe"
                                        value={formData.name}
                                        onChange={(e) => setFormData({...formData, name: e.target.value})}
                                        className="h-12 bg-gray-50 border-none rounded-2xl px-4 font-medium"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-bold text-gray-700 ml-1">Email Address</label>
                                    <Input 
                                        required
                                        type="email"
                                        placeholder="john@example.com"
                                        value={formData.email}
                                        onChange={(e) => setFormData({...formData, email: e.target.value})}
                                        className="h-12 bg-gray-50 border-none rounded-2xl px-4 font-medium"
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-bold text-gray-700 ml-1">Subject</label>
                                <Input 
                                    required
                                    placeholder="Project Customization Request"
                                    value={formData.subject}
                                    onChange={(e) => setFormData({...formData, subject: e.target.value})}
                                    className="h-12 bg-gray-50 border-none rounded-2xl px-4 font-medium"
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-bold text-gray-700 ml-1">Message</label>
                                <Textarea 
                                    required
                                    placeholder="Tell us what you need help with..."
                                    rows={5}
                                    value={formData.message}
                                    onChange={(e) => setFormData({...formData, message: e.target.value})}
                                    className="bg-gray-50 border-none rounded-3xl p-4 font-medium resize-none"
                                />
                            </div>

                            <Button 
                                type="submit" 
                                disabled={isLoading}
                                className="w-full h-14 bg-black hover:bg-gray-800 text-white rounded-2xl font-bold flex items-center justify-center gap-2 transition-all shadow-lg shadow-black/10"
                            >
                                {isLoading ? "Sending..." : "Send Message"}
                                <Send className="h-4 w-4" />
                            </Button>
                        </form>
                    </motion.div>
                </div>
            </div>
        </div>
    );
}
