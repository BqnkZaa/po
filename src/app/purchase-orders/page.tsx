"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { format } from "date-fns";
import { Plus, Eye, Trash2, Edit, Search, FileSpreadsheet, RefreshCw, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import Header from "@/components/Header";
import NavTabs from "@/components/NavTabs";
import { cn } from "@/lib/utils";

// Mock DatePicker if not exists, or I will use standard input type date for speed
function DatePickerInput({ date, setDate }: { date: Date | undefined, setDate: (d: Date | undefined) => void }) {
    return <Input type="date" value={date ? format(date, "yyyy-MM-dd") : ""} onChange={(e) => setDate(e.target.value ? new Date(e.target.value) : undefined)} />;
}

interface PurchaseOrder {
    id: string;
    poNumber: string;
    status: string;
    issueDate: string;
    deliveryDate: string;
    grandTotal: number;
    shippingCost: number;
    supplier: {
        companyName: string;
    };
    items: {
        product: { name: string } | null;
        itemName?: string;
        quantity: number;
        unit: string;
    }[];
}

export default function PurchaseOrdersPage() {
    const [pos, setPos] = useState<PurchaseOrder[]>([]);
    const [filteredPos, setFilteredPos] = useState<PurchaseOrder[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const { toast } = useToast();
    const [poToCancel, setPoToCancel] = useState<string | null>(null);

    const handleCancelPo = async () => {
        if (!poToCancel) return;
        try {
            const res = await fetch(`/api/purchase-orders/${poToCancel}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ status: "CANCELLED" }),
            });

            if (!res.ok) {
                const error = await res.json();
                throw new Error(error.error || "Failed to cancel PO");
            }

            toast({
                title: "Success",
                description: "Purchase order has been cancelled",
            });
            fetchPOs();
        } catch (error: any) {
            toast({
                variant: "destructive",
                title: "Error",
                description: error.message || "Could not cancel purchase order",
            });
        } finally {
            setPoToCancel(null);
        }
    };

    // Filters
    const [searchType, setSearchType] = useState("all");
    const [filterDate, setFilterDate] = useState<Date | undefined>();
    const [filterPo, setFilterPo] = useState("");
    const [filterCustomer, setFilterCustomer] = useState("");

    const fetchPOs = async () => {
        try {
            setIsLoading(true);
            const res = await fetch("/api/purchase-orders");
            if (!res.ok) throw new Error("Failed to fetch POs");
            const data = await res.json();
            setPos(data);
            setFilteredPos(data);
        } catch (error) {
            toast({
                variant: "destructive",
                title: "Error",
                description: "Could not load purchase orders.",
            });
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchPOs();
    }, []);

    // Filter Logic
    useEffect(() => {
        let result = pos;
        if (filterPo) {
            result = result.filter(po => po.poNumber.toLowerCase().includes(filterPo.toLowerCase()));
        }
        if (filterCustomer) {
            result = result.filter(po => po.supplier.companyName.toLowerCase().includes(filterCustomer.toLowerCase()));
        }
        if (filterDate) {
            const dateStr = format(filterDate, "yyyy-MM-dd");
            result = result.filter(po => po.issueDate.startsWith(dateStr));
        }
        setFilteredPos(result);
    }, [pos, filterPo, filterCustomer, filterDate]);

    const resetFilters = () => {
        setFilterPo("");
        setFilterCustomer("");
        setFilterDate(undefined);
    };

    return (
        <div className="min-h-screen bg-[var(--po-bg)] pb-20">
            <Header />
            <NavTabs />

            <div className="max-w-6xl mx-auto px-4 space-y-6">

                {/* ── Header Bar (Purple) ── */}
                <div className="bg-[#8b5cf6] text-white p-3 rounded-t-lg flex items-center justify-between shadow-md">
                    <div className="flex items-center gap-2">
                        <FileSpreadsheet className="w-5 h-5" />
                        <span className="font-bold">รายการ PO ทั้งหมด (All PO List)</span>
                    </div>
                    <Button size="sm" className="bg-[#10b981] hover:bg-[#059669] text-white border-none">
                        <FileSpreadsheet className="mr-2 h-4 w-4" /> บันทึกข้อมูลลง Google Sheet
                    </Button>
                </div>

                {/* ── Filters ── */}
                <div className="bg-white p-4 rounded-b-lg shadow-sm border border-t-0 border-gray-100 grid md:grid-cols-12 gap-4 items-end">
                    <div className="col-span-2">
                        <label className="text-xs text-gray-500">ค้นหาแบบ</label>
                        <Select value={searchType} onValueChange={setSearchType}>
                            <SelectTrigger className="bg-gray-50">
                                <SelectValue placeholder="ทั้งหมด" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">ทั้งหมด</SelectItem>
                                {/* Add more types if needed */}
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="col-span-2">
                        <label className="text-xs text-gray-500">วันที่</label>
                        <DatePickerInput date={filterDate} setDate={setFilterDate} />
                    </div>
                    <div className="col-span-3">
                        <label className="text-xs text-gray-500">เลข PO</label>
                        <Input placeholder="ค้นหาเลข PO..." value={filterPo} onChange={e => setFilterPo(e.target.value)} className="bg-gray-50" />
                    </div>
                    <div className="col-span-3">
                        <label className="text-xs text-gray-500">ชื่อลูกค้า</label>
                        <Input placeholder="ค้นหาลูกค้า..." value={filterCustomer} onChange={e => setFilterCustomer(e.target.value)} className="bg-gray-50" />
                    </div>
                    <div className="col-span-2">
                        <Button className="w-full bg-gray-600 hover:bg-gray-700 text-white" onClick={resetFilters}>
                            <RefreshCw className="mr-2 h-4 w-4" /> รีเซ็ตตัวกรอง
                        </Button>
                    </div>
                </div>

                {/* ── PO List Cards ── */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {isLoading ? (
                        <div className="col-span-2 text-center py-10">Loading...</div>
                    ) : filteredPos.length === 0 ? (
                        <div className="col-span-2 text-center py-10 text-gray-500">ไม่พบรายการ (No POs found)</div>
                    ) : (
                        filteredPos.map((po) => (
                            <div key={po.id} className="bg-white rounded-lg shadow-md overflow-hidden border border-gray-200 flex flex-col">
                                {/* Card Header */}
                                <div className="bg-[#7c3aed] text-white p-3 flex justify-between items-center">
                                    <div>
                                        <div className="text-xs opacity-75">เลข PO</div>
                                        <div className="font-bold">{po.poNumber}</div>
                                    </div>
                                    <div className="text-right">
                                        <div className="text-xl font-bold">{Number(po.grandTotal).toLocaleString(undefined, { minimumFractionDigits: 2 })}</div>
                                        <div className="text-xs opacity-75">บาท</div>
                                    </div>
                                </div>
                                {/* Card Content */}
                                <div className="p-4 space-y-3 flex-1">
                                    <div className="flex justify-between text-sm">
                                        <div>
                                            <span className="text-gray-500 text-xs block">วันที่สร้างรายการสั่งซื้อ</span>
                                            <span className="font-medium text-[#d97706]">{format(new Date(po.issueDate), "dd/MM/yyyy")}</span>
                                        </div>
                                        <div className="text-right">
                                            <span className="text-gray-500 text-xs block">วันที่จัดส่ง</span>
                                            <span className="font-medium text-red-500">{format(new Date(po.deliveryDate), "dd/MM/yyyy")}</span>
                                        </div>
                                    </div>
                                    <div className="border-t border-gray-100 pt-2">
                                        <span className="text-gray-500 text-xs block">ลูกค้า</span>
                                        <div className="font-bold text-gray-800">{po.supplier.companyName}</div>
                                    </div>
                                    <div className="border-t border-gray-100 pt-2">
                                        <span className="text-gray-500 text-xs block mb-1">รายการสินค้า</span>
                                        <div className="text-sm text-gray-600 space-y-1">
                                            {po.items.slice(0, 3).map((item, idx) => (
                                                <div key={idx} className="truncate">
                                                    - {item.product?.name || item.itemName || "Unknown Item"} ({Number(item.quantity).toLocaleString()})
                                                </div>
                                            ))}
                                            {po.items.length > 3 && <div className="text-xs text-gray-400">...และอื่นๆอีก {po.items.length - 3} รายการ</div>}
                                        </div>
                                    </div>
                                </div>
                                {/* Card Footer / Actions */}
                                <div className="bg-gray-50 p-3 grid grid-cols-3 gap-2 border-t border-gray-100">
                                    <Link href={`/purchase-orders/${po.id}`} className="w-full">
                                        <Button variant="default" className="w-full bg-blue-600 hover:bg-blue-700 text-white h-8 text-xs">
                                            <Eye className="w-3 h-3 mr-1" /> ดูเอกสาร
                                        </Button>
                                    </Link>
                                    <Link href={`/purchase-orders/create?edit=${po.id}`} className="w-full">
                                        <Button variant="default" className="w-full bg-[#f59e0b] hover:bg-[#d97706] text-white h-8 text-xs">
                                            <Edit className="w-3 h-3 mr-1" /> แก้ไข
                                        </Button>
                                    </Link>
                                    <Button
                                        variant="default"
                                        className="w-full bg-red-600 hover:bg-red-700 text-white h-8 text-xs"
                                        onClick={() => setPoToCancel(po.id)}
                                        disabled={po.status === "CANCELLED"}
                                    >
                                        <Trash2 className="w-3 h-3 mr-1" /> ยกเลิก
                                    </Button>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>

            <AlertDialog open={!!poToCancel} onOpenChange={(open) => !open && setPoToCancel(null)}>
                <AlertDialogContent className="bg-white rounded-xl shadow-xl border-0 max-w-md">
                    <AlertDialogHeader className="flex flex-col items-center text-center space-y-4 pt-6">
                        <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-2">
                            <AlertTriangle className="w-8 h-8 text-red-600" />
                        </div>
                        <AlertDialogTitle className="text-xl font-bold text-gray-900">
                            ยืนยันการยกเลิกรายการ?
                            <br />
                            <span className="text-sm font-normal text-gray-500">(Confirm Cancel)</span>
                        </AlertDialogTitle>
                        <AlertDialogDescription className="text-gray-600 text-base leading-relaxed max-w-sm mx-auto">
                            การกระทำนี้ไม่สามารถย้อนกลับได้ สถานะของ PO จะถูกเปลี่ยนเป็น <span className="font-bold text-red-600">"ยกเลิก"</span>
                            <br />
                            <span className="text-xs text-gray-400 mt-1 block">
                                (This action cannot be undone. The PO status will be changed to "CANCELLED".)
                            </span>
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter className="flex justify-center gap-3 sm:justify-center w-full pb-6 px-6">
                        <AlertDialogCancel className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 border-0 h-10 rounded-lg transition-all font-medium">
                            ไม่, เก็บไว้ (Keep it)
                        </AlertDialogCancel>
                        <AlertDialogAction
                            onClick={handleCancelPo}
                            className="flex-1 bg-red-600 hover:bg-red-700 text-white border-0 h-10 rounded-lg shadow-md hover:shadow-lg transition-all font-bold"
                        >
                            ใช่, ยกเลิกเลย (Yes, Cancel)
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
}
