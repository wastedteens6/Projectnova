import { NextRequest } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { apiSuccess, apiError, HTTP } from '@/lib/api-response';
import { requireAdmin } from '@/lib/admin-guard';
import { Role } from '@prisma/client';
import { z } from 'zod';

const updateRoleSchema = z.object({
  role: z.nativeEnum(Role),
});

// GET — fetch user diagnostics
export async function GET(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions);
  const authErr = requireAdmin(session);
  if (authErr) return authErr;

  try {
    const user = await prisma.user.findUnique({
      where: { id: params.id },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        emailVerified: true,
        createdAt: true,
        _count: {
          select: {
            orders: true,
            projectAssignments: true,
            tickets: true,
          },
        },
      },
    });

    if (!user) return apiError('User not found', HTTP.NOT_FOUND);

    // Get recent orders and tickets for diagnostics
    const [recentOrders, tickets] = await Promise.all([
        prisma.order.findMany({
            where: { userId: params.id },
            take: 5,
            orderBy: { createdAt: 'desc' },
            select: { id: true, orderNumber: true, totalAmount: true, status: true, createdAt: true }
        }),
        prisma.supportTicket.findMany({
            where: { userId: params.id },
            take: 5,
            orderBy: { createdAt: 'desc' },
            select: { id: true, ticketNumber: true, status: true, priority: true, subject: true }
        })
    ]);

    return apiSuccess({ ...user, recentOrders, tickets });
  } catch (err) {
    console.error('[Admin User GET]', err);
    return apiError('Failed to fetch user details', HTTP.INTERNAL_SERVER_ERROR, err);
  }
}

// PATCH — update user role
export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions);
  // Only ADMIN can change roles
  const authErr = requireAdmin(session, ['ADMIN']);
  if (authErr) return authErr;

  try {
    const body = await req.json();
    const parsed = updateRoleSchema.safeParse(body);
    if (!parsed.success) {
      return apiError(parsed.error.errors[0].message, HTTP.BAD_REQUEST);
    }

    // Prevent changing own role (optional but safe)
    if ((session?.user as any)?.id === params.id) {
        return apiError('You cannot change your own role', HTTP.BAD_REQUEST);
    }

    const user = await prisma.user.update({
      where: { id: params.id },
      data: { role: parsed.data.role },
      select: { id: true, role: true },
    });

    return apiSuccess(user, `User role updated to ${user.role}`);
  } catch (err) {
    console.error('[Admin User Role PATCH]', err);
    return apiError('Failed to update user role', HTTP.INTERNAL_SERVER_ERROR, err);
  }
}
