"use client";

import Link from "next/link";
import {
  Search,
  MousePointerClick,
  Download,
  ArrowRight,
  Check,
} from "lucide-react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";

type Step = {
  number: string;
  icon: React.ElementType;
  title: string;
  description: string;
  color: keyof typeof colorMap;
  deliverables?: string[];
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
    deliverables: [
      "Source Code",
      "Project Documentation",
      "Viva Questions",
      "Installation Video",
    ],
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
      <div className="absolute top-0 left-1/2 h-[400px] w-[800px] -translate-x-1/2 rounded-full bg-violet-600/10 blur-[120px] pointer-events-none" />

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
          <div className="md:hidden absolute left-6 top-16 bottom-16 w-px bg-gradient-to-b from-violet-500/40 via-purple-500/40 to-indigo-500/40 z-0" />

          {/* Desktop Connector */}
          <motion.div
            initial={{ scaleX: 0 }}
            whileInView={{ scaleX: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 1 }}
            className="hidden md:block absolute top-16 left-[calc(33%+1rem)] right-[calc(33%+1rem)] h-[2px] origin-left bg-gradient-to-r from-violet-500 via-purple-500 to-indigo-500 z-0"
          />

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
                  className={`absolute left-[1.15rem] top-12 z-20 h-3 w-3 -translate-x-1/2 rounded-full md:hidden ${c.icon.replace("text-", "bg-")} shadow-lg ${c.glow}`}
                />
                <div
                  className={`hidden md:block absolute left-1/2 top-[3.6rem] z-20 h-3 w-3 -translate-x-1/2 rounded-full ${c.icon.replace("text-", "bg-")} shadow-lg ${c.glow}`}
                />
                <div
                  className={`group relative h-full overflow-hidden rounded-2xl border border-white/10 bg-white/[0.03] p-6 pl-14 backdrop-blur-xl transition-all duration-300 hover:-translate-y-1 hover:bg-white/[0.05] hover:shadow-lg hover:shadow-black/30 md:pl-6 ${c.glow}`}
                >
                  <div className="pointer-events-none absolute inset-0 rounded-2xl border border-violet-500/0 transition-colors duration-300 group-hover:border-violet-500/30" />

                  {/* Large Step Number */}
                  <div
                    className="pointer-events-none absolute right-5 top-4 select-none text-[80px] font-black text-white/[0.03]"
                  >
                    {step.number}
                  </div>

                  {/* Icon */}
                  <div
                    className={`relative mb-5 flex h-12 w-12 items-center justify-center rounded-xl border border-white/10 bg-gradient-to-br ${c.bg} from-violet-500/20 to-purple-500/10 transition duration-300 group-hover:scale-110`}
                  >
                    <Icon className={`h-5 w-5 ${c.icon}`} />
                  </div>

                  {/* Title */}
                  <h3 className="text-lg font-semibold mb-2">{step.title}</h3>

                  {/* Description */}
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {step.description}
                  </p>

                  {step.deliverables && (
                    <ul className="mt-4 space-y-2 text-xs text-muted-foreground">
                      {step.deliverables.map((item) => (
                        <li key={item} className="flex items-center gap-2">
                          <Check className="h-3.5 w-3.5 text-indigo-400" />
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  )}

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

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="mt-16 text-center"
        >
          <p className="text-sm uppercase tracking-[0.24em] text-muted-foreground/80">
            Ready to start your project?
          </p>
          <h3 className="mt-3 text-2xl font-semibold tracking-tight">
            Browse the catalog and get instant access.
          </h3>
          <Link href="/projects" className="mt-6 inline-flex">
            <Button
              size="lg"
              className="group gap-2 shadow-lg shadow-violet-500/20"
            >
              Browse Projects
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </Button>
          </Link>
        </motion.div>
      </div>
    </section>
  );
}
