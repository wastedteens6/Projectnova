"use client";

import { Check, Zap, Shield, Star, Rocket, HelpCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { motion } from "framer-motion";
import Link from "next/link";

const pricingTiers = [
    {
        level: 1,
        name: "Level 1 - Code Only",
        description: "Perfect for students who want to build the logic themselves.",
        price: "399+",
        features: [
            "Full Source Code (Clean & Commented)",
            "Database Schema (SQL/Prisma)",
            "Installation Guide",
            "ReadMe Markdown",
            "Basic Tech Stack Support"
        ],
        icon: <Rocket className="h-6 w-6 text-blue-400" />,
        gradient: "from-blue-500/10 to-transparent",
        buttonVariant: "outline" as const,
    },
    {
        level: 2,
        name: "Level 2 - Code + Guide",
        description: "Everything you need to understand and present the project.",
        price: "999+",
        popular: true,
        features: [
            "Everything in Level 1",
            "Detailed Video Tutorials",
            "Architecture Diagram",
            "Module-wise Breakdown",
            "Viva Q&A Document",
            "Project Report Template"
        ],
        icon: <Star className="h-6 w-6 text-violet-400" />,
        gradient: "from-violet-500/20 via-violet-500/5 to-transparent",
        buttonVariant: "gradient" as const,
    },
    {
        level: 3,
        name: "Level 3 - Full Support",
        description: "Maximum support for a stress-free final year project.",
        price: "1999+",
        features: [
            "Everything in Level 2",
            "One-on-One Session (30 mins)",
            "Deployment Support (Local/Cloud)",
            "Custom Feature Tweak (Small)",
            "Priority Support Access",
            "Lifetime Updates"
        ],
        icon: <Shield className="h-6 w-6 text-emerald-400" />,
        gradient: "from-emerald-500/10 to-transparent",
        buttonVariant: "outline" as const,
    }
];

export default function PricingPage() {
    return (
        <div className="min-h-screen bg-background pt-24 pb-16 px-4 sm:px-6 lg:px-8">
            <div className="max-w-7xl mx-auto">
                {/* Header Section */}
                <div className="text-center space-y-4 mb-16">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5 }}
                    >
                        <Badge variant="outline" className="px-4 py-1 text-violet-400 border-violet-500/20 bg-violet-500/5 backdrop-blur-sm mb-4">
                            Transparent Pricing
                        </Badge>
                        <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight gradient-text pb-2">
                            Choose Your Mastery Level
                        </h1>
                        <p className="text-xl text-muted-foreground max-w-2xl mx-auto mt-4">
                            Flexible plans designed for every student. From raw code to full one-on-one mentorship, we've got you covered.
                        </p>
                    </motion.div>
                </div>

                {/* Pricing Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {pricingTiers.map((tier, index) => (
                        <motion.div
                            key={tier.level}
                            initial={{ opacity: 0, scale: 0.95, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            transition={{ duration: 0.5, delay: index * 0.1 }}
                        >
                            <Card className={`relative h-full glass-card border-border/50 hover:border-violet-500/30 transition-all duration-300 group overflow-hidden ${tier.popular ? 'ring-2 ring-violet-500/50' : ''}`}>
                                {/* Gradient Background */}
                                <div className={`absolute inset-0 bg-gradient-to-b ${tier.gradient} opacity-50`} />
                                
                                {tier.popular && (
                                    <div className="absolute top-0 right-0">
                                        <div className="bg-violet-600 text-white text-[10px] uppercase font-bold px-3 py-1 rounded-bl-lg tracking-wider animate-pulse">
                                            Most Popular
                                        </div>
                                    </div>
                                )}

                                <CardHeader className="relative pt-8">
                                    <div className="w-12 h-12 rounded-xl bg-background/50 border border-border/50 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                                        {tier.icon}
                                    </div>
                                    <Badge variant="outline" className="w-fit mb-2 text-[10px] uppercase tracking-widest text-muted-foreground border-border/50">
                                        Level {tier.level}
                                    </Badge>
                                    <CardTitle className="text-2xl font-bold">{tier.name}</CardTitle>
                                    <div className="mt-4 flex items-baseline gap-1">
                                        <span className="text-sm text-muted-foreground mr-1">Starting from</span>
                                        <span className="text-4xl font-extrabold tracking-tight">₹{tier.price}</span>
                                    </div>
                                    <p className="text-sm text-muted-foreground mt-4 leading-relaxed">
                                        {tier.description}
                                    </p>
                                </CardHeader>

                                <CardContent className="relative flex-grow">
                                    <div className="space-y-4 pt-4 border-t border-border/50">
                                        {tier.features.map((feature, fIndex) => (
                                            <div key={fIndex} className="flex items-start gap-3 text-sm">
                                                <div className="h-5 w-5 rounded-full bg-violet-500/10 flex items-center justify-center shrink-0 mt-0.5">
                                                    <Check className="h-3 w-3 text-violet-400" />
                                                </div>
                                                <span className="text-muted-foreground group-hover:text-foreground transition-colors">
                                                    {feature}
                                                </span>
                                            </div>
                                        ))}
                                    </div>
                                </CardContent>

                                <CardFooter className="relative pb-8 pt-4">
                                    <Link href="/projects" className="w-full">
                                        <Button 
                                            variant={tier.buttonVariant} 
                                            className="w-full h-12 font-bold shadow-lg shadow-black/20 group-hover:shadow-violet-500/20 transition-all active:scale-[0.98]"
                                        >
                                            Browse Projects
                                            <Zap className="ml-2 h-4 w-4" />
                                        </Button>
                                    </Link>
                                </CardFooter>
                            </Card>
                        </motion.div>
                    ))}
                </div>

                {/* FAQ / Info Section */}
                <motion.div 
                    initial={{ opacity: 0 }}
                    whileInView={{ opacity: 1 }}
                    transition={{ duration: 1 }}
                    className="mt-24 max-w-3xl mx-auto text-center space-y-8"
                >
                    <div className="h-px w-full bg-gradient-to-r from-transparent via-border to-transparent" />
                    <div className="flex items-center justify-center gap-2 text-violet-400">
                        <HelpCircle className="h-5 w-5" />
                        <h2 className="text-xl font-bold">Frequently Asked Questions</h2>
                    </div>
                    <div className="grid gap-6 text-left">
                        <div className="p-6 rounded-2xl bg-muted/20 border border-border/50">
                            <h3 className="font-bold mb-2">Can I upgrade my level later?</h3>
                            <p className="text-sm text-muted-foreground">Yes! You can upgrade from Level 1 to 2 or 3 anytime. You'll only need to pay the difference amount plus a small processing fee.</p>
                        </div>
                        <div className="p-6 rounded-2xl bg-muted/20 border border-border/50">
                            <h3 className="font-bold mb-2">How is the support provided in Level 3?</h3>
                            <p className="text-sm text-muted-foreground">Support is provided via Google Meet or Zoom for one-on-one sessions, and via our priority support ticket system for technical issues.</p>
                        </div>
                    </div>
                </motion.div>
            </div>
        </div>
    );
}
