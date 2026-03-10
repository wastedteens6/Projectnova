import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';
import Link from 'next/link';
import { ShoppingBag, Download, Package, ArrowRight } from 'lucide-react';

export const metadata = { title: 'Dashboard' };

export default async function DashboardPage() {
    const session = await getServerSession(authOptions);
    const userId = session!.user.id;

    // Fetch stats in parallel
    const [orderCount, totalSpent, recentOrders] = await Promise.all([
        prisma.order.count({ where: { userId, status: 'PAID' } }),
        prisma.order.aggregate({
            where: { userId, status: 'PAID' },
            _sum: { totalAmount: true },
        }),
        prisma.order.findMany({
            where: { userId },
            take: 3,
            orderBy: { createdAt: 'desc' },
            include: {
                items: {
                    include: {
                        project: { select: { title: true, slug: true } },
                    },
                },
            },
        }),
    ]);

    const stats = [
        {
            label: 'Total Orders',
            value: orderCount,
            icon: ShoppingBag,
            href: '/dashboard/orders',
            color: 'text-blue-400',
            bg: 'bg-blue-500/10',
        },
        {
            label: 'Projects Purchased',
            value: recentOrders.reduce((acc, o) => acc + o.items.length, 0),
            icon: Package,
            href: '/dashboard/downloads',
            color: 'text-purple-400',
            bg: 'bg-purple-500/10',
        },
        {
            label: 'Total Spent',
            value: `₹${(totalSpent._sum.totalAmount || 0).toLocaleString()}`,
            icon: Download,
            href: '/dashboard/orders',
            color: 'text-green-400',
            bg: 'bg-green-500/10',
        },
    ];

    return (
        <div className="space-y-8">
            {/* Header */}
            <div>
                <h1 className="text-3xl font-bold">
                    Welcome back, {session!.user.name?.split(' ')[0] || 'there'} 👋
                </h1>
                <p className="text-muted-foreground mt-1">
                    Here's an overview of your ProjectNova account.
                </p>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {stats.map((stat) => (
                    <Link
                        key={stat.label}
                        href={stat.href}
                        className="group rounded-2xl border border-border/50 bg-card/50 backdrop-blur-xl p-6 hover:border-primary/30 transition-all hover:shadow-lg hover:shadow-primary/5"
                    >
                        <div className="flex items-center justify-between mb-4">
                            <div className={`rounded-xl p-3 ${stat.bg}`}>
                                <stat.icon className={`h-5 w-5 ${stat.color}`} />
                            </div>
                            <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
                        </div>
                        <div className="text-2xl font-bold">{stat.value}</div>
                        <div className="text-sm text-muted-foreground mt-1">{stat.label}</div>
                    </Link>
                ))}
            </div>

            {/* Recent Orders */}
            <div className="rounded-2xl border border-border/50 bg-card/50 backdrop-blur-xl p-6">
                <div className="flex items-center justify-between mb-6">
                    <h2 className="text-xl font-bold">Recent Orders</h2>
                    <Link
                        href="/dashboard/orders"
                        className="text-sm text-primary hover:underline flex items-center gap-1"
                    >
                        View all <ArrowRight className="h-3 w-3" />
                    </Link>
                </div>

                {recentOrders.length === 0 ? (
                    <div className="text-center py-12">
                        <ShoppingBag className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
                        <p className="text-muted-foreground">No orders yet</p>
                        <Link
                            href="/projects"
                            className="mt-3 inline-flex items-center gap-1 text-sm text-primary hover:underline"
                        >
                            Browse projects <ArrowRight className="h-3 w-3" />
                        </Link>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {recentOrders.map((order) => (
                            <div
                                key={order.id}
                                className="flex items-center justify-between p-4 rounded-xl bg-muted/30 border border-border/30"
                            >
                                <div>
                                    <div className="font-medium text-sm">
                                        {order.items.map((i) => i.project.title).join(', ')}
                                    </div>
                                    <div className="text-xs text-muted-foreground mt-0.5">
                                        {new Date(order.createdAt).toLocaleDateString('en-IN', {
                                            day: 'numeric',
                                            month: 'short',
                                            year: 'numeric',
                                        })}
                                    </div>
                                </div>
                                <div className="text-right">
                                    <div className="font-bold text-sm">₹{order.totalAmount.toLocaleString()}</div>
                                    <span
                                        className={`text-xs px-2 py-0.5 rounded-full font-medium ${order.status === 'PAID'
                                                ? 'bg-green-500/10 text-green-500'
                                                : 'bg-yellow-500/10 text-yellow-500'
                                            }`}
                                    >
                                        {order.status}
                                    </span>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
