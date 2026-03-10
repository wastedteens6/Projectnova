import { NextRequest } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { apiSuccess, apiError, HTTP } from '@/lib/api-response';
import { requireAdmin } from '@/lib/admin-guard';
import { z } from 'zod';
import { Category } from '@prisma/client';

const updateProjectSchema = z.object({
  title: z.string().min(3).max(200).trim().optional(),
  description: z.string().min(3).trim().optional(), // Loosened for flexibility
  category: z.nativeEnum(Category).optional(),
  techStack: z.array(z.string()).optional(),
  features: z.array(z.string()).optional(),
  tier1Price: z.number().positive().optional(),
  tier1Features: z.array(z.string()).optional(),
  tier1Files: z.any().optional(), // Using any for Json flexibility
  tier2Price: z.number().positive().optional(),
  tier2Features: z.array(z.string()).optional(),
  tier2Files: z.any().optional(),
  tier3Price: z.number().positive().optional(),
  tier3Features: z.array(z.string()).optional(),
  tier3Files: z.any().optional(),
  images: z.array(z.string()).optional(),
  thumbnailUrl: z.string().optional(),
  videoUrl: z.string().optional(),
  isPublished: z.boolean().optional(),
});

// GET — fetch a single project for editing
export async function GET(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions);
  const authErr = requireAdmin(session);
  if (authErr) return authErr;

  try {
    const project = await prisma.project.findUnique({
      where: { id: params.id },
    });

    if (!project) return apiError('Project not found', HTTP.NOT_FOUND);

    return apiSuccess(project);
  } catch (err) {
    console.error('[Admin Project GET]', err);
    return apiError('Failed to fetch project', HTTP.INTERNAL_SERVER_ERROR, err);
  }
}

// PUT — update a project
export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions);
  const authErr = requireAdmin(session);
  if (authErr) return authErr;

  try {
    const body = await req.json();
    const parsed = updateProjectSchema.safeParse(body);
    if (!parsed.success) {
      return apiError(parsed.error.errors[0].message, HTTP.BAD_REQUEST);
    }

    const project = await prisma.project.update({
      where: { id: params.id },
      data: parsed.data,
    });

    return apiSuccess(project, 'Project updated');
  } catch (err) {
    console.error('[Admin Project PUT]', err);
    return apiError('Failed to update project', HTTP.INTERNAL_SERVER_ERROR, err);
  }
}

// DELETE — delete a project
export async function DELETE(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions);
  // Only ADMIN can delete
  const authErr = requireAdmin(session, ['ADMIN']);
  if (authErr) return authErr;

  try {
    await prisma.project.delete({ where: { id: params.id } });
    return apiSuccess(null, 'Project deleted');
  } catch (err) {
    console.error('[Admin Project DELETE]', err);
    return apiError('Failed to delete project', HTTP.INTERNAL_SERVER_ERROR, err);
  }
}
