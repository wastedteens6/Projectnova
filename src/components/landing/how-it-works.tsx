"use client";

import { Search, MousePointerClick, Download, ArrowRight } from "lucide-react";

const steps = [
    {
        number: "01",
        icon: Search,
        title: "Find Your Project",
        description: "Browse 200+ curated projects across AI, Web, ML, IoT, Blockchain, and more. Filter by tech stack, domain, or budget.",
        color: "violet",
    },
    {
        number: "02",
        icon: MousePointerClick,
        title: "Pick Your Tier",
        description: "Choose from Code Only, Code + Video Tutorials, or Premium Support depending on your preparation needs.",
        color: "purple",
    },
    {
        number: "03",
        icon: Download,
        title: "Get Instant Access",
        description: "Download files immediately after payment. Access source code, documentation, viva Q&A, and project reports.",
        color: "indigo",
    },
];

const colorMap: Record<string, { bg: string; border: string; text: string; icon: string; glow: string; num: string }> = {
    violet: {
        bg: "bg-violet-500/10",
        border: "border-violet-500/20",
        text: "text-violet-400",
        icon: "text-violet-400",
        glow: "shadow-violet-500/20",
        num: "text-violet-500/30",
    },
    purple: {
        bg: "bg-purple-500/10",
        border: "border-purple-500/20",
        text: "text-purple-400",
        icon: "text-purple-400",
        glow: "shadow-purple-500/20",
        num: "text-purple-500/30",
    },
    indigo: {
        bg: "bg-indigo-500/10",
        border: "border-indigo-500/20",
        text: "text-indigo-400",
        icon: "text-indigo-400",
        glow: "shadow-indigo-500/20",
        num: "text-indigo-500/30",
    },
};

export function HowItWorks() {
    return (
        <section id="how-it-works" className="relative py-16 sm:py-20">
            {/* Section rule */}
            <div className="container mx-auto px-4 sm:px-6 mb-12">
                <div className="section-divider" />
            </div>

            <div className="container mx-auto px-4 sm:px-6">
                <div className="text-center max-w-2xl mx-auto mb-12 space-y-3">
                    <div className="badge-pill inline-flex">Simple Process</div>
                    <h2 className="text-3xl md:text-4xl font-bold tracking-tight">
                        From Browsing to
                        <br />
                        <span className="gradient-text">Defense-Ready</span>
                    </h2>
                    <p className="text-muted-foreground text-base">
                        Three steps. Minutes to access. Weeks saved on preparation.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto relative">
                    {/* Connector line (desktop only) */}
                    <div className="hidden md:block absolute top-12 left-[calc(33%+1rem)] right-[calc(33%+1rem)] h-px bg-gradient-to-r from-violet-500/30 via-purple-500/30 to-indigo-500/30 z-0" />

                    {steps.map((step, index) => {
                        const c = colorMap[step.color];
                        return (
                            <div key={step.number} className="relative z-10">
                                <div className={`group rounded-2xl border ${c.border} ${c.bg} p-6 hover:shadow-lg ${c.glow} transition-all duration-300 h-full`}>
                                    {/* Step number background */}
                                    <div className={`text-7xl font-black ${c.num} leading-none mb-4 select-none`}>
                                        {step.number}
                                    </div>

                                    {/* Icon */}
                                    <div className={`w-12 h-12 rounded-xl ${c.bg} border ${c.border} flex items-center justify-center mb-4 group-hover:scale-105 transition-transform`}>
                                        <step.icon className={`h-5 w-5 ${c.icon}`} />
                                    </div>

                                    <h3 className="text-lg font-semibold mb-2">{step.title}</h3>
                                    <p className="text-sm text-muted-foreground leading-relaxed">{step.description}</p>

                                    {index < steps.length - 1 && (
                                        <ArrowRight className={`hidden md:block absolute -right-4 top-12 h-4 w-4 ${c.text} z-20`} />
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </section>
    );
}
