import { NextRequest } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { apiSuccess, apiError, HTTP } from '@/lib/api-response';
import { requireAdmin } from '@/lib/admin-guard';
import { respondToTicketSchema } from '@/lib/validations/support.validation';

// POST — admin reply to a ticket
export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions);
  const authErr = requireAdmin(session);
  if (authErr) return authErr;

  try {
    const body = await req.json();
    const parsed = respondToTicketSchema.safeParse(body);
    if (!parsed.success) {
      return apiError(parsed.error.errors[0].message, HTTP.BAD_REQUEST);
    }

    const ticket = await prisma.supportTicket.findUnique({ where: { id: params.id } });
    if (!ticket) return apiError('Ticket not found', HTTP.NOT_FOUND);

    const response = await prisma.$transaction(async (tx) => {
      const newResponse = await tx.ticketResponse.create({
        data: {
          ticketId: params.id,
          message: parsed.data.message,
          isAdmin: true,
          adminName: session!.user.name ?? 'Support Team',
        },
      });

      // Move to IN_PROGRESS when admin first replies
      if (ticket.status === 'OPEN') {
        await tx.supportTicket.update({
          where: { id: params.id },
          data: { status: 'IN_PROGRESS' },
        });
      } else {
        await tx.supportTicket.update({
          where: { id: params.id },
          data: { updatedAt: new Date() },
        });
      }

      return newResponse;
    });

    return apiSuccess(response, 'Reply sent', HTTP.CREATED);
  } catch (err) {
    console.error('[Admin Support Respond POST]', err);
    return apiError('Failed to send reply', HTTP.INTERNAL_SERVER_ERROR, err);
  }
}
