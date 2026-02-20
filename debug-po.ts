
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    const latestPO = await prisma.purchaseOrder.findFirst({
        orderBy: { createdAt: 'desc' },
        include: { items: true },
    });

    if (!latestPO) {
        console.log('No PO found');
        return;
    }

    console.log(`Latest PO: ${latestPO.poNumber}`);
    console.log('Items:');
    latestPO.items.forEach((item) => {
        console.log(`- ${item.itemName} (Type: ${item.itemType})`);
        console.log(`  Quantity: ${item.quantity}`);
        console.log(`  UnitPrice: ${item.unitPrice}`);
        console.log(`  TotalPrice: ${item.totalPrice}`);
    });
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
