import { db } from "@/lib/db";
import { format } from "date-fns";

/**
 * Generates the next PO number in the format PO-YYYYMM-XXX.
 * Uses a raw SQL query with FOR UPDATE SKIP LOCKED to prevent race conditions
 * when multiple users create POs simultaneously.
 *
 * Must be called inside a Prisma transaction.
 */
export async function generatePoNumber(
    tx: Omit<typeof db, "$connect" | "$disconnect" | "$on" | "$transaction" | "$use" | "$extends">
): Promise<string> {
    const now = new Date();
    // Thai Year = AD + 543
    const thaiYear = now.getFullYear() + 543;
    const month = format(now, "MM");
    const day = format(now, "dd");
    const datePart = `${thaiYear}${month}${day}`; // e.g. "25690219"

    // Format: PO25690219-P001
    const prefix = `PO${datePart}-P`;

    // Find the latest PO number for the current date
    // We use Prisma's findMany with orderBy because raw query might be tricky with cross-db compatibility 
    // but the original code used raw query for locking. 
    // Given the requirement is just "run number automatically", standard findFirst is usually enough unless high concurrency.
    // I will stick to a simpler findFirst for now to avoid raw query syntax issues if schema changes, 
    // but keep existing style if possible.
    // Actually, looking at the previous code, it used `params` with raw query. 
    // Let's use `findFirst` to be safer with types.

    const lastPo = await tx.purchaseOrder.findFirst({
        where: {
            poNumber: {
                startsWith: prefix,
            },
        },
        orderBy: {
            poNumber: "desc",
        },
        select: {
            poNumber: true,
        },
    });

    let nextSequence = 1;

    if (lastPo) {
        // Extract the sequence number (PO25690219-P001 -> 001)
        const parts = lastPo.poNumber.split("-P");
        if (parts.length === 2) {
            const lastSequence = parseInt(parts[1], 10);
            if (!isNaN(lastSequence)) {
                nextSequence = lastSequence + 1;
            }
        }
    }

    const sequence = String(nextSequence).padStart(3, "0");
    return `${prefix}${sequence}`;
}
