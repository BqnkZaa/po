import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { z } from "zod";
import { PoStatus } from "@prisma/client";

const updatePoSchema = z.object({
    status: z.nativeEnum(PoStatus).optional(),
    deliveryDate: z.string().datetime({ offset: true }).or(z.string().date()).optional(),
    notes: z.string().optional(),
});

type Params = { params: Promise<{ id: string }> };

// GET /api/purchase-orders/[id]
export async function GET(_req: NextRequest, { params }: Params) {
    try {
        const { id } = await params;

        const po = await db.purchaseOrder.findUnique({
            where: { id },
            include: {
                supplier: true,
                user: { select: { id: true, name: true, email: true, role: true } },
                items: {
                    include: {
                        product: true,
                    },
                    orderBy: { id: "asc" },
                },
            },
        });

        if (!po) {
            return NextResponse.json({ error: "Purchase order not found" }, { status: 404 });
        }

        return NextResponse.json(po);
    } catch (error) {
        console.error("[PO_GET_ID]", error);
        return NextResponse.json({ error: "Failed to fetch purchase order" }, { status: 500 });
    }
}

// PATCH /api/purchase-orders/[id] — update status or delivery date
export async function PATCH(request: NextRequest, { params }: Params) {
    try {
        const { id } = await params;
        const body = await request.json();
        const validated = updatePoSchema.safeParse(body);

        if (!validated.success) {
            return NextResponse.json(
                { error: "Validation failed", details: validated.error.flatten() },
                { status: 400 }
            );
        }

        // Enforce valid status transitions
        const current = await db.purchaseOrder.findUnique({ where: { id }, select: { status: true } });
        if (!current) {
            return NextResponse.json({ error: "Purchase order not found" }, { status: 404 });
        }

        if (validated.data.status) {
            const allowedTransitions: Record<PoStatus, PoStatus[]> = {
                DRAFT: ["APPROVED", "CANCELLED"],
                APPROVED: ["SENT", "CANCELLED"],
                SENT: ["CANCELLED"],
                CANCELLED: [],
            };

            const allowed = allowedTransitions[current.status];
            if (!allowed.includes(validated.data.status)) {
                return NextResponse.json(
                    {
                        error: `Cannot transition from ${current.status} to ${validated.data.status}`,
                    },
                    { status: 422 }
                );
            }
        }

        const po = await db.purchaseOrder.update({
            where: { id },
            data: {
                ...(validated.data.status && { status: validated.data.status }),
                ...(validated.data.deliveryDate && { deliveryDate: new Date(validated.data.deliveryDate) }),
                ...(validated.data.notes !== undefined && { notes: validated.data.notes }),
            },
            include: {
                supplier: { select: { id: true, companyName: true } },
                user: { select: { id: true, name: true } },
                items: { include: { product: true } },
            },
        });

        return NextResponse.json(po);
    } catch (error) {
        console.error("[PO_PATCH]", error);
        return NextResponse.json({ error: "Failed to update purchase order" }, { status: 500 });
    }
}

// DELETE /api/purchase-orders/[id] — only DRAFT POs can be deleted
export async function DELETE(_req: NextRequest, { params }: Params) {
    try {
        const { id } = await params;

        const po = await db.purchaseOrder.findUnique({ where: { id }, select: { status: true } });
        if (!po) {
            return NextResponse.json({ error: "Purchase order not found" }, { status: 404 });
        }

        // Allow deleting POs of any status as per user request
        // if (po.status !== "DRAFT") {
        //     return NextResponse.json(
        //         { error: "Only DRAFT purchase orders can be deleted" },
        //         { status: 422 }
        //     );
        // }

        // PoItems are cascade-deleted via schema onDelete: Cascade
        await db.purchaseOrder.delete({ where: { id } });
        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("[PO_DELETE]", error);
        return NextResponse.json({ error: "Failed to delete purchase order" }, { status: 500 });
    }
}
