'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { signOut } from 'next-auth/react';
import {
    LayoutDashboard,
    Package,
    ShoppingBag,
    Users,
    LifeBuoy,
    LogOut,
    X,
    Menu,
    Shield,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useState } from 'react';

const navItems = [
    { href: '/admin', label: 'Overview', icon: LayoutDashboard, exact: true },
    { href: '/admin/projects', label: 'Projects', icon: Package },
    { href: '/admin/orders', label: 'Orders', icon: ShoppingBag },
    { href: '/admin/users', label: 'Users', icon: Users },
    { href: '/admin/support', label: 'Support', icon: LifeBuoy },
];

interface AdminSidebarProps {
    user: {
        name?: string | null;
        email?: string | null;
        role?: string;
    };
}

export function AdminSidebar({ user }: AdminSidebarProps) {
    const pathname = usePathname();
    const [mobileOpen, setMobileOpen] = useState(false);

    const isActive = (href: string, exact?: boolean) =>
        exact ? pathname === href : pathname.startsWith(href);

    const SidebarContent = () => (
        <div className="flex flex-col h-full">
            {/* Logo */}
            <div className="px-6 py-5 border-b border-border/50">
                <Link href="/admin" className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-orange-500 to-red-500 flex items-center justify-center">
                        <Shield className="h-4 w-4 text-white" />
                    </div>
                    <div>
                        <span className="font-bold text-sm">Admin Panel</span>
                        <p className="text-xs text-muted-foreground">ProjectNova</p>
                    </div>
                </Link>
            </div>

            {/* User Info */}
            <div className="px-6 py-4 border-b border-border/50">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-orange-500/20 flex items-center justify-center text-orange-400 font-bold text-sm">
                        {user.name?.charAt(0).toUpperCase() || 'A'}
                    </div>
                    <div className="min-w-0">
                        <p className="font-semibold text-sm truncate">{user.name || 'Admin'}</p>
                        <span className="text-xs px-1.5 py-0.5 rounded bg-orange-500/10 text-orange-400 font-medium">
                            {user.role}
                        </span>
                    </div>
                </div>
            </div>

            {/* Nav Items */}
            <nav className="flex-1 px-3 py-4 space-y-1">
                {navItems.map((item) => {
                    const active = isActive(item.href, item.exact);
                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            onClick={() => setMobileOpen(false)}
                            className={cn(
                                'flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all',
                                active
                                    ? 'bg-orange-500/10 text-orange-400 border border-orange-500/20'
                                    : 'text-muted-foreground hover:text-foreground hover:bg-muted'
                            )}
                        >
                            <item.icon className={cn('h-4 w-4', active && 'text-orange-400')} />
                            {item.label}
                        </Link>
                    );
                })}
            </nav>

            {/* Footer Links */}
            <div className="px-3 py-4 border-t border-border/50 space-y-1">
                <Link
                    href="/dashboard"
                    className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted transition-all"
                >
                    <LayoutDashboard className="h-4 w-4" />
                    User Dashboard
                </Link>
                <button
                    onClick={() => signOut({ callbackUrl: '/' })}
                    className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-all w-full"
                >
                    <LogOut className="h-4 w-4" />
                    Sign Out
                </button>
            </div>
        </div>
    );

    return (
        <>
            {/* Desktop Sidebar */}
            <aside className="hidden md:flex fixed left-0 top-0 h-full w-64 flex-col border-r border-border/50 bg-background/80 backdrop-blur-xl z-30">
                <SidebarContent />
            </aside>

            {/* Mobile Top Bar */}
            <div className="md:hidden fixed top-0 left-0 right-0 z-40 flex items-center justify-between px-4 h-16 bg-background/80 backdrop-blur-xl border-b border-border/50">
                <Link href="/admin" className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-orange-500 to-red-500 flex items-center justify-center">
                        <Shield className="h-4 w-4 text-white" />
                    </div>
                    <span className="font-bold text-sm">Admin Panel</span>
                </Link>
                <button onClick={() => setMobileOpen(true)} className="p-2 rounded-lg hover:bg-muted">
                    <Menu className="h-5 w-5" />
                </button>
            </div>

            {/* Mobile Drawer */}
            {mobileOpen && (
                <>
                    <div
                        className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm md:hidden"
                        onClick={() => setMobileOpen(false)}
                    />
                    <aside className="fixed left-0 top-0 h-full w-72 z-50 bg-background border-r border-border/50 md:hidden flex flex-col">
                        <div className="flex justify-end p-4">
                            <button onClick={() => setMobileOpen(false)} className="p-2 rounded-lg hover:bg-muted">
                                <X className="h-5 w-5" />
                            </button>
                        </div>
                        <SidebarContent />
                    </aside>
                </>
            )}
        </>
    );
}
