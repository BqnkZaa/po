import { PrismaClient, Role } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
    console.log("🌱 Seeding database...");

    // ─── Users ───────────────────────────────────────────────────────────────
    const admin = await prisma.user.upsert({
        where: { email: "admin@tri-ek.com" },
        update: {},
        create: {
            name: "Admin Tri-Ek",
            email: "admin@tri-ek.com",
            role: Role.ADMIN,
        },
    });

    const purchaser = await prisma.user.upsert({
        where: { email: "purchaser@tri-ek.com" },
        update: {},
        create: {
            name: "Somchai Jaidee",
            email: "purchaser@tri-ek.com",
            role: Role.PURCHASER,
        },
    });

    console.log(`✅ Users created: ${admin.name}, ${purchaser.name}`);

    // ─── Suppliers ───────────────────────────────────────────────────────────
    const suppliers = await Promise.all([
        prisma.supplier.upsert({
            where: { id: "supplier-001" },
            update: {},
            create: {
                id: "supplier-001",
                companyName: "บริษัท ไทยฟู้ดส์ จำกัด",
                taxId: "0105555000001",
                address: "123 ถ.สุขุมวิท แขวงคลองเตย เขตคลองเตย กรุงเทพฯ 10110",
                contactPerson: "คุณสมศรี วงศ์ดี",
                phone: "02-123-4567",
                email: "contact@thaifoods.co.th",
            },
        }),
        prisma.supplier.upsert({
            where: { id: "supplier-002" },
            update: {},
            create: {
                id: "supplier-002",
                companyName: "ห้างหุ้นส่วนจำกัด เครื่องเทศไทย",
                taxId: "0105555000002",
                address: "456 ถ.พระราม 2 แขวงบางมด เขตจอมทอง กรุงเทพฯ 10150",
                contactPerson: "คุณวิชัย ใจดี",
                phone: "02-234-5678",
                email: "info@thaispicess.co.th",
            },
        }),
        prisma.supplier.upsert({
            where: { id: "supplier-003" },
            update: {},
            create: {
                id: "supplier-003",
                companyName: "บริษัท แพ็คเกจจิ้งไทย จำกัด",
                taxId: "0105555000003",
                address: "789 ถ.บางนา-ตราด แขวงบางนา เขตบางนา กรุงเทพฯ 10260",
                contactPerson: "คุณมาลี รักดี",
                phone: "02-345-6789",
                email: "sales@thaipackaging.co.th",
            },
        }),
        prisma.supplier.upsert({
            where: { id: "supplier-004" },
            update: {},
            create: {
                id: "supplier-004",
                companyName: "บริษัท น้ำมันพืชไทย จำกัด (มหาชน)",
                taxId: "0105555000004",
                address: "321 ถ.รัชดาภิเษก แขวงดินแดง เขตดินแดง กรุงเทพฯ 10400",
                contactPerson: "คุณประสิทธิ์ ดีงาม",
                phone: "02-456-7890",
                email: "purchase@thaioil.co.th",
            },
        }),
        prisma.supplier.upsert({
            where: { id: "supplier-005" },
            update: {},
            create: {
                id: "supplier-005",
                companyName: "บริษัท น้ำตาลมิตรผล จำกัด",
                taxId: "0105555000005",
                address: "654 ถ.วิภาวดีรังสิต แขวงลาดยาว เขตจตุจักร กรุงเทพฯ 10900",
                contactPerson: "คุณสุดา ทองดี",
                phone: "02-567-8901",
                email: "b2b@mitrphol.com",
            },
        }),
    ]);

    console.log(`✅ Suppliers created: ${suppliers.length}`);

    // ─── Products ─────────────────────────────────────────────────────────────
    const products = await Promise.all([
        prisma.product.upsert({
            where: { sku: "RM-FLOUR-001" },
            update: {},
            create: {
                sku: "RM-FLOUR-001",
                name: "แป้งสาลีอเนกประสงค์",
                description: "แป้งสาลีอเนกประสงค์ คุณภาพสูง บรรจุถุง 25 กก.",
                defaultPrice: 850.00,
                unit: "ถุง",
            },
        }),
        prisma.product.upsert({
            where: { sku: "RM-SUGAR-001" },
            update: {},
            create: {
                sku: "RM-SUGAR-001",
                name: "น้ำตาลทรายขาว",
                description: "น้ำตาลทรายขาวบริสุทธิ์ บรรจุถุง 50 กก.",
                defaultPrice: 1250.00,
                unit: "ถุง",
            },
        }),
        prisma.product.upsert({
            where: { sku: "RM-SALT-001" },
            update: {},
            create: {
                sku: "RM-SALT-001",
                name: "เกลือสมุทร",
                description: "เกลือสมุทรบริสุทธิ์ เกรดอาหาร บรรจุถุง 25 กก.",
                defaultPrice: 180.00,
                unit: "ถุง",
            },
        }),
        prisma.product.upsert({
            where: { sku: "RM-OIL-001" },
            update: {},
            create: {
                sku: "RM-OIL-001",
                name: "น้ำมันพืช",
                description: "น้ำมันพืชบริสุทธิ์ บรรจุแกลลอน 18 ลิตร",
                defaultPrice: 650.00,
                unit: "แกลลอน",
            },
        }),
        prisma.product.upsert({
            where: { sku: "RM-SAUCE-001" },
            update: {},
            create: {
                sku: "RM-SAUCE-001",
                name: "ซอสปรุงรส",
                description: "ซอสปรุงรสสูตรพิเศษ บรรจุขวด 700 มล.",
                defaultPrice: 45.00,
                unit: "ขวด",
            },
        }),
        prisma.product.upsert({
            where: { sku: "PK-BOX-001" },
            update: {},
            create: {
                sku: "PK-BOX-001",
                name: "กล่องกระดาษลูกฟูก",
                description: "กล่องกระดาษลูกฟูก 3 ชั้น ขนาด 40x30x20 ซม.",
                defaultPrice: 12.50,
                unit: "ใบ",
            },
        }),
        prisma.product.upsert({
            where: { sku: "PK-BAG-001" },
            update: {},
            create: {
                sku: "PK-BAG-001",
                name: "ถุงพลาสติกใส",
                description: "ถุงพลาสติกใส PE เกรดอาหาร ขนาด 20x30 ซม.",
                defaultPrice: 0.80,
                unit: "ใบ",
            },
        }),
        prisma.product.upsert({
            where: { sku: "RM-PEPPER-001" },
            update: {},
            create: {
                sku: "RM-PEPPER-001",
                name: "พริกไทยป่น",
                description: "พริกไทยป่นละเอียด เกรดอาหาร บรรจุถุง 1 กก.",
                defaultPrice: 220.00,
                unit: "ถุง",
            },
        }),
        prisma.product.upsert({
            where: { sku: "RM-GARLIC-001" },
            update: {},
            create: {
                sku: "RM-GARLIC-001",
                name: "กระเทียมสด",
                description: "กระเทียมสดคัดพิเศษ บรรจุตาข่าย 10 กก.",
                defaultPrice: 350.00,
                unit: "ตาข่าย",
            },
        }),
        prisma.product.upsert({
            where: { sku: "RM-STARCH-001" },
            update: {},
            create: {
                sku: "RM-STARCH-001",
                name: "แป้งมันสำปะหลัง",
                description: "แป้งมันสำปะหลังบริสุทธิ์ เกรดอาหาร บรรจุถุง 25 กก.",
                defaultPrice: 420.00,
                unit: "ถุง",
            },
        }),
        // ── New Products for PO Create Page ──
        prisma.product.upsert({
            where: { sku: "DEMO-NOODLE-001" },
            update: {},
            create: {
                sku: "DEMO-NOODLE-001", // Hypothetical SKU
                name: "บะหมี่ลวกเส้น",
                description: "บะหมี่ลวกเส้นพร้อมปรุง",
                defaultPrice: 0.00,
                unit: "ห่อ",
            },
        }),
        prisma.product.upsert({
            where: { sku: "DEMO-KHAOSOI-001" },
            update: {},
            create: {
                sku: "DEMO-KHAOSOI-001", // Hypothetical SKU
                name: "ข้าวซอยลวกเส้นสด",
                description: "ข้าวซอยลวกเส้นสดพร้อมปรุง",
                defaultPrice: 0.00,
                unit: "ห่อ",
            },
        }),
        prisma.product.upsert({
            where: { sku: "DEMO-JADE-001" },
            update: {},
            create: {
                sku: "DEMO-JADE-001", // Hypothetical SKU
                name: "หยกเส้นลวก", // Matches "หยกเส้นลวก" from screenshot
                description: "บะหมี่หยกเส้นลวกพร้อมปรุง",
                defaultPrice: 0.00,
                unit: "ห่อ",
            },
        }),
    ]);

    console.log(`✅ Products created: ${products.length}`);
    console.log("🎉 Seeding completed successfully!");
}

main()
    .catch((e) => {
        console.error("❌ Seeding failed:", e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
