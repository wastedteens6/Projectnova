import { NextRequest } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { apiSuccess, apiError, HTTP } from '@/lib/api-response';
import { respondToTicketSchema } from '@/lib/validations/support.validation';

// POST — add a user response to a ticket
export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return apiError('Unauthorized', HTTP.UNAUTHORIZED);
  }

  try {
    const body = await req.json();
    const parsed = respondToTicketSchema.safeParse(body);

    if (!parsed.success) {
      return apiError(parsed.error.errors[0].message, HTTP.BAD_REQUEST);
    }

    // Verify ticket exists and belongs to this user
    const ticket = await prisma.supportTicket.findUnique({
      where: { id: params.id },
    });

    if (!ticket) {
      return apiError('Ticket not found', HTTP.NOT_FOUND);
    }

    if (ticket.userId !== session.user.id && session.user.role !== 'ADMIN') {
      return apiError('Forbidden', HTTP.FORBIDDEN);
    }

    if (ticket.status === 'CLOSED') {
      return apiError('Cannot reply to a closed ticket', HTTP.BAD_REQUEST);
    }

    // Create response + update ticket status to IN_PROGRESS in a transaction
    const response = await prisma.$transaction(async (tx) => {
      const newResponse = await tx.ticketResponse.create({
        data: {
          ticketId: params.id,
          message: parsed.data.message,
          isAdmin: false,
        },
      });

      // Move ticket to IN_PROGRESS if it was OPEN
      if (ticket.status === 'OPEN') {
        await tx.supportTicket.update({
          where: { id: params.id },
          data: { status: 'IN_PROGRESS' },
        });
      } else {
        // Just touch updatedAt
        await tx.supportTicket.update({
          where: { id: params.id },
          data: { updatedAt: new Date() },
        });
      }

      return newResponse;
    });

    return apiSuccess(response, 'Response added', HTTP.CREATED);
  } catch (err) {
    console.error('[Ticket Respond POST]', err);
    return apiError('Failed to add response', HTTP.INTERNAL_SERVER_ERROR, err);
  }
}
