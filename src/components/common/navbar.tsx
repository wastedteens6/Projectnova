"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { ShoppingCart, Menu, X, LayoutDashboard, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useCart } from "@/context/CartContext";
import { useSession } from "next-auth/react";

const navLinks = [
    { label: "Projects", href: "/projects" },
    { label: "How It Works", href: "/#how-it-works" },
    { label: "Pricing", href: "/#pricing" },
    { label: "FAQ", href: "/#faq" },
];

export function Navbar() {
    const [isScrolled, setIsScrolled] = useState(false);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const { cartCount, openCart } = useCart();
    const { data: session } = useSession();

    useEffect(() => {
        const handleScroll = () => setIsScrolled(window.scrollY > 10);
        window.addEventListener("scroll", handleScroll, { passive: true });
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    return (
        <nav
            className={cn(
                "fixed top-0 w-full z-50 transition-all duration-300",
                isScrolled
                    ? "bg-background/80 backdrop-blur-xl border-b border-border/60 shadow-lg shadow-black/10"
                    : "bg-transparent"
            )}
        >
            <div className="container mx-auto px-4 sm:px-6">
                <div className="flex items-center justify-between h-16">

                    {/* Logo */}
                    <Link href="/" className="flex items-center gap-2.5 group">
                        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-violet-600 to-purple-600 flex items-center justify-center shadow-md shadow-violet-500/30 group-hover:shadow-violet-500/50 transition-shadow">
                            <Zap className="h-4 w-4 text-white" />
                        </div>
                        <span className="text-base font-bold tracking-tight">
                            Project<span className="text-violet-400">Nova</span>
                        </span>
                    </Link>

                    {/* Desktop Navigation */}
                    <div className="hidden md:flex items-center gap-1">
                        {navLinks.map(({ label, href }) => (
                            <Link
                                key={href}
                                href={href}
                                className="text-sm text-muted-foreground hover:text-foreground transition-colors px-3 py-2 rounded-lg hover:bg-accent/50"
                            >
                                {label}
                            </Link>
                        ))}
                    </div>

                    {/* Actions */}
                    <div className="hidden md:flex items-center gap-2">
                        {/* Cart */}
                        <Button
                            variant="ghost"
                            size="icon"
                            className="relative h-9 w-9"
                            onClick={openCart}
                        >
                            <ShoppingCart className="h-4.5 w-4.5" />
                            {cartCount > 0 && (
                                <span className="absolute -top-0.5 -right-0.5 bg-violet-600 text-white text-[10px] font-bold rounded-full w-4.5 h-4.5 flex items-center justify-center leading-none">
                                    {cartCount > 9 ? "9+" : cartCount}
                                </span>
                            )}
                        </Button>

                        {session?.user ? (
                            <div className="flex items-center gap-2">
                                {session.user.role === "ADMIN" && (
                                    <Link href="/admin">
                                        <Button variant="ghost" size="sm" className="gap-2 text-violet-400 hover:text-violet-300 hover:bg-violet-500/10">
                                            <LayoutDashboard className="h-4 w-4" />
                                            Admin Panel
                                        </Button>
                                    </Link>
                                )}
                                <Link href="/dashboard">
                                    <Button variant="ghost" size="sm" className="gap-2 border border-border/60 hover:border-violet-500/30 hover:bg-violet-500/5">
                                        <div className="w-5 h-5 rounded-full bg-violet-500/20 border border-violet-500/30 flex items-center justify-center text-violet-400 text-[10px] font-bold">
                                            {session.user.name?.charAt(0).toUpperCase() || "U"}
                                        </div>
                                        Dashboard
                                    </Button>
                                </Link>
                            </div>
                        ) : (
                            <>
                                <Link href="/auth/login">
                                    <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground">
                                        Sign in
                                    </Button>
                                </Link>
                                <Link href="/auth/register">
                                    <Button variant="gradient" size="sm" className="shadow-md shadow-violet-500/20">
                                        Get Started
                                    </Button>
                                </Link>
                            </>
                        )}
                    </div>

                    {/* Mobile toggle */}
                    <div className="md:hidden flex items-center gap-2">
                        <Button variant="ghost" size="icon" className="relative h-9 w-9" onClick={openCart}>
                            <ShoppingCart className="h-4.5 w-4.5" />
                            {cartCount > 0 && (
                                <span className="absolute -top-0.5 -right-0.5 bg-violet-600 text-white text-[10px] font-bold rounded-full w-4 h-4 flex items-center justify-center">
                                    {cartCount > 9 ? "9+" : cartCount}
                                </span>
                            )}
                        </Button>
                        <button
                            className="w-9 h-9 rounded-lg flex items-center justify-center hover:bg-accent/50 transition-colors"
                            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                        >
                            {isMobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
                        </button>
                    </div>
                </div>

                {/* Mobile Menu */}
                {isMobileMenuOpen && (
                    <div className="md:hidden py-4 border-t border-border/50">
                        <div className="flex flex-col gap-1 mb-4">
                            {navLinks.map(({ label, href }) => (
                                <Link
                                    key={href}
                                    href={href}
                                    onClick={() => setIsMobileMenuOpen(false)}
                                    className="text-sm text-muted-foreground hover:text-foreground transition-colors px-3 py-2 rounded-lg hover:bg-accent/50"
                                >
                                    {label}
                                </Link>
                            ))}
                        </div>
                        <div className="flex flex-col gap-2 pt-3 border-t border-border/50">
                            {session?.user ? (
                                <div className="flex flex-col gap-2">
                                    {session.user.role === "ADMIN" && (
                                        <Link href="/admin" onClick={() => setIsMobileMenuOpen(false)}>
                                            <Button variant="outline" className="w-full gap-2 border-violet-500/30 text-violet-400" size="sm">
                                                <LayoutDashboard className="h-4 w-4" />
                                                Admin Panel
                                            </Button>
                                        </Link>
                                    )}
                                    <Link href="/dashboard" onClick={() => setIsMobileMenuOpen(false)}>
                                        <Button variant="gradient" className="w-full gap-2" size="sm">
                                            <LayoutDashboard className="h-4 w-4" />
                                            My Dashboard
                                        </Button>
                                    </Link>
                                </div>
                            ) : (
                                <>
                                    <Link href="/auth/login">
                                        <Button variant="ghost" className="w-full" size="sm">Sign in</Button>
                                    </Link>
                                    <Link href="/auth/register">
                                        <Button variant="gradient" className="w-full" size="sm">Get Started</Button>
                                    </Link>
                                </>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </nav>
    );
}
