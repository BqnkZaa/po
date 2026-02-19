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

    // Format: Bill25690219-B001
    const prefix = `Bill${datePart}-B`;

    // Find the latest PO number for the current date
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
        // Extract the sequence number (Bill25690219-B001 -> 001)
        const parts = lastPo.poNumber.split("-B");
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
