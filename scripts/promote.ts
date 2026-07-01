// Usage: npx tsx scripts/promote.ts someone@example.com ADMIN
// (or DEV). Run this after the person has signed up at least once,
// since their User row is only created on first login.

import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const [email, role] = process.argv.slice(2);

  if (!email || !role || !["ADMIN", "DEV", "CLIENT"].includes(role)) {
    console.error("Usage: npx tsx scripts/promote.ts <email> <ADMIN|DEV|CLIENT>");
    process.exit(1);
  }

  const user = await prisma.user.update({
    where: { email },
    data: { role: role as any },
  });

  console.log(`Updated ${user.email} -> ${user.role}`);
}

main()
  .catch((e) => {
    console.error(e.message ?? e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
