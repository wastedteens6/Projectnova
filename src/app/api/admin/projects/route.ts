import { NextRequest } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { apiSuccess, apiError, HTTP } from '@/lib/api-response';
import { requireAdmin } from '@/lib/admin-guard';
import { z } from 'zod';
import { Category } from '@prisma/client';

const createProjectSchema = z.object({
  title: z.string().min(3).max(200).trim(),
  slug: z.string().min(3).max(200).trim().regex(/^[a-z0-9-]+$/, 'Slug must be lowercase alphanumeric with hyphens'),
  description: z.string().min(20).trim(),
  category: z.nativeEnum(Category),
  techStack: z.array(z.string().min(1)).min(1),
  features: z.array(z.string().min(1)).min(1),
  tier1Price: z.number().positive(),
  tier1Features: z.array(z.string()).min(1),
  tier1Files: z.record(z.string()).default({}),
  tier2Price: z.number().positive(),
  tier2Features: z.array(z.string()).min(1),
  tier2Files: z.record(z.string()).default({}),
  tier3Price: z.number().positive(),
  tier3Features: z.array(z.string()).min(1),
  tier3Files: z.record(z.string()).default({}),
  images: z.array(z.string()).default([]),
  thumbnailUrl: z.string().optional(),
  videoUrl: z.string().optional(),
  isPublished: z.boolean().default(false),
});

// GET — list all projects (including unpublished)
export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  const authErr = requireAdmin(session);
  if (authErr) return authErr;

  const { searchParams } = new URL(req.url);
  const page = Math.max(1, parseInt(searchParams.get('page') ?? '1'));
  const limit = 20;

  try {
    const [projects, total] = await Promise.all([
      prisma.project.findMany({
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          title: true,
          slug: true,
          category: true,
          tier1Price: true,
          tier2Price: true,
          tier3Price: true,
          views: true,
          isPublished: true,
          createdAt: true,
        },
      }),
      prisma.project.count(),
    ]);

    return apiSuccess({ projects, total, page, pages: Math.ceil(total / limit) });
  } catch (err) {
    console.error('[Admin Projects GET]', err);
    return apiError('Failed to fetch projects', HTTP.INTERNAL_SERVER_ERROR, err);
  }
}

// POST — create a new project
export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  const authErr = requireAdmin(session);
  if (authErr) return authErr;

  try {
    const body = await req.json();
    const parsed = createProjectSchema.safeParse(body);
    if (!parsed.success) {
      return apiError(parsed.error.errors[0].message, HTTP.BAD_REQUEST);
    }

    // Check slug uniqueness
    const existing = await prisma.project.findUnique({ where: { slug: parsed.data.slug } });
    if (existing) {
      return apiError('A project with this slug already exists', HTTP.CONFLICT);
    }

    const project = await prisma.project.create({ data: parsed.data });
    return apiSuccess(project, 'Project created', HTTP.CREATED);
  } catch (err) {
    console.error('[Admin Projects POST]', err);
    return apiError('Failed to create project', HTTP.INTERNAL_SERVER_ERROR, err);
  }
}
