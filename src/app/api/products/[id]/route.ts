import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { z } from "zod";

const productUpdateSchema = z.object({
    sku: z.string().min(1).optional(),
    name: z.string().min(1).optional(),
    description: z.string().optional(),
    defaultPrice: z.number().positive().optional(),
    unit: z.string().min(1).optional(),
});

type Params = { params: Promise<{ id: string }> };

// GET /api/products/[id]
export async function GET(_req: NextRequest, { params }: Params) {
    try {
        const { id } = await params;
        const product = await db.product.findUnique({ where: { id } });

        if (!product) {
            return NextResponse.json({ error: "Product not found" }, { status: 404 });
        }

        return NextResponse.json(product);
    } catch (error) {
        console.error("[PRODUCT_GET]", error);
        return NextResponse.json({ error: "Failed to fetch product" }, { status: 500 });
    }
}

// PATCH /api/products/[id]
export async function PATCH(request: NextRequest, { params }: Params) {
    try {
        const { id } = await params;
        const body = await request.json();
        const validated = productUpdateSchema.safeParse(body);

        if (!validated.success) {
            return NextResponse.json(
                { error: "Validation failed", details: validated.error.flatten() },
                { status: 400 }
            );
        }

        // Check for SKU conflict if SKU is being updated
        if (validated.data.sku) {
            const conflict = await db.product.findFirst({
                where: { sku: validated.data.sku, NOT: { id } },
            });
            if (conflict) {
                return NextResponse.json({ error: `SKU "${validated.data.sku}" already exists` }, { status: 409 });
            }
        }

        const product = await db.product.update({
            where: { id },
            data: validated.data,
        });

        return NextResponse.json(product);
    } catch (error) {
        console.error("[PRODUCT_PATCH]", error);
        return NextResponse.json({ error: "Failed to update product" }, { status: 500 });
    }
}

// DELETE /api/products/[id]
export async function DELETE(_req: NextRequest, { params }: Params) {
    try {
        const { id } = await params;

        const usageCount = await db.poItem.count({ where: { productId: id } });
        if (usageCount > 0) {
            return NextResponse.json(
                { error: `Cannot delete product used in ${usageCount} purchase order item(s)` },
                { status: 409 }
            );
        }

        await db.product.delete({ where: { id } });
        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("[PRODUCT_DELETE]", error);
        return NextResponse.json({ error: "Failed to delete product" }, { status: 500 });
    }
}
