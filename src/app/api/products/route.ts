import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { z } from "zod";

const productSchema = z.object({
    sku: z.string().min(1, "SKU is required"),
    name: z.string().min(1, "Product name is required"),
    description: z.string().optional(),
    defaultPrice: z.number().positive("Price must be positive"),
    unit: z.string().min(1, "Unit is required"),
});

// GET /api/products — list all products
export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const search = searchParams.get("search") ?? "";

        const products = await db.product.findMany({
            where: search
                ? {
                    OR: [
                        { name: { contains: search, mode: "insensitive" } },
                        { sku: { contains: search, mode: "insensitive" } },
                        { description: { contains: search, mode: "insensitive" } },
                    ],
                }
                : undefined,
            orderBy: { name: "asc" },
        });

        return NextResponse.json(products);
    } catch (error) {
        console.error("[PRODUCTS_GET]", error);
        return NextResponse.json({ error: "Failed to fetch products" }, { status: 500 });
    }
}

// POST /api/products — create a new product
export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const validated = productSchema.safeParse(body);

        if (!validated.success) {
            return NextResponse.json(
                { error: "Validation failed", details: validated.error.flatten() },
                { status: 400 }
            );
        }

        // Check for duplicate SKU
        const existing = await db.product.findUnique({ where: { sku: validated.data.sku } });
        if (existing) {
            return NextResponse.json({ error: `SKU "${validated.data.sku}" already exists` }, { status: 409 });
        }

        const product = await db.product.create({
            data: {
                sku: validated.data.sku,
                name: validated.data.name,
                description: validated.data.description,
                defaultPrice: validated.data.defaultPrice,
                unit: validated.data.unit,
            },
        });

        return NextResponse.json(product, { status: 201 });
    } catch (error) {
        console.error("[PRODUCTS_POST]", error);
        return NextResponse.json({ error: "Failed to create product" }, { status: 500 });
    }
}
