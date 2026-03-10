"use client";

import { Search, MousePointerClick, Download, ArrowRight } from "lucide-react";
import { motion } from "framer-motion";

type Step = {
  number: string;
  icon: React.ElementType;
  title: string;
  description: string;
  color: keyof typeof colorMap;
};

const steps: Step[] = [
  {
    number: "01",
    icon: Search,
    title: "Find Your Project",
    description:
      "Browse 200+ curated projects across AI, Web, ML, IoT, Blockchain, and more. Filter by tech stack, domain, or budget.",
    color: "violet",
  },
  {
    number: "02",
    icon: MousePointerClick,
    title: "Pick Your Tier",
    description:
      "Choose from Code Only, Code + Video Tutorials, or Premium Support depending on your preparation needs.",
    color: "purple",
  },
  {
    number: "03",
    icon: Download,
    title: "Get Instant Access",
    description:
      "Download files immediately after payment. Access source code, documentation, viva Q&A, and project reports.",
    color: "indigo",
  },
];

const colorMap = {
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

      {/* Divider */}
      <div className="container mx-auto px-4 sm:px-6 mb-12">
        <div className="section-divider" />
      </div>

      <div className="container mx-auto px-4 sm:px-6">

        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 25 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center max-w-2xl mx-auto mb-14 space-y-3"
        >
          <div className="badge-pill inline-flex">Simple Process</div>

          <h2 className="text-3xl md:text-4xl font-bold tracking-tight">
            From Browsing to
            <br />
            <span className="gradient-text">Defense-Ready</span>
          </h2>

          <p className="text-muted-foreground text-base">
            Three steps. Minutes to access. Weeks saved on preparation.
          </p>
        </motion.div>

        {/* Steps */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto relative">

          {/* Desktop Connector */}
          <div className="hidden md:block absolute top-16 left-[calc(33%+1rem)] right-[calc(33%+1rem)] h-[2px] bg-gradient-to-r from-violet-500/40 via-purple-500/40 to-indigo-500/40 z-0" />

          {steps.map((step, index) => {
            const c = colorMap[step.color];
            const Icon = step.icon;

            return (
              <motion.div
                key={step.number}
                initial={{ opacity: 0, y: 35 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.15, duration: 0.45 }}
                viewport={{ once: true }}
                className="relative z-10"
              >
                <div
                  className={`group relative rounded-2xl border ${c.border} ${c.bg} p-6 transition-all duration-300 h-full hover:-translate-y-1 hover:shadow-xl ${c.glow}`}
                >

                  {/* Large Step Number */}
                  <div
                    className={`absolute right-5 top-4 text-7xl font-black ${c.num} select-none`}
                  >
                    {step.number}
                  </div>

                  {/* Icon */}
                  <div
                    className={`w-12 h-12 rounded-xl ${c.bg} border ${c.border} flex items-center justify-center mb-5 group-hover:scale-110 transition-transform duration-300`}
                  >
                    <Icon className={`h-5 w-5 ${c.icon}`} />
                  </div>

                  {/* Title */}
                  <h3 className="text-lg font-semibold mb-2">{step.title}</h3>

                  {/* Description */}
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {step.description}
                  </p>

                  {/* Arrow Indicator */}
                  {index < steps.length - 1 && (
                    <ArrowRight
                      className={`hidden md:block absolute -right-4 top-16 h-4 w-4 ${c.text}`}
                    />
                  )}
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}