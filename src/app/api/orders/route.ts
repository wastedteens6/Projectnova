import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { apiSuccess, apiError, HTTP } from '@/lib/api-response';

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return apiError('Unauthorized', HTTP.UNAUTHORIZED);
  }

  try {
    const orders = await prisma.order.findMany({
      where: { userId: session.user.id },
      include: {
        items: {
          include: {
            project: {
              select: {
                id: true,
                title: true,
                slug: true,
                images: true,
                thumbnailUrl: true,
              },
            },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return apiSuccess(orders);
  } catch (err) {
    console.error('[Orders GET]', err);
    return apiError('Failed to fetch orders', HTTP.INTERNAL_SERVER_ERROR, err);
  }
}
