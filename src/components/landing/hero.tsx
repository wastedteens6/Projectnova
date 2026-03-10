"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  ArrowRight,
  CheckCircle,
  Sparkles,
  Users,
  Package,
  TrendingUp,
  Star,
  Download,
} from "lucide-react";
import { motion } from "framer-motion";

import Aurora from "@/components/animations/Aurora";
import DecryptedText from "@/components/animations/DecryptedText";
import ShinyText from "@/components/animations/ShinyText";

const stats = [
  {
    value: "5,000+",
    label: "Students Helped",
    icon: Users,
    change: "+24% this month",
  },
  {
    value: "200+",
    label: "Premium Projects",
    icon: Package,
    change: "Across 10 domains",
  },
  {
    value: "98%",
    label: "Defense Success",
    icon: TrendingUp,
    change: "Project approval rate",
  },
];

const features = [
  "Instant Download",
  "Complete Source Code",
  "Viva Q&A Included",
  "7-Day Money Back",
];

const previewProjects = [
  {
    name: "AI Resume Analyzer",
    stack: "React • Node • Python",
    downloads: "1.2k",
    rating: "4.9",
    price: "₹1499",
  },
  {
    name: "Blockchain Voting System",
    stack: "Solidity • Next.js",
    downloads: "820",
    rating: "4.8",
    price: "₹1799",
  },
  {
    name: "Smart Attendance System",
    stack: "React • ML",
    downloads: "1k",
    rating: "4.7",
    price: "₹1399",
  },
];

export function Hero() {
  return (
    <section className="relative min-h-[90vh] flex items-center overflow-hidden pt-20">

      {/* Aurora Background */}
      <div className="absolute inset-0 z-0">
        <Aurora
          colorStops={["#1e1b4b", "#4c1d95", "#1e1b4b"]}
          blend={0.5}
          amplitude={1}
          speed={0.5}
        />
      </div>

      {/* Gradient Orbs */}
      <div className="absolute inset-0 z-0">
        <div className="orb orb-purple w-[700px] h-[700px] -top-48 -left-48 opacity-40" />
        <div className="orb orb-indigo w-[600px] h-[600px] -bottom-32 -right-32 opacity-30" />
      </div>

      {/* Mesh overlay */}
      <div className="absolute inset-0 mesh-grid opacity-20 pointer-events-none" />

      {/* Content */}
      <div className="container relative z-10 px-6 py-20">
        <div className="grid lg:grid-cols-2 gap-12 items-center">

          {/* LEFT SIDE */}
          <div className="space-y-8">

            {/* Badge */}
            <motion.div
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
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

            {/* Heading */}
            <motion.div
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="space-y-4"
            >
              <h1 className="text-4xl md:text-6xl font-bold leading-[1.1] tracking-tight">
                <DecryptedText
                  text="Defense-Ready"
                  animateOn="view"
                  revealDirection="center"
                  sequential
                />
                <br />
                <span className="gradient-text">
                  <DecryptedText
                    text="Software Projects"
                    animateOn="view"
                    revealDirection="center"
                    sequential
                  />
                </span>
              </h1>

              <p className="text-lg text-muted-foreground max-w-xl">
                Premium academic projects with full source code,
                installation videos, research documentation,
                and viva preparation to help you succeed
                in your final year project defense.
              </p>
            </motion.div>

            {/* CTA */}
            <motion.div
              className="flex flex-col sm:flex-row gap-4"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.25 }}
            >
              <Link href="/projects">
                <Button
                  size="lg"
                  className="group h-12 px-6 font-semibold shadow-lg shadow-violet-500/25"
                >
                  Browse Projects
                  <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition" />
                </Button>
              </Link>

              <Link href="/auth/register">
                <Button
                  size="lg"
                  variant="ghost"
                  className="h-12 px-6 border border-border/60"
                >
                  Get Started Free
                </Button>
              </Link>
            </motion.div>

            {/* Feature Pills */}
            <div className="flex flex-wrap gap-6 pt-2">
              {features.map((f) => (
                <div
                  key={f}
                  className="flex items-center gap-2 text-sm text-muted-foreground"
                >
                  <CheckCircle className="h-4 w-4 text-violet-400" />
                  {f}
                </div>
              ))}
            </div>

            {/* Trust Indicators */}
            <div className="flex items-center gap-6 text-sm text-muted-foreground pt-2">
              <div className="flex items-center gap-1">
                <Star className="h-4 w-4 text-yellow-400 fill-yellow-400" />
                4.8 Student Rating
              </div>

              <div className="flex items-center gap-1">
                <Download className="h-4 w-4" />
                Instant Access
              </div>
            </div>
          </div>

          {/* RIGHT SIDE – PROJECT PREVIEW */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="relative"
          >
            <div className="grid gap-4">

              {previewProjects.map((project, i) => (
                <motion.div
                  key={project.name}
                  whileHover={{ scale: 1.04 }}
                  transition={{ duration: 0.2 }}
                  className="glass rounded-xl p-5 border border-white/10 backdrop-blur-md"
                >
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="font-semibold">{project.name}</h3>
                    <span className="text-sm text-violet-400">
                      {project.price}
                    </span>
                  </div>

                  <p className="text-xs text-muted-foreground mb-3">
                    {project.stack}
                  </p>

                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>⭐ {project.rating}</span>
                    <span>{project.downloads} downloads</span>
                  </div>
                </motion.div>
              ))}

            </div>
          </motion.div>
        </div>

        {/* STATS */}
        <div className="grid sm:grid-cols-3 gap-4 pt-16 max-w-3xl mx-auto">
          {stats.map((stat) => (
            <div
              key={stat.label}
              className="glass rounded-2xl p-5 border border-white/[0.06]"
            >
              <div className="flex items-start justify-between mb-3">
                <p className="text-3xl font-bold">{stat.value}</p>

                <div className="p-2 rounded-lg bg-violet-500/10">
                  <stat.icon className="h-4 w-4 text-violet-400" />
                </div>
              </div>

              <p className="text-sm font-medium text-foreground/80">
                {stat.label}
              </p>

              <p className="text-xs text-muted-foreground mt-1">
                {stat.change}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Bottom gradient fade */}
      <div className="absolute bottom-0 left-0 right-0 h-40 bg-gradient-to-t from-background to-transparent pointer-events-none" />
    </section>
  );
}