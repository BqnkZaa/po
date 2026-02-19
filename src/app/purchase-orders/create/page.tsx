"use client";

import { useEffect, useState } from "react";
import { useForm, useFieldArray, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { format } from "date-fns";
import { CalendarIcon, Plus, Trash2, Save, X, RefreshCw, FileText, CheckCircle, Loader2, Edit, Box } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Calendar } from "@/components/ui/calendar";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import Header from "@/components/Header";
import NavTabs from "@/components/NavTabs";
import { ProductCombobox } from "@/components/ProductCombobox";
import { OrderSummaryModal } from "@/components/OrderSummaryModal";

// ── Schema ──────────────────────────────────────────────────────────────────
const itemSchema = z.object({
    productId: z.string().optional(),
    productName: z.string().optional(),
    quantity: z.coerce.number().min(0), // Allow 0, will filter out later
    unitPrice: z.coerce.number().min(0),
    unit: z.string().optional(),
});

const poSchema = z.object({
    supplierId: z.string().min(1, "Supplier/Customer is required"),
    issueDate: z.date(),
    deliveryDate: z.date(),
    standardItems: z.array(itemSchema),
    manualItems: z.array(itemSchema),
    otherItems: z.array(itemSchema),
    shippingCost: z.coerce.number().min(0).default(0),
});

type PoFormValues = z.infer<typeof poSchema>;

interface Supplier {
    id: string;
    companyName: string;
    regularPrice: number;
}

interface Product {
    id: string;
    name: string;
    sku: string;
    defaultPrice: number;
    unit: string;
}

