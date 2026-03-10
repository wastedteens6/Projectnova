import { NextRequest } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { apiSuccess, apiError, HTTP } from '@/lib/api-response';
import { requireAdmin } from '@/lib/admin-guard';
import * as XLSX from 'xlsx';
import { Category } from '@prisma/client';

const autoSlug = (title: string) =>
  title.toLowerCase().replace(/[^a-z0-9\s-]/g, '').replace(/\s+/g, '-').replace(/-+/g, '-').trim();

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  const authErr = requireAdmin(session);
  if (authErr) return authErr;

  try {
    const formData = await req.formData();
    const file = formData.get('file') as Blob;

    if (!file) {
      return apiError('No file uploaded', HTTP.BAD_REQUEST);
    }

    const buffer = await file.arrayBuffer();
    const workbook = XLSX.read(buffer);
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    const data = XLSX.utils.sheet_to_json(worksheet) as any[];

    if (data.length === 0) {
      return apiError('Excel file is empty', HTTP.BAD_REQUEST);
    }

    const projectsToCreate = [];
    const errors: string[] = [];

    for (const [index, row] of data.entries()) {
      const rowNum = index + 2; // +1 for 0-index, +1 for header
      
      try {
        // Basic Validation
        if (!row.Title || !row.Category || !row.Description) {
          errors.push(`Row ${rowNum}: Missing required fields (Title, Category, or Description)`);
          continue;
        }

        const category = row.Category.toUpperCase();
        if (!Object.values(Category).includes(category as Category)) {
          errors.push(`Row ${rowNum}: Invalid category "${row.Category}"`);
          continue;
        }

        const slug = autoSlug(row.Title);
        
        // Tier 1 Files format { driveId: "...", type: "file/folder" }
        const tier1Files = { driveId: row['Tier 1 Google Drive Link'] || '', type: 'folder' };
        const tier2Files = { driveId: row['Tier 2 Google Drive Link'] || '', type: 'folder' };
        const tier3Files = { driveId: row['Tier 3 Google Drive Link'] || '', type: 'folder' };

        projectsToCreate.push({
          title: row.Title,
          slug,
          category: category as Category,
          description: row.Description,
          techStack: row['Tech Stack'] ? row['Tech Stack'].split(',').map((s: string) => s.trim()) : [],
          features: row.Features ? row.Features.split(',').map((s: string) => s.trim()) : [],
          tier1Price: parseFloat(row['Tier 1 Price']) || 0,
          tier1Features: row['Tier 1 Features'] ? row['Tier 1 Features'].split(',').map((s: string) => s.trim()) : [],
          tier1Files,
          tier2Price: parseFloat(row['Tier 2 Price']) || 0,
          tier2Features: row['Tier 2 Features'] ? row['Tier 2 Features'].split(',').map((s: string) => s.trim()) : [],
          tier2Files,
          tier3Price: parseFloat(row['Tier 3 Price']) || 0,
          tier3Features: row['Tier 3 Features'] ? row['Tier 3 Features'].split(',').map((s: string) => s.trim()) : [],
          tier3Files,
          isPublished: false, // Default to false
        });
      } catch (err) {
        errors.push(`Row ${rowNum}: Unexpected error - ${err instanceof Error ? err.message : String(err)}`);
      }
    }

    if (errors.length > 0) {
      return apiError('Validation failed', HTTP.BAD_REQUEST, { errors });
    }

    // Check slug uniqueness for all projects
    const slugs = projectsToCreate.map(p => p.slug);
    const existing = await prisma.project.findMany({
        where: { slug: { in: slugs } },
        select: { slug: true }
    });

    if (existing.length > 0) {
        return apiError('Duplicate slugs found in database', HTTP.CONFLICT, { 
            duplicates: existing.map(e => e.slug)
        });
    }

    // Bulk creation (Prisma supports createMany, but some relational logic might be tricky if any, 
    // but here Project is standalone in terms of creation)
    await prisma.project.createMany({
        data: projectsToCreate,
        skipDuplicates: false,
    });

    return apiSuccess({ count: projectsToCreate.length }, `${projectsToCreate.length} projects uploaded successfully`);
  } catch (err) {
    console.error('[Admin Bulk Upload POST]', err);
    return apiError('Failed to process bulk upload', HTTP.INTERNAL_SERVER_ERROR, err);
  }
}
