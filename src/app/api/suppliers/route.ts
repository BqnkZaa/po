import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { z } from "zod";

const supplierSchema = z.object({
    companyName: z.string().min(1, "Company name is required"),
    taxId: z.string().optional(),
    address: z.string().optional(),
    phone: z.string().optional(),
    regularPrice: z.coerce.number().min(0).optional(),
});

// GET /api/suppliers — list all suppliers
export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const search = searchParams.get("search") ?? "";

        const suppliers = await db.supplier.findMany({
            where: search
                ? {
                    OR: [
                        { companyName: { contains: search, mode: "insensitive" } },
                        { taxId: { contains: search, mode: "insensitive" } },
                        { contactPerson: { contains: search, mode: "insensitive" } },
                    ],
                }
                : undefined,
            orderBy: { companyName: "asc" },
        });

        return NextResponse.json(suppliers);
    } catch (error) {
        console.error("[SUPPLIERS_GET]", error);
        return NextResponse.json({ error: "Failed to fetch suppliers" }, { status: 500 });
    }
}

// POST /api/suppliers — create a new supplier
export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const validated = supplierSchema.safeParse(body);

        if (!validated.success) {
            return NextResponse.json(
                { error: "Validation failed", details: validated.error.flatten() },
                { status: 400 }
            );
        }

        const supplier = await db.supplier.create({
            data: {
                companyName: validated.data.companyName,
                taxId: validated.data.taxId,
                address: validated.data.address,
                phone: validated.data.phone,
                regularPrice: validated.data.regularPrice || 0,
            },
        });

        return NextResponse.json(supplier, { status: 201 });
    } catch (error) {
        console.error("[SUPPLIERS_POST]", error);
        return NextResponse.json({ error: "Failed to create supplier" }, { status: 500 });
    }
}
