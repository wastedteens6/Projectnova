import { NextRequest } from 'next/server';
import { prisma } from '@/lib/db';
import { apiSuccess, apiError, HTTP } from '@/lib/api-response';
import { projectsQuerySchema } from '@/lib/validations/api.validation';
import { Prisma, Category } from '@prisma/client';

export async function GET(request: NextRequest) {
  try {
    const searchParams = Object.fromEntries(request.nextUrl.searchParams.entries());
    const parsed = projectsQuerySchema.safeParse(searchParams);

    if (!parsed.success) {
      return apiError(parsed.error.errors[0].message, HTTP.BAD_REQUEST);
    }

    const { search, category, techStack, minPrice, maxPrice, sortBy, order, page, limit } = parsed.data;

    // Build strongly-typed filter conditions
    const where: Prisma.ProjectWhereInput = {
      isPublished: true,
    };

    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
      ];
    }

    if (category && category !== 'ALL') {
      where.category = category as Category;
    }

    if (techStack) {
      const techArray = techStack.split(',').map((t) => t.trim()).filter(Boolean);
      if (techArray.length > 0) {
        where.techStack = { hasSome: techArray };
      }
    }

    if (minPrice !== undefined || maxPrice !== undefined) {
      where.tier1Price = {
        ...(minPrice !== undefined && { gte: minPrice }),
        ...(maxPrice !== undefined && { lte: maxPrice }),
      };
    }

    // Strongly-typed sort
    const orderBy: Prisma.ProjectOrderByWithRelationInput = (() => {
      switch (sortBy) {
        case 'price':       return { tier1Price: order };
        case 'popularity':  return { popularity: order };
        case 'views':       return { views: order };
        case 'title':       return { title: order };
        default:            return { createdAt: order };
      }
    })();

    const skip = (page - 1) * limit;

    const [projects, totalCount] = await Promise.all([
      prisma.project.findMany({
        where,
        orderBy,
        skip,
        take: limit,
        select: {
          id: true,
          slug: true,
          title: true,
          description: true,
          category: true,
          techStack: true,
          images: true,
          thumbnailUrl: true,
          tier1Price: true,
          tier2Price: true,
          tier3Price: true,
          views: true,
          popularity: true,
          createdAt: true,
        },
      }),
      prisma.project.count({ where }),
    ]);

    const totalPages = Math.ceil(totalCount / limit);

    return apiSuccess({
      projects,
      pagination: {
        currentPage: page,
        totalPages,
        totalCount,
        limit,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1,
      },
    });
  } catch (err) {
    console.error('[Projects GET]', err);
    return apiError('Failed to fetch projects', HTTP.INTERNAL_SERVER_ERROR, err);
  }
}
