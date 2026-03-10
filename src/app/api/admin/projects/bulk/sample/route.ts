import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { requireAdmin } from '@/lib/admin-guard';
import * as XLSX from 'xlsx';

export async function GET() {
  const session = await getServerSession(authOptions);
  const authErr = requireAdmin(session);
  if (authErr) return authErr;

  try {
    const data = [
      {
        'Title': 'Sample E-Commerce Project',
        'Category': 'WEB',
        'Description': 'A full-featured e-commerce platform built with MERN stack.',
        'Tech Stack': 'React, Node.js, MongoDB, Express',
        'Features': 'User Auth, Payment Integration, Admin Dashboard',
        'Tier 1 Price': 4999,
        'Tier 1 Google Drive Link': 'https://drive.google.com/sample1',
        'Tier 1 Features': 'Full Source Code, Basic Documentation',
        'Tier 2 Price': 7499,
        'Tier 2 Google Drive Link': 'https://drive.google.com/sample2',
        'Tier 2 Features': 'Full Source Code, Setup Videos, Advanced Docs',
        'Tier 3 Price': 9999,
        'Tier 3 Google Drive Link': 'https://drive.google.com/sample3',
        'Tier 3 Features': 'Full Source Code, Setup Videos, 1 month Premium Support',
      }
    ];

    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Projects');

    // Add a second sheet with instructions or category list
    const categories = [['Valid Categories'], ['AI'], ['WEB'], ['ML'], ['IOT'], ['DBMS'], ['MOBILE'], ['BLOCKCHAIN'], ['CYBERSECURITY'], ['DATA']];
    const categorySheet = XLSX.utils.aoa_to_sheet(categories);
    XLSX.utils.book_append_sheet(workbook, categorySheet, 'Categories');

    const buffer = XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' });

    return new NextResponse(buffer, {
      status: 200,
      headers: {
        'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'Content-Disposition': 'attachment; filename=project_bulk_upload_sample.xlsx',
      },
    });
  } catch (err) {
    console.error('[Admin Bulk Sample GET]', err);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}
