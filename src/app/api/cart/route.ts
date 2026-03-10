import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { apiSuccess, apiError, HTTP } from '@/lib/api-response';
import { addToCartSchema, removeFromCartSchema } from '@/lib/validations/api.validation';

// GET - fetch user's cart
export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return apiError('Unauthorized', HTTP.UNAUTHORIZED);
  }

  try {
    const cart = await prisma.cart.findUnique({
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
                tier1Price: true,
                tier2Price: true,
                tier3Price: true,
              },
            },
          },
          orderBy: { createdAt: 'desc' },
        },
      },
    });

    if (!cart) {
      return apiSuccess([]);
    }

    const items = cart.items.map((item) => {
      const tierKey = `tier${item.tier}Price` as 'tier1Price' | 'tier2Price' | 'tier3Price';
      return {
        id: item.id,
        projectId: item.projectId,
        project: item.project,
        tier: item.tier as 1 | 2 | 3,
        price: item.project[tierKey],
      };
    });

    return apiSuccess(items);
  } catch (err) {
    console.error('[Cart GET]', err);
    return apiError('Failed to fetch cart', HTTP.INTERNAL_SERVER_ERROR, err);
  }
}

// POST - add item to cart
export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return apiError('Unauthorized', HTTP.UNAUTHORIZED);
  }

  try {
    const body = await req.json();
    const parsed = addToCartSchema.safeParse(body);

    if (!parsed.success) {
      return apiError(parsed.error.errors[0].message, HTTP.BAD_REQUEST);
    }

    const { projectId, tier } = parsed.data;

    // Verify project exists and is published
    const project = await prisma.project.findUnique({
      where: { id: projectId, isPublished: true },
    });
    if (!project) {
      return apiError('Project not found', HTTP.NOT_FOUND);
    }

    // Upsert cart (create if not exists)
    const cart = await prisma.cart.upsert({
      where: { userId: session.user.id },
      update: {},
      create: { userId: session.user.id },
    });

    // Add or update item in cart
    await prisma.cartItem.upsert({
      where: { cartId_projectId: { cartId: cart.id, projectId } },
      update: { tier },
      create: { cartId: cart.id, projectId, tier },
    });

    return apiSuccess(null, 'Item added to cart', HTTP.OK);
  } catch (err) {
    console.error('[Cart POST]', err);
    return apiError('Failed to add to cart', HTTP.INTERNAL_SERVER_ERROR, err);
  }
}

// DELETE - remove item from cart
export async function DELETE(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return apiError('Unauthorized', HTTP.UNAUTHORIZED);
  }

  try {
    const body = await req.json();
    const parsed = removeFromCartSchema.safeParse(body);

    if (!parsed.success) {
      return apiError(parsed.error.errors[0].message, HTTP.BAD_REQUEST);
    }

    const { projectId } = parsed.data;

    const cart = await prisma.cart.findUnique({
      where: { userId: session.user.id },
    });
    if (!cart) {
      return apiSuccess(null, 'Nothing to remove');
    }

    await prisma.cartItem.deleteMany({
      where: { cartId: cart.id, projectId },
    });

    return apiSuccess(null, 'Item removed from cart');
  } catch (err) {
    console.error('[Cart DELETE]', err);
    return apiError('Failed to remove from cart', HTTP.INTERNAL_SERVER_ERROR, err);
  }
}
