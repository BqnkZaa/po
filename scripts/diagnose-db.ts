
import { PrismaClient } from '@prisma/client';

const db = new PrismaClient({
    log: ['query', 'info', 'warn', 'error'],
});

async function main() {
    console.log("Testing DB Connection...");
    try {
        const suppliers = await db.supplier.findMany({ take: 1 });
        console.log("Successfully connected! Found suppliers:", suppliers.length);
        const products = await db.product.findMany({ take: 1 });
        console.log("Successfully connected! Found products:", products.length);
    } catch (e) {
        console.error("DB Connection Failed:", e);
        process.exit(1);
    } finally {
        await db.$disconnect();
    }
}

main();
