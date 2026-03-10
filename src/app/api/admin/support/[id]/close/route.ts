import { NextRequest } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { apiSuccess, apiError, HTTP } from '@/lib/api-response';
import { requireAdmin } from '@/lib/admin-guard';

// PATCH — close a ticket
export async function PATCH(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions);
  const authErr = requireAdmin(session);
  if (authErr) return authErr;

  try {
    const ticket = await prisma.supportTicket.findUnique({ where: { id: params.id } });
    if (!ticket) return apiError('Ticket not found', HTTP.NOT_FOUND);
    if (ticket.status === 'CLOSED') return apiError('Ticket is already closed', HTTP.BAD_REQUEST);

    const updated = await prisma.supportTicket.update({
      where: { id: params.id },
      data: { status: 'CLOSED', closedAt: new Date() },
    });

    return apiSuccess(updated, 'Ticket closed');
  } catch (err) {
    console.error('[Admin Support Close PATCH]', err);
    return apiError('Failed to close ticket', HTTP.INTERNAL_SERVER_ERROR, err);
  }
}
