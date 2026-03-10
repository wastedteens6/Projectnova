import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const project = await prisma.project.findUnique({
    where: { slug: 'ecommerce-mern-platform' },
    select: { title: true, images: true, thumbnailUrl: true },
  });

  console.log('Project:', project?.title);
  console.log('Images:', project?.images);
  console.log('Thumbnail:', project?.thumbnailUrl);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
