import { NextRequest } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { apiSuccess, apiError, HTTP } from '@/lib/api-response';
import { requireAdmin } from '@/lib/admin-guard';
import { TicketStatus } from '@prisma/client';


export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  const authErr = requireAdmin(session);
  if (authErr) return authErr;

  const { searchParams } = new URL(req.url);
  const page = Math.max(1, parseInt(searchParams.get('page') ?? '1'));
  const statusParam = searchParams.get('status');
  const status = statusParam && Object.values(TicketStatus).includes(statusParam as TicketStatus)
    ? (statusParam as TicketStatus)
    : undefined;
  const limit = 20;


  try {
    const where = status ? { status } : {};

    const [tickets, total] = await Promise.all([
      prisma.supportTicket.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { updatedAt: 'desc' },
        include: {
          user: { select: { name: true, email: true } },
          _count: { select: { responses: true } },
        },
      }),
      prisma.supportTicket.count({ where }),
    ]);

    return apiSuccess({ tickets, total, page, pages: Math.ceil(total / limit) });
  } catch (err) {
    console.error('[Admin Support GET]', err);
    return apiError('Failed to fetch tickets', HTTP.INTERNAL_SERVER_ERROR, err);
  }
}
