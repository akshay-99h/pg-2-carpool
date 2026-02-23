import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  await prisma.termsDocument.upsert({
    where: { id: 'default-terms' },
    update: {},
    create: {
      id: 'default-terms',
      title: 'Terms and Condition, Car Pool PG2',
      content: `By joining and remaining in this group, you agree to the following terms:

1. Membership & Eligibility

Resident Only: Participation is strictly limited to verified residents of Panchsheel Greens 2.

2. Cost Sharing & Commercial Use

No Profit: Carpooling must be on a not-for-profit basis. Members may share actual costs (fuel, tolls) but cannot charge for "hire or reward," as using a private (white plate) vehicle for commercial gain is illegal in India.

Pre-agreed Rates: Any cost-sharing must be mutually agreed upon before the journey begins.

3. Group Etiquette & Safety

Stay On-Topic: Post only carpool requests, offers, or essential updates. No spam, advertisements, or "Good Morning" messages.

Punctuality: Both drivers and riders must adhere to agreed timings. Notify the group immediately of any delays or cancellations. Deviations from route is not accepted.

Privacy: Do not share member contact details or personal information outside this group without explicit consent.

Safety: Avoid using ride in the car which is not having society green security sticker if you do not know the person personally specially for ladies.

4. Disclaimers & Liability

No Admin Liability: The group administrators act only as facilitators and are not vicariously liable for any member’s posts or actions.

Personal Responsibility: Members participate at their own risk. The society and admins are not responsible for any accidents, vehicle damage, or personal disputes.

Right to Remove: Admins reserve the right to remove anyone who violates these rules or engages in harassment.

5. Legal Compliance

Participants must follow all local traffic laws.`,
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
