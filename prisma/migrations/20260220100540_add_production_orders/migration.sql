-- CreateEnum
CREATE TYPE "ProductionStatus" AS ENUM ('PENDING', 'IN_PROGRESS', 'COMPLETED', 'PROBLEM');

-- AlterTable
ALTER TABLE "po_items" ALTER COLUMN "quantity" SET DATA TYPE DECIMAL(19,8),
ALTER COLUMN "unit_price" SET DATA TYPE DECIMAL(19,8),
ALTER COLUMN "total_price" SET DATA TYPE DECIMAL(19,8);

-- AlterTable
ALTER TABLE "products" ALTER COLUMN "default_price" SET DATA TYPE DECIMAL(19,8);

-- AlterTable
ALTER TABLE "purchase_orders" ALTER COLUMN "subtotal" SET DATA TYPE DECIMAL(19,8),
ALTER COLUMN "discount_amount" SET DATA TYPE DECIMAL(19,8),
ALTER COLUMN "vat_amount" SET DATA TYPE DECIMAL(19,8),
ALTER COLUMN "grand_total" SET DATA TYPE DECIMAL(19,8),
ALTER COLUMN "shipping_cost" SET DATA TYPE DECIMAL(19,8);

-- AlterTable
ALTER TABLE "suppliers" ADD COLUMN     "regular_price" DECIMAL(19,8) NOT NULL DEFAULT 0;

-- CreateTable
CREATE TABLE "production_orders" (
    "id" TEXT NOT NULL,
    "purchase_order_id" TEXT NOT NULL,
    "status" "ProductionStatus" NOT NULL DEFAULT 'PENDING',
    "problem_note" TEXT,
    "extra_request_qty" DECIMAL(19,8),
    "stock_deducted" BOOLEAN NOT NULL DEFAULT false,
    "started_at" TIMESTAMP(3),
    "completed_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "production_orders_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "production_orders_purchase_order_id_key" ON "production_orders"("purchase_order_id");

-- AddForeignKey
ALTER TABLE "production_orders" ADD CONSTRAINT "production_orders_purchase_order_id_fkey" FOREIGN KEY ("purchase_order_id") REFERENCES "purchase_orders"("id") ON DELETE CASCADE ON UPDATE CASCADE;
