import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { apiSuccess, apiError, HTTP } from '@/lib/api-response';
import { requireAdmin } from '@/lib/admin-guard';

export async function GET() {
  const session = await getServerSession(authOptions);
  const authErr = requireAdmin(session);
  if (authErr) return authErr;

  try {
    const [
      totalRevenue,
      totalOrders,
      totalUsers,
      publishedProjects,
      recentOrders,
      topProjects,
    ] = await Promise.all([
      prisma.order.aggregate({
        where: { status: 'PAID' },
        _sum: { totalAmount: true },
      }),
      prisma.order.count(),
      prisma.user.count({ where: { role: 'USER' } }),
      prisma.project.count({ where: { isPublished: true } }),
      prisma.order.findMany({
        take: 10,
        orderBy: { createdAt: 'desc' },
        include: {
          user: { select: { name: true, email: true } },
          items: { include: { project: { select: { title: true } } } },
        },
      }),
      prisma.project.findMany({
        take: 5,
        orderBy: { views: 'desc' },
        select: { id: true, title: true, views: true, popularity: true, isPublished: true },
      }),
    ]);

    return apiSuccess({
      stats: {
        totalRevenue: totalRevenue._sum.totalAmount ?? 0,
        totalOrders,
        totalUsers,
        publishedProjects,
      },
      recentOrders,
      topProjects,
    });
  } catch (err) {
    console.error('[Admin Dashboard GET]', err);
    return apiError('Failed to fetch dashboard data', HTTP.INTERNAL_SERVER_ERROR, err);
  }
}
