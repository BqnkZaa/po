import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { z } from "zod";

const supplierUpdateSchema = z.object({
    companyName: z.string().min(1).optional(),
    taxId: z.string().optional(),
    address: z.string().optional(),
    contactPerson: z.string().optional(),
    phone: z.string().optional(),
    email: z.string().email().optional().or(z.literal("")),
    regularPrice: z.coerce.number().min(0).optional(),
});

type Params = { params: Promise<{ id: string }> };

// GET /api/suppliers/[id]
export async function GET(_req: NextRequest, { params }: Params) {
    try {
        const { id } = await params;
        const supplier = await db.supplier.findUnique({
            where: { id },
            include: { purchaseOrders: { orderBy: { createdAt: "desc" }, take: 10 } },
        });

        if (!supplier) {
            return NextResponse.json({ error: "Supplier not found" }, { status: 404 });
        }

        return NextResponse.json(supplier);
    } catch (error) {
        console.error("[SUPPLIER_GET]", error);
        return NextResponse.json({ error: "Failed to fetch supplier" }, { status: 500 });
    }
}

// PATCH /api/suppliers/[id]
export async function PATCH(request: NextRequest, { params }: Params) {
    try {
        const { id } = await params;
        const body = await request.json();
        const validated = supplierUpdateSchema.safeParse(body);

        if (!validated.success) {
            return NextResponse.json(
                { error: "Validation failed", details: validated.error.flatten() },
                { status: 400 }
            );
        }

        const supplier = await db.supplier.update({
            where: { id },
            data: {
                ...validated.data,
                email: validated.data.email || null,
                regularPrice: validated.data.regularPrice,
            },
        });

        return NextResponse.json(supplier);
    } catch (error) {
        console.error("[SUPPLIER_PATCH]", error);
        return NextResponse.json({ error: "Failed to update supplier" }, { status: 500 });
    }
}

// DELETE /api/suppliers/[id]
export async function DELETE(_req: NextRequest, { params }: Params) {
    try {
        const { id } = await params;

        // Check if supplier has any purchase orders
        const poCount = await db.purchaseOrder.count({ where: { supplierId: id } });
        if (poCount > 0) {
            return NextResponse.json(
                { error: `Cannot delete supplier with ${poCount} existing purchase order(s)` },
                { status: 409 }
            );
        }

        await db.supplier.delete({ where: { id } });
        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("[SUPPLIER_DELETE]", error);
        return NextResponse.json({ error: "Failed to delete supplier" }, { status: 500 });
    }
}
