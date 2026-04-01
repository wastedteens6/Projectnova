"use client";

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSession } from 'next-auth/react';
import { Rocket, Send, Sparkles, Code, Calendar, DollarSign, CheckCircle2, ArrowRight, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function CustomProjectPage() {
    const { data: session } = useSession();
    const router = useRouter();
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [techStack, setTechStack] = useState('');
    const [budget, setBudget] = useState('');
    const [deadline, setDeadline] = useState('');
    const [loading, setLoading] = useState(false);
    const [submitted, setSubmitted] = useState(false);
    const { toast } = useToast();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            const response = await fetch('/api/projects/custom', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    title,
                    description,
                    techStack: techStack.split(',').map(s => s.trim()).filter(Boolean),
                    budget,
                    deadline
                }),
            });

            const data = await response.json();

            if (data.success) {
                setSubmitted(true);
                toast({
                    title: "Success",
                    description: data.message || "Custom project request submitted successfully!",
                });
            } else {
                const isAdmin = session?.user?.role === 'ADMIN';
                console.error('[Custom Project Failed]', data.error, data.details);
                toast({
                    title: "Submission Failed",
                    description: data.error || "Failed to submit request",
                    variant: "destructive",
                });

                if (isAdmin && data.details) {
                    toast({
                        title: "[Admin Only] Error Details",
                        description: JSON.stringify(data.details).substring(0, 100) + '...',
                        variant: "destructive",
                    });
                }
            }
        } catch (error) {
            console.error('[Custom Project Error]', error);
            toast({
                title: "Error connecting to server",
                description: "Please check your network and try again.",
                variant: "destructive",
            });
        } finally {
            setLoading(false);
        }
    };

    if (submitted) {
        return (
            <div className="min-h-screen pt-32 pb-16 flex items-center justify-center px-4">
                <motion.div 
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="max-w-xl w-full text-center space-y-8 glass-card p-12 relative overflow-hidden"
                >
                    <div className="absolute top-0 right-0 p-4 opacity-10">
                        <Sparkles className="h-24 w-24" />
                    </div>
                    
                    <div className="flex justify-center">
                        <div className="h-20 w-20 rounded-full bg-emerald-500/20 flex items-center justify-center text-emerald-400">
                            <CheckCircle2 className="h-10 w-10" />
                        </div>
                    </div>
                    
                    <div className="space-y-4">
                        <h1 className="text-3xl font-bold gradient-text">Request Received!</h1>
                        <p className="text-muted-foreground text-lg leading-relaxed">
                            Thank you for reaching out. A dedicated developer from our team will review your requirements and contact you via email within <span className="text-emerald-400 font-semibold">24-48 hours</span> to discuss the details, timeline, and pricing.
                        </p>
                    </div>

                    <div className="pt-8 flex flex-col sm:flex-row gap-4 justify-center">
                        <Link href="/projects">
                            <Button variant="outline" className="w-full sm:w-auto h-12 px-8">
                                Back to All Projects
                            </Button>
                        </Link>
                        <Link href="/dashboard">
                            <Button variant="gradient" className="w-full sm:w-auto h-12 px-8">
                                Go to Dashboard
                                <ArrowRight className="ml-2 h-4 w-4" />
                            </Button>
                        </Link>
                    </div>
                </motion.div>
            </div>
        );
    }

    return (
        <div className="min-h-screen pt-32 pb-24 relative overflow-hidden">
            {/* Background orbs */}
            <div className="absolute top-0 left-1/4 w-96 h-96 bg-violet-600/10 rounded-full blur-[120px] pointer-events-none" />
            <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-blue-600/10 rounded-full blur-[120px] pointer-events-none" />

            <div className="container mx-auto px-4 max-w-4xl relative">
                <div className="flex flex-col md:flex-row gap-12 items-start text-left">
                    {/* Left: Info */}
                    <div className="flex-1 space-y-8">
                        <div>
                            <Badge variant="secondary" className="mb-4 px-3 py-1 text-xs uppercase tracking-widest text-violet-400 border-violet-500/20 bg-violet-500/10">
                                Custom Development
                            </Badge>
                            <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight mb-4 leading-tight">
                                Bring Your <span className="gradient-text">Dream Project</span> to Life.
                            </h1>
                            <p className="text-lg text-muted-foreground leading-relaxed">
                                Can't find what you're looking for? Our team of export engineers can build your custom defense-ready academic project from scratch.
                            </p>
                        </div>

                        <div className="space-y-6">
                            {[
                                { icon: Sparkles, title: "Tailored to You", desc: "Built specifically around your unique problem statement." },
                                { icon: Code, title: "Modern Tech", desc: "Choose your stack—MERN, AI/ML, Blockchain, or IoT." },
                                { icon: Send, title: "Direct Contact", desc: "Direct communication with the developer throughout the process." }
                            ].map((item, i) => (
                                <motion.div 
                                    key={i}
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: i * 0.1 }}
                                    className="flex gap-4 group"
                                >
                                    <div className="h-12 w-12 rounded-xl bg-violet-500/10 flex items-center justify-center text-violet-400 group-hover:bg-violet-500/20 transition-colors">
                                        <item.icon className="h-6 w-6" />
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-lg">{item.title}</h3>
                                        <p className="text-muted-foreground text-sm">{item.desc}</p>
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    </div>

                    {/* Right: Form */}
                    <div className="flex-1 w-full">
                        <motion.div 
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="glass-card p-8 md:p-10 relative"
                        >
                            <div className="absolute top-0 right-0 p-4 opacity-5">
                                <Rocket className="h-20 w-20" />
                            </div>

                            <form onSubmit={handleSubmit} className="space-y-6 relative">
                                <div className="space-y-2">
                                    <label className="text-sm font-semibold flex items-center gap-2">
                                        Project Title
                                        <span className="text-violet-500">*</span>
                                    </label>
                                    <Input 
                                        placeholder="e.g. AI-Powered Smart Agriculture System" 
                                        value={title}
                                        onChange={(e) => setTitle(e.target.value)}
                                        required
                                        className="h-12 bg-background/50 border-input font-medium focus-visible:ring-violet-500"
                                    />
                                </div>

                                <div className="space-y-2">
                                    <label className="text-sm font-semibold flex items-center gap-2">
                                        Requirements Detail
                                        <span className="text-violet-500">*</span>
                                    </label>
                                    <Textarea 
                                        placeholder="Describe the core modules, target users, and specific features you need..." 
                                        value={description}
                                        onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setDescription(e.target.value)}
                                        required
                                        className="min-h-[150px] bg-background/50 border-input focus-visible:ring-violet-500"
                                    />
                                </div>

                                <div className="space-y-2">
                                    <label className="text-sm font-semibold flex items-center gap-2">
                                        Tech Stack Preference
                                    </label>
                                    <Input 
                                        placeholder="React, Python, OpenCV, etc. (comma separated)" 
                                        value={techStack}
                                        onChange={(e) => setTechStack(e.target.value)}
                                        className="h-12 bg-background/50 border-input focus-visible:ring-violet-500"
                                    />
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <label className="text-sm font-semibold flex items-center gap-2">
                                            <DollarSign className="h-3.5 w-3.5 text-violet-400" />
                                            Estimated Budget
                                        </label>
                                        <Input 
                                            placeholder="e.g. ₹5,000 - ₹10,000" 
                                            value={budget}
                                            onChange={(e) => setBudget(e.target.value)}
                                            className="h-12 bg-background/50 border-input focus-visible:ring-violet-500"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm font-semibold flex items-center gap-2">
                                            <Calendar className="h-3.5 w-3.5 text-violet-400" />
                                            Target Deadline
                                        </label>
                                        <Input 
                                            type="date"
                                            value={deadline}
                                            onChange={(e) => setDeadline(e.target.value)}
                                            className="h-12 bg-background/50 border-input focus-visible:ring-violet-500"
                                        />
                                    </div>
                                </div>

                                <Button 
                                    className="w-full h-14 text-lg font-bold shadow-xl shadow-violet-500/10 hover:shadow-violet-500/20 active:scale-[0.98] transition-all"
                                    variant="gradient"
                                    disabled={loading}
                                >
                                    {loading ? (
                                        <>
                                            <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                                            Submitting Request...
                                        </>
                                    ) : (
                                        <>
                                            Submit Project Request
                                            <Send className="ml-2 h-5 w-5" />
                                        </>
                                    )}
                                </Button>

                                <p className="text-[10px] text-center text-muted-foreground uppercase tracking-widest mt-4">
                                    No upfront payment required until requirements are fixed.
                                </p>
                            </form>
                        </motion.div>
                    </div>
                </div>
            </div>
        </div>
    );
}