// ── Component ───────────────────────────────────────────────────────────────
export default function CreatePurchaseOrderPage() {
    const [suppliers, setSuppliers] = useState<Supplier[]>([]);
    const [products, setProducts] = useState<Product[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const { toast } = useToast();
    const [isReviewOpen, setIsReviewOpen] = useState(false);


    // ── Form Setup ──
    const form = useForm<PoFormValues>({
        resolver: zodResolver(poSchema) as any,
        defaultValues: {
            supplierId: "",
            issueDate: new Date(),
            deliveryDate: new Date(),
            standardItems: [{ productId: "", quantity: 0, unitPrice: 0, unit: "", productName: "" }],
            manualItems: [{ productId: "", quantity: 0, unitPrice: 0, unit: "", productName: "" }],
            otherItems: [],
            shippingCost: 0,
        },
    });

    const { control, handleSubmit, setValue, watch, reset } = form;

    const { fields: standardFields, append: appendStandard, remove: removeStandard } = useFieldArray({
        control,
        name: "standardItems",
    });

    const { fields: manualFields, append: appendManual, remove: removeManual } = useFieldArray({
        control,
        name: "manualItems",
    });

    const { fields: otherFields, append: appendOther, remove: removeOther } = useFieldArray({
        control,
        name: "otherItems",
    });

    // Watch supplierId to trigger price recalculation
    const selectedSupplierId = watch("supplierId");
    const selectedSupplier = suppliers.find(s => s.id === selectedSupplierId);

    // ── Fetch Data ──
    useEffect(() => {
        const fetchData = async () => {
            try {
                console.log("Fetching suppliers and products...");
                const [suppRes, prodRes] = await Promise.all([
                    fetch("/api/suppliers"),
                    fetch("/api/products"),
                ]);

                if (suppRes.ok && prodRes.ok) {
                    const suppData = await suppRes.json();
                    const prodData: Product[] = await prodRes.json();
                    setSuppliers(suppData);
                    setProducts(prodData);

                    // Pre-fill logic will run when supplier is selected or we can init empty
                } else {
                    console.error("Failed to fetch data");
                }
            } catch (error) {
                console.error("Failed to load data", error);
            }
        };
        fetchData();
    }, []); // Fetch once on mount

    // ── Pre-fill Items on Load or Supplier Change (Logic updated to be reactive to supplier) ──
    useEffect(() => {
        // Only pre-fill if we have products and it's the initial load or a reset
        // BUT user requirement implies calculation depends on Customer Price.
        // So if Customer changes, we might want to update prices or re-initialize.
        // For now, let's keep the initial pre-fill but we need to know the price mode.
        // If we want auto-calculation based on Customer, we need to know the customer first.
        // Let's NOT pre-fill immediately on load if it depends on Customer, OR pre-fill with 0/default and update when customer is picked.

        if (products.length > 0 && standardFields.length <= 1 && !form.getValues("standardItems")[0].productId) {
            // Pre-fill items based on specific SKUs or Names
            const targetSKUs = ["DEMO-NOODLE-001", "DEMO-KHAOSOI-001", "DEMO-JADE-001"];
            const prefillProducts = targetSKUs.map(sku => products.find(p => p.sku === sku)).filter(Boolean) as Product[];

            // Fallback
            if (prefillProducts.length < 3) {
                const targetNames = ["บะหมี่ลวกเส้น", "ข้าวซอยลวกเส้นสด", "หยกเส้นลวก"];
                targetNames.forEach((name, idx) => {
                    if (!prefillProducts[idx]) {
                        const found = products.find(p => p.name === name);
                        if (found) prefillProducts[idx] = found;
                    }
                });
            }

            if (prefillProducts.length > 0) {
                // Initial set without customer price (will be updated when customer selected)
                const createItems = (type: "standard" | "manual") => prefillProducts.map(p => {
                    let unitPrice = 0;
                    if (type === "standard") {
                        // Default to Product Price if no customer selected yet
                        unitPrice = (Number(p.defaultPrice) / 2) / 1.07;
                    } else {
                        unitPrice = Number(p.defaultPrice);
                    }
                    return {
                        productId: p.id,
                        productName: p.name,
                        quantity: 0,
                        unitPrice: unitPrice || 0,
                        unit: p.unit
                    };
                });

                const currentValues = form.getValues();
                // Avoid resetting everything if user already typed
                // We only want to set this once initially
                reset({
                    ...currentValues,
                    standardItems: createItems("standard"),
                    manualItems: createItems("manual"),
                });
            }
        }
    }, [products, reset]);

    // ── React to Supplier Change: Update Standard Item Prices ──
    useEffect(() => {
        if (selectedSupplier) {
            const currentStandardItems = form.getValues("standardItems");
            const updatedItems = currentStandardItems.map(item => {
                let basePrice = 0;

                if (selectedSupplier.regularPrice > 0) {
                    // Requirement: Use Customer's Regular Price
                    basePrice = Number(selectedSupplier.regularPrice);
                } else {
                    // Fallback to Product Default Price if Customer has no Regular Price
                    const product = products.find(p => p.id === item.productId);
                    if (product) {
                        basePrice = Number(product.defaultPrice);
                    }
                }

                // Formula: Price / 2 / 1.07
                const newPrice = (basePrice / 2) / 1.07;

                return {
                    ...item,
                    unitPrice: newPrice
                };
            });

            setValue("standardItems", updatedItems);

            if (selectedSupplier.regularPrice > 0) {
                toast({
                    description: `Updated prices for ${selectedSupplier.companyName} (Base: ${selectedSupplier.regularPrice})`,
                });
            } else {
                toast({
                    description: `Reverted prices to default for ${selectedSupplier.companyName}`,
                });
            }
        }
    }, [selectedSupplier, products, setValue, toast]);


    // ── Logic ──
    const handleProductSelect = (
        type: "standard" | "manual" | "other",
        index: number,
        productId: string
    ) => {
        const product = products.find((p) => p.id === productId);
        if (product) {
            const fieldPrefix = type === "standard" ? "standardItems" : type === "manual" ? "manualItems" : "otherItems";
            setValue(`${fieldPrefix}.${index}.productId`, productId);
            setValue(`${fieldPrefix}.${index}.productName`, product.name);
            setValue(`${fieldPrefix}.${index}.unit`, product.unit);

            if (type === "standard") {
                // Logic: If customer selected & has Regular Price -> Use that. Else -> Use Product Default.
                let basePrice = Number(product.defaultPrice);
                if (selectedSupplier && selectedSupplier.regularPrice > 0) {
                    basePrice = Number(selectedSupplier.regularPrice);
                }

                // Formula: Price / 2 / 1.07
                const calculatedPrice = (basePrice / 2) / 1.07;
                setValue(`${fieldPrefix}.${index}.unitPrice`, calculatedPrice);
            } else if (type === "manual") {
                // Manual Item: Do NOT auto-fill price. User enters it.
                // We might want to clear it or keep it 0 to ensure they type it.
                // Check if current value is 0, if so, maybe leave it?
                // Requirement: "Need not reference database price". 
                // So we do nothing to unitPrice here.
            } else {
                setValue(`${fieldPrefix}.${index}.unitPrice`, Number(product.defaultPrice));
            }
        }
    };

    // ── Totals Calculation ──
    const standardItems = watch("standardItems");
    const manualItems = watch("manualItems");
    const otherItems = watch("otherItems");
    const shippingCost = watch("shippingCost") || 0;

    const calculateTotal = (items: any[]) =>
        items.reduce((sum, item) => sum + (item.quantity || 0) * (item.unitPrice || 0), 0);

    const calculateQuantity = (items: any[]) =>
        items.reduce((sum, item) => sum + Number(item.quantity || 0), 0);

    const subtotal = calculateTotal(standardItems) + calculateTotal(manualItems) + calculateTotal(otherItems);
    const totalQuantity = calculateQuantity(standardItems) + calculateQuantity(manualItems) + calculateQuantity(otherItems);

    // Determine VAT rate - assuming 7% as per screenshot
    const vatRate = 0.07;
    const vatAmount = subtotal * vatRate;
    const grandTotal = subtotal + vatAmount + Number(shippingCost);

    // ── Handlers ──
    const handleReview = (data: PoFormValues) => {
        // Basic validation before review
        const validStandard = data.standardItems.filter(i => i.productId && i.quantity > 0);
        // Manual items: valid if (Product OR Name) AND (Quantity > 0 OR Price > 0) - Relaxed?
        // Requirement: "Can be partially filled".
        // But for a PO to be valid, we usually need at least product and quantity.
        // Let's stick to: Must have Product (ID or Name) AND Quantity > 0.
        // If they just put a price, it's weird.
        // But maybe "Quantity" can be 0 if it's a service? No, "Unit Price" implies quantity.
        // Let's assume Valid = (Product ID/Name) AND (Quantity > 0).
        // Empty rows in Manual section should be ignored.
        const validManual = data.manualItems.filter(i => (i.productId || i.productName) && i.quantity > 0);
        const validOther = data.otherItems.filter(i => (i.productId || i.productName) && i.quantity > 0);

        if (validStandard.length === 0 && validManual.length === 0 && validOther.length === 0) {
            toast({ variant: "destructive", title: "Error", description: "Please add at least one item." });
            return;
        }

        setIsReviewOpen(true);
    };

    const handleFinalSubmit = async () => {
        const data = form.getValues();
        setIsReviewOpen(false); // Close modal

        try {
            setIsLoading(true);

            // Filter out empty rows (Already validated, but good to be safe)
            const validStandard = data.standardItems.filter(i => i.productId && i.quantity > 0);
            const validManual = data.manualItems.filter(i => (i.productId || i.productName) && i.quantity > 0);
            const validOther = data.otherItems.filter(i => (i.productId || i.productName) && i.quantity > 0);

            const mapItem = (i: any, type: string) => ({
                productId: i.productId || undefined,
                itemName: i.productName || undefined,
                itemType: type,
                quantity: Number(i.quantity),
                unitPrice: Number(i.unitPrice),
            });

            const payloadItems = [
                ...validStandard.map(i => mapItem(i, "STANDARD")),
                ...validManual.map(i => mapItem(i, "MANUAL")),
                ...validOther.map(i => mapItem(i, "OTHER")),
            ];

            const payload = {
                supplierId: data.supplierId,
                issueDate: data.issueDate,
                deliveryDate: data.deliveryDate,
                shippingCost: Number(data.shippingCost) || 0,
                items: payloadItems,
            };

            const res = await fetch("/api/purchase-orders", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload),
            });

            const json = await res.json();
            if (!res.ok) {
                console.error("API Error Response:", json);
                // Construct a detailed error message
                let errorMessage = json.error || "Failed";
                if (json.details && typeof json.details === 'object') {
                    // Try to flatten generic zod errors if possible, or just stringify
                    const detailsStr = json.details.fieldErrors
                        ? JSON.stringify(json.details.fieldErrors)
                        : JSON.stringify(json.details);
                    errorMessage += ` Details: ${detailsStr}`;
                }
                throw new Error(errorMessage);
            }

            toast({ title: "Success", description: `PO ${json.poNumber} Created!` });
            window.location.href = "/purchase-orders"; // Redirect

        } catch (error: any) {
            toast({ variant: "destructive", title: "Error", description: error.message });
        } finally {
            setIsLoading(false);
        }
    };

    const getSupplierName = (id: string) => {
        const s = suppliers.find(sup => sup.id === id);
        return s ? s.companyName : "Unknown";
    };

    return (
        <div className="min-h-screen bg-[#F3F4F6] pb-20">
            <Header />
            <NavTabs />

            <div className="max-w-[1200px] mx-auto px-4 mt-6 space-y-6">

                {/* ── Create Order Form Header (Green) ── */}
                <div className="bg-[#10b981] text-white p-4 rounded-t-lg flex items-center gap-2 shadow-md">
                    <div className="bg-white/20 p-1.5 rounded-md">
                        <Edit className="w-5 h-5 text-white" />
                    </div>
                    <span className="font-bold text-lg">สร้างออเดอร์ใหม่</span>
                </div>

                <Form {...form}>
                    <form onSubmit={handleSubmit(handleReview, (errors) => {
                        toast({ variant: "destructive", title: "Validation Error", description: "Please check required fields." });
                    })} className="space-y-6">

                        {/* ── General Info ── */}
                        <div className="bg-white p-6 rounded-b-lg shadow-sm -mt-6 border-x border-b border-gray-200 grid grid-cols-1 md:grid-cols-4 gap-6 items-end">
                            <div className="col-span-1">
                                <label className="text-sm font-semibold text-gray-700 block mb-2">เลข PO</label>
                                <Input disabled placeholder="Auto-generated (e.g., PO25690219-P001)" className="bg-[#EFF6FF] text-[#1E40AF] font-bold border-gray-200" />
                            </div>
                            <FormField
                                control={control}
                                name="issueDate"
                                render={({ field }) => (
                                    <FormItem className="flex flex-col">
                                        <FormLabel className="text-sm font-semibold text-gray-700">วันที่สร้างรายการสั่งซื้อ</FormLabel>
                                        <Popover>
                                            <PopoverTrigger asChild>
                                                <FormControl>
                                                    <Button variant={"outline"} className={cn("w-full pl-3 text-left font-normal border-gray-200", !field.value && "text-muted-foreground")}>
                                                        {field.value ? format(field.value, "dd/MM/yyyy") : <span>Pick a date</span>}
                                                        <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                                    </Button>
                                                </FormControl>
                                            </PopoverTrigger>
                                            <PopoverContent className="w-auto p-0" align="start">
                                                <Calendar mode="single" selected={field.value} onSelect={field.onChange} initialFocus />
                                            </PopoverContent>
                                        </Popover>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={control}
                                name="deliveryDate"
                                render={({ field }) => (
                                    <FormItem className="flex flex-col">
                                        <FormLabel className="text-sm font-semibold text-red-500">วันที่จัดส่ง</FormLabel>
                                        <Popover>
                                            <PopoverTrigger asChild>
                                                <FormControl>
                                                    <Button variant={"outline"} className={cn("w-full pl-3 text-left font-normal border-gray-200", !field.value && "text-muted-foreground")}>
                                                        <span className="text-red-500">{field.value ? format(field.value, "dd/MM/yyyy") : <span>Pick a date</span>}</span>
                                                        <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                                    </Button>
                                                </FormControl>
                                            </PopoverTrigger>
                                            <PopoverContent className="w-auto p-0" align="start">
                                                <Calendar mode="single" selected={field.value} onSelect={field.onChange} initialFocus />
                                            </PopoverContent>
                                        </Popover>
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={control}
                                name="supplierId"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel className="text-sm font-semibold text-gray-700">เลือกลูกค้า</FormLabel>
                                        <Select onValueChange={field.onChange} value={field.value}>
                                            <FormControl>
                                                <SelectTrigger className="border-gray-200">
                                                    <SelectValue placeholder="-- เลือกลูกค้า --" />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                {suppliers.map((s) => (
                                                    <SelectItem key={s.id} value={s.id}>{s.companyName}</SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>

                        {/* ── Standard Items (Blue) ── */}
                        <div className="bg-[#F8FAFC] p-4 rounded-lg space-y-3">
                            <div className="flex items-center gap-2 text-base font-bold text-gray-700">
                                <Box className="w-5 h-5 text-gray-400" />
                                <span>รายการสินค้า (ราคาตามค่าขายประจำ)</span>
                            </div>
                            <div className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden">
                                <div className="bg-[#2563EB] text-white py-3 px-4 grid grid-cols-12 gap-4 text-sm font-semibold text-center items-center">
                                    <div className="col-span-5 text-left">สินค้า</div>
                                    <div className="col-span-2">จำนวน</div>
                                    <div className="col-span-2">ราคา/หน่วย</div>
                                    <div className="col-span-2">ราคารวม</div>
                                    <div className="col-span-1"></div>
                                </div>
                                <div className="p-4 space-y-3">
                                    {standardFields.map((field, index) => (
                                        <div key={field.id} className="grid grid-cols-12 gap-4 items-center">
                                            <div className="col-span-5">
                                                <ProductCombobox
                                                    products={products}
                                                    value={form.watch(`standardItems.${index}.productId`)}
                                                    onSelect={(val) => handleProductSelect("standard", index, val)}
                                                    placeholder="เลือกสินค้า"
                                                />
                                            </div>
                                            <div className="col-span-2">
                                                <Input type="number" {...form.register(`standardItems.${index}.quantity`)} className="text-center h-10 border-gray-200" />
                                            </div>
                                            <div className="col-span-2">
                                                <div className="h-10 flex items-center justify-center font-mono text-gray-500">
                                                    {(form.watch(`standardItems.${index}.unitPrice`) || 0).toFixed(8)}
                                                </div>
                                                <input type="hidden" {...form.register(`standardItems.${index}.unitPrice`)} />
                                            </div>
                                            <div className="col-span-2 text-center text-[#2563EB] font-bold font-mono">
                                                {((form.watch(`standardItems.${index}.quantity`) || 0) * (form.watch(`standardItems.${index}.unitPrice`) || 0)).toFixed(8)}
                                            </div>
                                            <div className="col-span-1 flex justify-center">
                                                {standardFields.length > 1 && (
                                                    <Button type="button" variant="ghost" size="icon" className="text-red-400 hover:text-red-600 hover:bg-red-50" onClick={() => removeStandard(index)}>
                                                        <Trash2 className="w-4 h-4" />
                                                    </Button>
                                                )}
                                            </div>
                                        </div>
                                    ))}

                                    {/* Implicitly allow adding since it's an array, but screenshot doesn't show button for this section, maybe pre-filled? 
                                        Actually, usually there is an Add button. I will keep it but make it subtle or check if I should hide it. 
                                        Screenshot shows blank rows. I'll stick to dynamic add for usability.
                                    */}
                                    <Button type="button" variant="ghost" size="sm" className="text-[#2563EB] hover:bg-blue-50 mt-2" onClick={() => appendStandard({ productId: "", quantity: 0, unitPrice: 0 })}>
                                        + เพิ่มรายการ
                                    </Button>
                                </div>
                            </div>
                        </div>

                        {/* ── Manual Items (Orange) ── */}
                        <div className="bg-[#fffbeb] p-4 rounded-lg space-y-3">
                            <div className="flex items-center gap-2 text-base font-bold text-gray-700">
                                <Edit className="w-5 h-5 text-orange-500" />
                                <span>รายการสินค้า (กรอกราคาเอง)</span>
                            </div>
                            <div className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden">
                                <div className="bg-[#D97706] text-white py-3 px-4 grid grid-cols-12 gap-4 text-sm font-semibold text-center items-center">
                                    <div className="col-span-5 text-left">สินค้า</div>
                                    <div className="col-span-2">จำนวน</div>
                                    <div className="col-span-2">ราคา/หน่วย</div>
                                    <div className="col-span-2">ราคารวม</div>
                                    <div className="col-span-1"></div>
                                </div>
                                <div className="p-4 space-y-3">
                                    {manualFields.map((field, index) => (
                                        <div key={field.id} className="grid grid-cols-12 gap-4 items-center bg-[#FEF3C7]/30 p-2 rounded -mx-2">
                                            <div className="col-span-5">
                                                <ProductCombobox
                                                    products={products}
                                                    value={form.watch(`manualItems.${index}.productId`)}
                                                    onSelect={(val) => handleProductSelect("manual", index, val)}
                                                    placeholder="เลือกสินค้า"
                                                />
                                            </div>
                                            <div className="col-span-2">
                                                <Input type="number" {...form.register(`manualItems.${index}.quantity`)} className="text-center h-10 border-gray-200" />
                                            </div>
                                            <div className="col-span-2">
                                                <Input type="number" {...form.register(`manualItems.${index}.unitPrice`)} className="text-center h-10 border-orange-200 bg-white" />
                                            </div>
                                            <div className="col-span-2 text-center text-[#D97706] font-bold font-mono">
                                                {((form.watch(`manualItems.${index}.quantity`) || 0) * (form.watch(`manualItems.${index}.unitPrice`) || 0)).toFixed(8)}
                                            </div>
                                            <div className="col-span-1 flex justify-center">
                                                <Button type="button" variant="ghost" size="icon" className="text-red-400 hover:text-red-600 hover:bg-red-50" onClick={() => removeManual(index)}>
                                                    <Trash2 className="w-4 h-4" />
                                                </Button>
                                            </div>
                                        </div>
                                    ))}
                                    <Button type="button" variant="ghost" size="sm" className="text-[#D97706] hover:bg-orange-50 mt-2" onClick={() => appendManual({ productId: "", quantity: 0, unitPrice: 0 })}>
                                        + เพิ่มรายการ
                                    </Button>
                                </div>
                            </div>
                        </div>

                        {/* ── Other Items (Purple) ── */}
                        <div className="bg-[#f3e8ff] p-4 rounded-lg space-y-3">
                            <div className="flex items-center justify-between text-base font-bold text-gray-700">
                                <div className="flex items-center gap-2">
                                    <Plus className="w-5 h-5 text-purple-600" />
                                    <span>รายการอื่นๆ</span>
                                </div>
                                <Button type="button" size="sm" className="bg-[#9333ea] hover:bg-[#7e22ce] text-white" onClick={() => appendOther({ productId: "", quantity: 0, unitPrice: 0 })}>
                                    + เพิ่มรายการ
                                </Button>
                            </div>

                            {/* Only show table if there are items */}
                            {otherFields.length > 0 && (
                                <div className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden">
                                    <div className="bg-[#9333ea] text-white py-3 px-4 grid grid-cols-12 gap-4 text-sm font-semibold text-center items-center">
                                        <div className="col-span-5 text-left">สินค้า</div>
                                        <div className="col-span-2">จำนวน</div>
                                        <div className="col-span-2">ราคา/หน่วย</div>
                                        <div className="col-span-2">ราคารวม</div>
                                        <div className="col-span-1"></div>
                                    </div>
                                    <div className="p-4 space-y-3">
                                        {otherFields.map((field, index) => (
                                            <div key={field.id} className="grid grid-cols-12 gap-4 items-center bg-[#FAF5FF] p-2 rounded -mx-2">
                                                <div className="col-span-5">
                                                    <ProductCombobox
                                                        products={products}
                                                        value={form.watch(`otherItems.${index}.productId`)}
                                                        onSelect={(val) => handleProductSelect("other", index, val)}
                                                        placeholder="เลือกสินค้า"
                                                    />
                                                </div>
                                                <div className="col-span-2">
                                                    <Input type="number" {...form.register(`otherItems.${index}.quantity`)} className="text-center h-10 border-gray-200" />
                                                </div>
                                                <div className="col-span-2">
                                                    <Input type="number" {...form.register(`otherItems.${index}.unitPrice`)} className="text-center h-10 border-purple-200 bg-white" />
                                                </div>
                                                <div className="col-span-2 text-center text-[#9333ea] font-bold font-mono">
                                                    {((form.watch(`otherItems.${index}.quantity`) || 0) * (form.watch(`otherItems.${index}.unitPrice`) || 0)).toFixed(8)}
                                                </div>
                                                <div className="col-span-1 flex justify-center">
                                                    <Button type="button" variant="ghost" size="icon" className="text-red-400 hover:text-red-600 hover:bg-red-50" onClick={() => removeOther(index)}>
                                                        <Trash2 className="w-4 h-4" />
                                                    </Button>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* ── Footer Shipping ── */}
                        <div className="bg-[#FFF1F2] rounded-lg p-6 flex flex-wrap items-center gap-4 border border-[#FECDD3]">
                            <Box className="w-5 h-5 text-[#E11D48]" />
                            <span className="font-bold text-gray-800">ค่าขนส่ง (ไม่ตัก VAT)</span>
                            <Input
                                type="number"
                                {...form.register("shippingCost")}
                                className="max-w-[150px] bg-white border-[#FDA4AF] text-center font-bold text-gray-800"
                            />
                            <span className="text-sm text-gray-600">บาท</span>
                        </div>

                        {/* ── Footer Summary ── */}
                        <div className="bg-[#2563EB] rounded-lg text-white p-6 shadow-md">
                            <div className="flex items-center gap-2 mb-6">
                                <div className="h-6 w-1.5 bg-[#FACC15] rounded-full"></div>
                                <h3 className="font-bold text-lg">สรุปยอด</h3>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                                <div className="bg-[#3B82F6]/50 rounded-lg p-4 flex flex-col justify-between h-24">
                                    <div className="text-sm opacity-90">ราคาสินค้ารวมส่วนลดปกติ</div>
                                    <div className="font-bold text-2xl tracking-wide">{subtotal.toLocaleString(undefined, { minimumFractionDigits: 8, maximumFractionDigits: 8 })}</div>
                                </div>
                                <div className="bg-[#3B82F6]/50 rounded-lg p-4 flex flex-col justify-between h-24">
                                    <div className="text-sm opacity-90">ภาษีมูลค่าเพิ่ม 7%</div>
                                    <div className="font-bold text-2xl tracking-wide">{vatAmount.toLocaleString(undefined, { minimumFractionDigits: 8, maximumFractionDigits: 8 })}</div>
                                </div>
                                <div className="bg-[#3B82F6]/50 rounded-lg p-4 flex flex-col justify-between h-24">
                                    <div className="text-sm opacity-90">จำนวนสินค้าที่สั่งซื้อ (ห่อ)</div>
                                    <div className="font-bold text-2xl tracking-wide">{totalQuantity.toLocaleString()}</div>
                                </div>
                                <div className="bg-[#3B82F6] border border-white/20 rounded-lg p-4 flex flex-col justify-between h-24 relative overflow-hidden">
                                    <div className="absolute top-0 right-0 p-1 opacity-20">
                                        <Box className="w-12 h-12" />
                                    </div>
                                    <div className="text-sm font-bold text-[#FDE047]">รายรับสุทธิ</div>
                                    <div className="font-bold text-2xl tracking-wide text-[#FDE047]">{grandTotal.toLocaleString(undefined, { minimumFractionDigits: 8, maximumFractionDigits: 8 })}</div>
                                </div>
                            </div>
                        </div>

                        {/* ── Action Buttons ── */}
                        <div className="flex justify-center gap-4 pt-4 pb-8">
                            <Button type="button" variant="secondary" className="bg-[#6B7280] text-white hover:bg-[#4B5563] w-32 font-bold" onClick={() => reset()}>
                                <RefreshCw className="mr-2 h-4 w-4" /> รีเซ็ต
                            </Button>
                            <Button type="submit" className="bg-[#10B981] hover:bg-[#059669] text-white w-48 font-bold" disabled={isLoading}>
                                {isLoading ? <Loader2 className="animate-spin" /> : <><CheckCircle className="mr-2 h-4 w-4" /> Confirm / Review</>}
                            </Button>
                        </div>

                    </form>
                </Form>

                <OrderSummaryModal
                    isOpen={isReviewOpen}
                    onClose={() => setIsReviewOpen(false)}
                    onConfirm={handleFinalSubmit}
                    data={form.getValues()}
                    getSupplierName={getSupplierName}
                    grandTotal={grandTotal}
                    subtotal={subtotal}
                    vatAmount={vatAmount}
                    totalQuantity={totalQuantity}
                />
            </div>
        </div>
    );
}
