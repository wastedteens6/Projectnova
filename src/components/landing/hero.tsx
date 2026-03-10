"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowRight, CheckCircle, Sparkles, Users, Package, TrendingUp } from "lucide-react";
import { motion } from "framer-motion";
import Aurora from "@/components/animations/Aurora";
import DecryptedText from "@/components/animations/DecryptedText";
import ShinyText from "@/components/animations/ShinyText";

const stats = [
    { value: "5,000+", label: "Students Helped", icon: Users, change: "+24% this month" },
    { value: "200+", label: "Premium Projects", icon: Package, change: "Across 10 domains" },
    { value: "98%", label: "Success Rate", icon: TrendingUp, change: "In project defenses" },
];

const features = [
    "Instant Download",
    "Complete Source Code",
    "Viva Q&A Included",
    "7-Day Money Back",
];

export function Hero() {
    return (
        <section className="relative min-h-[85vh] flex items-center justify-center overflow-hidden pt-16">
            {/* Background */}
            <div className="absolute inset-0 z-0">
                <Aurora 
                    colorStops={["#1e1b4b", "#4c1d95", "#1e1b4b"]}
                    blend={0.5}
                    amplitude={1.0}
                    speed={0.5}
                />
            </div>
            
            <div className="absolute inset-0 z-0">
                <div className="orb orb-purple w-[700px] h-[700px] -top-48 -left-48 opacity-40" />
                <div className="orb orb-indigo w-[600px] h-[600px] -bottom-32 -right-32 opacity-30" />
            </div>

            {/* Mesh overlay */}
            <div className="absolute inset-0 mesh-grid opacity-20 pointer-events-none" />
            
            {/* Radial vignette */}
            <div className="absolute inset-0 bg-radial-gradient pointer-events-none" style={{ background: 'radial-gradient(ellipse 80% 60% at 50% 0%, rgba(139,92,246,0.12) 0%, transparent 70%)' }} />

            <div className="container relative z-10 px-4 sm:px-6 py-16 sm:py-20 text-center">
                <div className="max-w-5xl mx-auto space-y-8">

                    {/* Eyebrow badge */}
                    <motion.div
                        initial={{ opacity: 0, y: 16 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, ease: "easeOut" }}
                    >
                        <div className="badge-pill inline-flex">
                            <Sparkles className="h-3.5 w-3.5" />
                            <ShinyText 
                                text="India's #1 Academic Project Marketplace"
                                speed={3}
                                shineColor="#c4b5fd"
                            />
                        </div>
                    </motion.div>

                    {/* Headline */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6, delay: 0.1, ease: "easeOut" }}
                        className="space-y-4"
                    >
                        <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold leading-[1.1] tracking-tight">
                            <DecryptedText 
                                text="Defense-Ready"
                                animateOn="view"
                                revealDirection="center"
                                sequential
                                className="inline"
                            />
                            <br />
                            <span className="gradient-text">
                                <DecryptedText 
                                    text="Software Projects"
                                    animateOn="view"
                                    revealDirection="center"
                                    sequential
                                    className="gradient-text"
                                />
                            </span>
                        </h1>
                        <p className="text-base sm:text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed font-light">
                            Premium academic projects with complete source code, video tutorials,
                            documentation &amp; viva Q&amp;A. Built to help you ace your project defense.
                        </p>
                    </motion.div>

                    {/* CTA group */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: 0.25, ease: "easeOut" }}
                        className="flex flex-col sm:flex-row gap-3 justify-center items-center"
                    >
                        <Link href="/projects">
                            <Button size="lg" variant="gradient" className="group shine h-11 px-6 text-sm font-semibold shadow-lg shadow-violet-500/25">
                                Browse Projects
                                <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-0.5 transition-transform duration-200" />
                            </Button>
                        </Link>
                        <Link href="/auth/register">
                            <Button size="lg" variant="ghost" className="h-11 px-6 text-sm border border-border/60 hover:border-primary/40 hover:bg-primary/5 transition-all">
                                Get Started Free
                            </Button>
                        </Link>
                    </motion.div>

                    {/* Feature pills */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 0.5, delay: 0.4 }}
                        className="flex flex-wrap justify-center gap-x-6 gap-y-2"
                    >
                        {features.map((f) => (
                            <div key={f} className="flex items-center gap-2 text-sm text-muted-foreground">
                                <CheckCircle className="h-4 w-4 text-violet-400 flex-shrink-0" />
                                <span>{f}</span>
                            </div>
                        ))}
                    </motion.div>

                    {/* Stats row */}
                    <motion.div
                        initial={{ opacity: 0, y: 32 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6, delay: 0.55, ease: "easeOut" }}
                        className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-6 max-w-3xl mx-auto"
                    >
                        {stats.map((stat) => (
                            <div
                                key={stat.label}
                                className="glass rounded-2xl p-5 text-left border border-white/[0.06] hover:border-violet-500/20 transition-all group"
                            >
                                <div className="flex items-start justify-between mb-3">
                                    <p className="text-3xl font-bold tracking-tight">{stat.value}</p>
                                    <div className="p-2 rounded-lg bg-violet-500/10">
                                        <stat.icon className="h-4 w-4 text-violet-400" />
                                    </div>
                                </div>
                                <p className="text-sm font-medium text-foreground/80">{stat.label}</p>
                                <p className="text-xs text-muted-foreground mt-0.5">{stat.change}</p>
                            </div>
                        ))}
                    </motion.div>
                </div>
            </div>

            {/* Bottom fade */}
            <div className="absolute bottom-0 left-0 right-0 h-40 bg-gradient-to-t from-background to-transparent pointer-events-none" />
        </section>
    );
}
