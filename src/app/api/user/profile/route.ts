import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { apiSuccess, apiError, HTTP } from '@/lib/api-response';
import { updateProfileSchema } from '@/lib/validations/api.validation';

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return apiError('Unauthorized', HTTP.UNAUTHORIZED);
  }

  try {
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        emailVerified: true,
        createdAt: true,
      },
    });

    if (!user) {
      return apiError('User not found', HTTP.NOT_FOUND);
    }

    return apiSuccess(user);
  } catch (err) {
    console.error('[Profile GET]', err);
    return apiError('Failed to fetch profile', HTTP.INTERNAL_SERVER_ERROR, err);
  }
}

export async function PUT(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return apiError('Unauthorized', HTTP.UNAUTHORIZED);
  }

  try {
    const body = await req.json();
    const parsed = updateProfileSchema.safeParse(body);

    if (!parsed.success) {
      return apiError(parsed.error.errors[0].message, HTTP.BAD_REQUEST);
    }

    const user = await prisma.user.update({
      where: { id: session.user.id },
      data: { name: parsed.data.name },
      select: { id: true, name: true, email: true, role: true },
    });

    return apiSuccess(user, 'Profile updated');
  } catch (err) {
    console.error('[Profile PUT]', err);
    return apiError('Failed to update profile', HTTP.INTERNAL_SERVER_ERROR, err);
  }
}
