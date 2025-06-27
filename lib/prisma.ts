import { PrismaClient } from "~/generated/client/client";

// Solusi khusus untuk mem-bypass deteksi Vercel
const createPrismaClient = () => {
  const databaseUrl = process.env.DATABASE_URL;

  // Hapus prefix prisma+ jika ada
  const cleanUrl = databaseUrl?.replace(/^prisma\+postgres:/, "postgresql:");

  return new PrismaClient({
    datasources: {
      db: {
        url: cleanUrl,
      },
    },
  });
};

// Extend globalThis to include prisma property
declare global {
  // eslint-disable-next-line no-var
  var prisma: PrismaClient | undefined;
}

const globalForPrisma = globalThis as typeof globalThis & { prisma?: PrismaClient };
const prisma = globalForPrisma.prisma || createPrismaClient();

export default prisma;

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}
