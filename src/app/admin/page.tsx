import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';
import Link from 'next/link';
import { DollarSign, ShoppingBag, Users, Package, ArrowRight, Eye } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { formatDate } from '@/lib/utils';

export const metadata = { title: 'Admin Overview' };

export default async function AdminDashboardPage() {
    const session = await getServerSession(authOptions);

    const [totalRevenue, totalOrders, totalUsers, publishedProjects, recentOrders, topProjects] =
        await Promise.all([
            prisma.order.aggregate({ where: { status: 'PAID' }, _sum: { totalAmount: true } }),
            prisma.order.count(),
            prisma.user.count({ where: { role: 'USER' } }),
            prisma.project.count({ where: { isPublished: true } }),
            prisma.order.findMany({
                take: 8,
                orderBy: { createdAt: 'desc' },
                include: {
                    user: { select: { name: true, email: true } },
                    items: { include: { project: { select: { title: true } } } },
                },
            }),
            prisma.project.findMany({
                take: 5,
                orderBy: { views: 'desc' },
                select: { id: true, title: true, views: true, isPublished: true },
            }),
        ]);

    const stats = [
        {
            label: 'Total Revenue',
            value: `₹${(totalRevenue._sum.totalAmount ?? 0).toLocaleString('en-IN')}`,
            icon: DollarSign,
            color: 'text-green-400',
            bg: 'bg-green-500/10',
            href: '/admin/orders',
        },
        {
            label: 'Total Orders',
            value: totalOrders,
            icon: ShoppingBag,
            color: 'text-blue-400',
            bg: 'bg-blue-500/10',
            href: '/admin/orders',
        },
        {
            label: 'Customers',
            value: totalUsers,
            icon: Users,
            color: 'text-purple-400',
            bg: 'bg-purple-500/10',
            href: '/admin/users',
        },
        {
            label: 'Live Projects',
            value: publishedProjects,
            icon: Package,
            color: 'text-orange-400',
            bg: 'bg-orange-500/10',
            href: '/admin/projects',
        },
    ];

    return (
        <div className="space-y-8">
            {/* Header */}
            <div>
                <h1 className="text-3xl font-bold">
                    Welcome, {session!.user.name?.split(' ')[0]} 👋
                </h1>
                <p className="text-muted-foreground mt-1">Here&apos;s what&apos;s happening with ProjectNova today.</p>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {stats.map((stat) => (
                    <Link
                        key={stat.label}
                        href={stat.href}
                        className="group rounded-2xl border border-border/50 bg-card/50 backdrop-blur-xl p-6 hover:border-orange-500/30 transition-all hover:shadow-lg hover:shadow-orange-500/5"
                    >
                        <div className="flex items-center justify-between mb-4">
                            <div className={`rounded-xl p-3 ${stat.bg}`}>
                                <stat.icon className={`h-5 w-5 ${stat.color}`} />
                            </div>
                            <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:text-orange-400 transition-colors" />
                        </div>
                        <div className="text-2xl font-bold">{stat.value}</div>
                        <div className="text-sm text-muted-foreground mt-1">{stat.label}</div>
                    </Link>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Recent Orders */}
                <Card className="glass-card lg:col-span-2">
                    <CardHeader className="flex flex-row items-center justify-between pb-4">
                        <CardTitle className="text-lg">Recent Orders</CardTitle>
                        <Link href="/admin/orders" className="text-sm text-orange-400 hover:underline flex items-center gap-1">
                            View all <ArrowRight className="h-3 w-3" />
                        </Link>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-3">
                            {recentOrders.map((order) => (
                                <div
                                    key={order.id}
                                    className="flex items-center justify-between p-3 rounded-xl bg-muted/30 border border-border/30"
                                >
                                    <div className="min-w-0">
                                        <p className="font-medium text-sm truncate">
                                            {order.user.name || order.user.email}
                                        </p>
                                        <p className="text-xs text-muted-foreground truncate">
                                            {order.items.map((i) => i.project.title).join(', ')}
                                        </p>
                                    </div>
                                    <div className="text-right flex-shrink-0 ml-4">
                                        <p className="font-bold text-sm">₹{order.totalAmount.toLocaleString('en-IN')}</p>
                                        <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${order.status === 'PAID'
                                                ? 'bg-green-500/10 text-green-400'
                                                : 'bg-yellow-500/10 text-yellow-400'
                                            }`}>
                                            {order.status}
                                        </span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>

                {/* Top Projects */}
                <Card className="glass-card">
                    <CardHeader className="flex flex-row items-center justify-between pb-4">
                        <CardTitle className="text-lg">Top Projects</CardTitle>
                        <Link href="/admin/projects" className="text-sm text-orange-400 hover:underline flex items-center gap-1">
                            Manage <ArrowRight className="h-3 w-3" />
                        </Link>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-3">
                            {topProjects.map((project, i) => (
                                <div key={project.id} className="flex items-center gap-3">
                                    <span className="text-xs font-mono text-muted-foreground w-4">{i + 1}</span>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-medium truncate">{project.title}</p>
                                        <div className="flex items-center gap-1 text-xs text-muted-foreground">
                                            <Eye className="h-3 w-3" />
                                            {project.views.toLocaleString()} views
                                        </div>
                                    </div>
                                    <Badge className={`text-xs border flex-shrink-0 ${project.isPublished
                                            ? 'bg-green-500/10 text-green-400 border-green-500/20'
                                            : 'bg-muted/50 text-muted-foreground border-border'
                                        }`}>
                                        {project.isPublished ? 'Live' : 'Draft'}
                                    </Badge>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
