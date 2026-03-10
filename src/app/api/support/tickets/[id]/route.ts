import { NextRequest } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { apiSuccess, apiError, HTTP } from '@/lib/api-response';

// GET — get single ticket with all responses (owner only)
export async function GET(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return apiError('Unauthorized', HTTP.UNAUTHORIZED);
  }

  try {
    const ticket = await prisma.supportTicket.findUnique({
      where: { id: params.id },
      include: {
        responses: {
          orderBy: { createdAt: 'asc' },
        },
      },
    });

    if (!ticket) {
      return apiError('Ticket not found', HTTP.NOT_FOUND);
    }

    // Only the owner (or admin) can view the ticket
    if (ticket.userId !== session.user.id && session.user.role !== 'ADMIN') {
      return apiError('Forbidden', HTTP.FORBIDDEN);
    }

    return apiSuccess(ticket);
  } catch (err) {
    console.error('[Ticket GET]', err);
    return apiError('Failed to fetch ticket', HTTP.INTERNAL_SERVER_ERROR, err);
  }
}
