import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  await prisma.termsDocument.upsert({
    where: { id: 'default-terms' },
    update: {},
    create: {
      id: 'default-terms',
      title: 'Car Pool Panchsheel Greens 2 Terms',
      content:
        '1. Cost sharing only. No commercial usage.\\n2. Residents only with admin approval.\\n3. Follow punctuality and safe driving norms.\\n4. Respect confirmed seats and pickup time.',
      version: '1.0',
      active: true,
    },
  });

  const charges = [
    { routeName: 'PG2 to Noida Sector 62', amount: 80, orderNo: 1 },
    { routeName: 'PG2 to Noida Sector 63', amount: 90, orderNo: 2 },
    { routeName: 'PG2 to Delhi Connaught Place', amount: 220, orderNo: 3 },
  ];

  for (const item of charges) {
    const existing = await prisma.chargeItem.findFirst({
      where: { routeName: item.routeName },
    });

    if (!existing) {
      await prisma.chargeItem.create({ data: item });
    }
  }
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (error) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });
