import { NextRequest } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { apiSuccess, apiError, HTTP } from '@/lib/api-response';
import { createTicketSchema } from '@/lib/validations/support.validation';
import { generateTicketNumber } from '@/lib/utils';

// GET — list current user's tickets
export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return apiError('Unauthorized', HTTP.UNAUTHORIZED);
  }

  try {
    const tickets = await prisma.supportTicket.findMany({
      where: { userId: session.user.id },
      include: {
        responses: {
          orderBy: { createdAt: 'desc' },
          take: 1,
          select: { createdAt: true, isAdmin: true },
        },
        _count: { select: { responses: true } },
      },
      orderBy: { updatedAt: 'desc' },
    });

    return apiSuccess(tickets);
  } catch (err) {
    console.error('[Tickets GET]', err);
    return apiError('Failed to fetch tickets', HTTP.INTERNAL_SERVER_ERROR, err);
  }
}

// POST — create a new ticket
export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return apiError('Unauthorized', HTTP.UNAUTHORIZED);
  }

  try {
    const body = await req.json();
    const parsed = createTicketSchema.safeParse(body);

    if (!parsed.success) {
      return apiError(parsed.error.errors[0].message, HTTP.BAD_REQUEST);
    }

    const { subject, description, priority } = parsed.data;

    const ticket = await prisma.supportTicket.create({
      data: {
        userId: session.user.id,
        ticketNumber: generateTicketNumber(),
        subject,
        description,
        priority,
      },
    });

    return apiSuccess(ticket, 'Ticket created successfully', HTTP.CREATED);
  } catch (err) {
    console.error('[Tickets POST]', err);
    return apiError('Failed to create ticket', HTTP.INTERNAL_SERVER_ERROR, err);
  }
}
