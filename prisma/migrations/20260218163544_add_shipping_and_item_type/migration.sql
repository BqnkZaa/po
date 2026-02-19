-- CreateEnum
CREATE TYPE "ItemType" AS ENUM ('STANDARD', 'MANUAL', 'OTHER');

-- DropForeignKey
ALTER TABLE "po_items" DROP CONSTRAINT "po_items_product_id_fkey";

-- AlterTable
ALTER TABLE "po_items" ADD COLUMN     "item_type" "ItemType" NOT NULL DEFAULT 'STANDARD',
ALTER COLUMN "product_id" DROP NOT NULL;

-- AlterTable
ALTER TABLE "purchase_orders" ADD COLUMN     "shipping_cost" DECIMAL(10,2) NOT NULL DEFAULT 0;

-- AddForeignKey
ALTER TABLE "po_items" ADD CONSTRAINT "po_items_product_id_fkey" FOREIGN KEY ("product_id") REFERENCES "products"("id") ON DELETE SET NULL ON UPDATE CASCADE;
