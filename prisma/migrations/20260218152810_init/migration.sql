-- CreateEnum
CREATE TYPE "Role" AS ENUM ('ADMIN', 'PURCHASER');

-- CreateEnum
CREATE TYPE "PoStatus" AS ENUM ('DRAFT', 'APPROVED', 'SENT', 'CANCELLED');

-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "role" "Role" NOT NULL DEFAULT 'PURCHASER',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "suppliers" (
    "id" TEXT NOT NULL,
    "company_name" TEXT NOT NULL,
    "tax_id" TEXT,
    "address" TEXT,
    "contact_person" TEXT,
    "phone" TEXT,
    "email" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "suppliers_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "products" (
    "id" TEXT NOT NULL,
    "sku" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "default_price" DECIMAL(10,2) NOT NULL,
    "unit" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "products_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "purchase_orders" (
    "id" TEXT NOT NULL,
    "po_number" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "supplier_id" TEXT NOT NULL,
    "issue_date" TIMESTAMP(3) NOT NULL,
    "delivery_date" TIMESTAMP(3) NOT NULL,
    "subtotal" DECIMAL(12,2) NOT NULL,
    "discount_amount" DECIMAL(12,2) NOT NULL DEFAULT 0,
    "vat_amount" DECIMAL(12,2) NOT NULL,
    "grand_total" DECIMAL(12,2) NOT NULL,
    "status" "PoStatus" NOT NULL DEFAULT 'DRAFT',
    "notes" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "purchase_orders_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "po_items" (
    "id" TEXT NOT NULL,
    "po_id" TEXT NOT NULL,
    "product_id" TEXT NOT NULL,
    "quantity" DECIMAL(10,3) NOT NULL,
    "unit_price" DECIMAL(10,2) NOT NULL,
    "total_price" DECIMAL(12,2) NOT NULL,

    CONSTRAINT "po_items_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "products_sku_key" ON "products"("sku");

-- CreateIndex
CREATE UNIQUE INDEX "purchase_orders_po_number_key" ON "purchase_orders"("po_number");

-- AddForeignKey
ALTER TABLE "purchase_orders" ADD CONSTRAINT "purchase_orders_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "purchase_orders" ADD CONSTRAINT "purchase_orders_supplier_id_fkey" FOREIGN KEY ("supplier_id") REFERENCES "suppliers"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "po_items" ADD CONSTRAINT "po_items_po_id_fkey" FOREIGN KEY ("po_id") REFERENCES "purchase_orders"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "po_items" ADD CONSTRAINT "po_items_product_id_fkey" FOREIGN KEY ("product_id") REFERENCES "products"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
