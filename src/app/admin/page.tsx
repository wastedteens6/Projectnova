import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { DashboardStats } from '@/components/admin/DashboardStats';
import { DashboardRecentOrders } from '@/components/admin/DashboardRecentOrders';
import { DashboardTopProjects } from '@/components/admin/DashboardTopProjects';

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
            icon: 'dollar-sign',
            color: 'text-green-500',
            bg: 'bg-green-500/10',
            href: '/admin/orders',
        },
        {
            label: 'Total Orders',
            value: totalOrders,
            icon: 'shopping-bag',
            color: 'text-blue-500',
            bg: 'bg-blue-500/10',
            href: '/admin/orders',
        },
        {
            label: 'Customers',
            value: totalUsers,
            icon: 'users',
            color: 'text-purple-500',
            bg: 'bg-purple-500/10',
            href: '/admin/users',
        },
        {
            label: 'Live Projects',
            value: publishedProjects,
            icon: 'package',
            color: 'text-orange-500',
            bg: 'bg-orange-500/10',
            href: '/admin/projects',
        },
    ];

    return (
        <div className="space-y-12 pb-10">
            {/* Header */}
            <div>
                <h1 className="text-4xl font-black tracking-tight text-gray-900">
                    Welcome, {session!.user.name?.split(' ')[0]} <span className="animate-pulse">👋</span>
                </h1>
                <p className="text-lg font-bold text-gray-400 mt-2">Here&apos;s what&apos;s happening with ProjectNova today.</p>
            </div>

            {/* Stats Grid */}
            <DashboardStats stats={stats} />

            <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
                {/* Recent Orders */}
                <div className="lg:col-span-3">
                    <DashboardRecentOrders orders={recentOrders as any} />
                </div>

                {/* Top Projects */}
                <div className="lg:col-span-2">
                    <DashboardTopProjects projects={topProjects as any} />
                </div>
            </div>
        </div>
    );
}
