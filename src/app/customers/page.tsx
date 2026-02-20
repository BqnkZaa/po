"use client";

import { useEffect, useState } from "react";
import { Users, Plus, Edit, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import Header from "@/components/Header";
import NavTabs from "@/components/NavTabs";
import { CustomerModal } from "@/components/CustomerModal";
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

interface Supplier {
    id: string;
    companyName: string;
    phone: string | null;
    taxId: string | null;
    address: string | null;
    regularPrice: number;
    email: string | null;
    contactPerson: string | null;
}

export default function CustomersPage() {
    const [suppliers, setSuppliers] = useState<Supplier[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingSupplier, setEditingSupplier] = useState<Supplier | undefined>(undefined);
    const [deletingSupplierId, setDeletingSupplierId] = useState<string | null>(null);
    const { toast } = useToast();

    const fetchSuppliers = async () => {
        try {
            setIsLoading(true);
            const res = await fetch("/api/suppliers");
            if (res.ok) {
                setSuppliers(await res.json());
            }
        } catch (error) {
            console.error("Failed to fetch suppliers", error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchSuppliers();
    }, []);

    const handleEdit = (supplier: Supplier) => {
        setEditingSupplier(supplier);
        setIsModalOpen(true);
    };

    const handleAddNew = () => {
        setEditingSupplier(undefined);
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setEditingSupplier(undefined);
    };

    const confirmDelete = (id: string) => {
        setDeletingSupplierId(id);
    };

    const handleDelete = async () => {
        if (!deletingSupplierId) return;

        try {
            const res = await fetch(`/api/suppliers/${deletingSupplierId}`, {
                method: "DELETE",
            });

            if (!res.ok) {
                const json = await res.json();
                throw new Error(json.error || "Failed to delete supplier");
            }

            toast({
                title: "ลบข้อมูลสำเร็จ",
                description: "ลบข้อมูลลูกค้าเรียบร้อยแล้ว",
                className: "bg-green-50 border-green-200 text-green-800",
            });
            fetchSuppliers();
        } catch (error: any) {
            toast({
                variant: "destructive",
                title: "ไม่สามารถลบข้อมูลได้",
                description: error.message
            });
        } finally {
            setDeletingSupplierId(null);
        }
    };

    return (
        <div className="min-h-screen bg-[var(--po-bg)] pb-20">
            <Header />
            <NavTabs />

            <div className="max-w-6xl mx-auto px-4 space-y-4 sm:space-y-6">

                {/* ── Header Bar (Blue) ── */}
                <div className="bg-[#1a3dbf] text-white p-3 sm:p-4 rounded-lg sm:rounded-t-lg flex flex-col sm:flex-row items-center justify-between shadow-md gap-3 sm:gap-0">
                    <div className="flex items-center gap-2">
                        <Users className="w-5 h-5" />
                        <span className="font-bold text-base sm:text-lg">ข้อมูลลูกค้า (Customer Info)</span>
                    </div>
                    <Button
                        size="sm"
                        className="bg-white text-[#1a3dbf] hover:bg-gray-100 border-none font-bold w-full sm:w-auto shadow-sm"
                        onClick={handleAddNew}
                    >
                        <Plus className="mr-2 h-4 w-4" /> เพิ่มลูกค้าใหม่
                    </Button>
                </div>

                {/* ── Customer List ── */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                    {isLoading ? (
                        <div className="col-span-1 md:col-span-2 text-center py-10">
                            <div className="flex justify-center items-center gap-2">
                                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                                <span className="text-gray-500">กำลังโหลด...</span>
                            </div>
                        </div>
                    ) : suppliers.length === 0 ? (
                        <div className="col-span-1 md:col-span-2 text-center py-10 text-gray-400">
                            ไม่พบข้อมูลลูกค้า
                        </div>
                    ) : suppliers.map(s => (
                        <div key={s.id} className="bg-white rounded-xl shadow-sm border border-gray-200 p-5 sm:p-6 flex flex-col justify-between hover:shadow-md transition-shadow">
                            <div>
                                <div className="flex flex-wrap justify-between items-start mb-4 gap-2">
                                    <h3 className="text-base sm:text-lg font-bold text-gray-800 break-words max-w-full">{s.companyName}</h3>
                                    {s.contactPerson && (
                                        <span className="text-[10px] bg-gray-100 text-gray-500 px-2 py-1 rounded-full whitespace-nowrap">
                                            {s.contactPerson}
                                        </span>
                                    )}
                                </div>
                                <div className="space-y-3 text-xs sm:text-sm text-gray-600">
                                    <div className="flex justify-between items-start border-b border-gray-50 pb-2">
                                        <span className="text-gray-400 font-medium shrink-0">ที่อยู่</span>
                                        <span className="text-right max-w-[65%] line-clamp-2 text-gray-700">{s.address || "-"}</span>
                                    </div>
                                    <div className="flex justify-between items-center border-b border-gray-50 pb-2">
                                        <span className="text-gray-400 font-medium">เบอร์โทรศัพท์</span>
                                        <span className="font-mono">{s.phone || "-"}</span>
                                    </div>
                                    <div className="flex justify-between items-center border-b border-gray-50 pb-2">
                                        <span className="text-gray-400 font-medium">เลขผู้เสียภาษี</span>
                                        <span className="font-mono">{s.taxId || "-"}</span>
                                    </div>
                                    <div className="flex justify-between items-center bg-blue-50/50 p-2 rounded-lg border border-blue-100/50">
                                        <span className="text-blue-800 font-semibold text-xs uppercase tracking-wide">ราคาขายประจำ</span>
                                        <span className="font-bold text-blue-600 font-mono text-base">
                                            {s.regularPrice ? Number(s.regularPrice).toLocaleString(undefined, { minimumFractionDigits: 2 }) : "0.00"}
                                        </span>
                                    </div>
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-3 mt-5">
                                <Button
                                    variant="outline"
                                    className="border-amber-200 text-amber-700 hover:bg-amber-50"
                                    onClick={() => handleEdit(s)}
                                >
                                    <Edit className="mr-2 h-4 w-4" /> แก้ไข
                                </Button>
                                <Button
                                    variant="outline"
                                    className="border-red-200 text-red-600 hover:bg-red-50"
                                    onClick={() => confirmDelete(s.id)}
                                >
                                    <Trash2 className="mr-2 h-4 w-4" /> ลบ
                                </Button>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            <CustomerModal
                isOpen={isModalOpen}
                onClose={handleCloseModal}
                onSuccess={fetchSuppliers}
                supplierToEdit={editingSupplier}
            />

            <AlertDialog open={!!deletingSupplierId} onOpenChange={(open: boolean) => !open && setDeletingSupplierId(null)}>
                <AlertDialogContent className="bg-white rounded-xl shadow-xl border-0 max-w-md">
                    <AlertDialogHeader className="flex flex-col items-center text-center space-y-4 pt-6">
                        <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-2">
                            <Trash2 className="w-8 h-8 text-red-600" />
                        </div>
                        <AlertDialogTitle className="text-xl font-bold text-gray-900">
                            ยืนยันการลบข้อมูล
                            <br />
                            <span className="text-sm font-normal text-gray-500">(Confirm Delete)</span>
                        </AlertDialogTitle>
                        <AlertDialogDescription className="text-gray-600 text-base leading-relaxed max-w-sm mx-auto">
                            คุณแน่ใจหรือไม่ที่จะลบข้อมูลลูกค้ารายนี้?
                            <br />
                            <span className="text-xs text-gray-400 mt-1 block">
                                (Are you sure you want to delete this customer? This action cannot be undone.)
                            </span>
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter className="flex justify-center gap-3 sm:justify-center w-full pb-6 px-6">
                        <AlertDialogCancel className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 border-0 h-10 rounded-lg transition-all font-medium">
                            ยกเลิก (Cancel)
                        </AlertDialogCancel>
                        <AlertDialogAction
                            onClick={handleDelete}
                            className="flex-1 bg-red-600 hover:bg-red-700 text-white border-0 h-10 rounded-lg shadow-md hover:shadow-lg transition-all font-bold"
                        >
                            ยืนยันการลบ (Delete)
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
}
