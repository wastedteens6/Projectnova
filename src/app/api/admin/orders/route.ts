import { NextRequest } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { apiSuccess, apiError, HTTP } from '@/lib/api-response';
import { requireAdmin } from '@/lib/admin-guard';
import { OrderStatus } from '@prisma/client';


export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  const authErr = requireAdmin(session);
  if (authErr) return authErr;

  const { searchParams } = new URL(req.url);
  const page = Math.max(1, parseInt(searchParams.get('page') ?? '1'));
  const statusParam = searchParams.get('status');
  const status = statusParam && Object.values(OrderStatus).includes(statusParam as OrderStatus)
    ? (statusParam as OrderStatus)
    : undefined;
  const limit = 20;


  try {
    const where = status ? { status } : {};

    const [orders, total] = await Promise.all([
      prisma.order.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          user: { select: { name: true, email: true } },
          items: {
            include: { project: { select: { title: true } } },
          },
        },
      }),
      prisma.order.count({ where }),
    ]);

    return apiSuccess({ orders, total, page, pages: Math.ceil(total / limit) });
  } catch (err) {
    console.error('[Admin Orders GET]', err);
    return apiError('Failed to fetch orders', HTTP.INTERNAL_SERVER_ERROR, err);
  }
}
