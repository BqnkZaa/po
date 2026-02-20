"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Loader2, Save, X, Building2, Phone, Mail, MapPin, Receipt, CreditCard } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from "@/components/ui/dialog";
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";

const supplierSchema = z.object({
    companyName: z.string().min(1, "กรุณาระบุชื่อลูกค้า"),
    taxId: z.string().optional(),
    address: z.string().optional(),
    phone: z.string().optional(),
    regularPrice: z.coerce.number().min(0),
});

type SupplierFormValues = z.infer<typeof supplierSchema>;

interface CustomerModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
    supplierToEdit?: any;
}

export function CustomerModal({ isOpen, onClose, onSuccess, supplierToEdit }: CustomerModalProps) {
    const { toast } = useToast();
    const isEditing = !!supplierToEdit;

    const form = useForm<SupplierFormValues>({
        resolver: zodResolver(supplierSchema) as any,
        defaultValues: {
            companyName: "",
            taxId: "",
            address: "",
            phone: "",
            regularPrice: 0,
        } as SupplierFormValues,
    });

    useEffect(() => {
        if (isOpen) {
            if (supplierToEdit) {
                form.reset({
                    companyName: supplierToEdit.companyName || "",
                    taxId: supplierToEdit.taxId || "",
                    address: supplierToEdit.address || "",
                    phone: supplierToEdit.phone || "",
                    regularPrice: supplierToEdit.regularPrice || 0,
                });
            } else {
                form.reset({
                    companyName: "",
                    taxId: "",
                    address: "",
                    phone: "",
                    regularPrice: 0,
                });
            }
        }
    }, [isOpen, supplierToEdit, form]);

    const onSubmit = async (data: SupplierFormValues) => {
        try {
            const url = isEditing ? `/api/suppliers/${supplierToEdit.id}` : "/api/suppliers";
            const method = isEditing ? "PATCH" : "POST";

            const res = await fetch(url, {
                method,
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(data),
            });

            if (!res.ok) {
                const json = await res.json();
                throw new Error(json.error || "Failed to save customer");
            }

            toast({
                title: isEditing ? "แก้ไขข้อมูลสำเร็จ" : "บันทึกข้อมูลสำเร็จ",
                description: isEditing ? "แก้ไขข้อมูลลูกค้าเรียบร้อยแล้ว" : "เพิ่มลูกค้าใหม่เรียบร้อยแล้ว",
                className: "bg-green-50 border-green-200 text-green-800",
            });
            onSuccess();
            onClose();
        } catch (error: any) {
            toast({
                variant: "destructive",
                title: "เกิดข้อผิดพลาด",
                description: error.message
            });
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="w-[95vw] sm:max-w-[650px] p-0 overflow-hidden bg-white max-h-[90vh] flex flex-col">
                <DialogHeader className="px-4 sm:px-6 py-4 bg-gray-50 border-b border-gray-100 shrink-0 flex flex-row items-center justify-between">
                    <DialogTitle className="text-lg sm:text-xl font-bold text-gray-800 flex items-center gap-2">
                        {isEditing ? <div className="p-2 bg-amber-100 rounded-full text-amber-600"><Building2 size={18} className="sm:w-5 sm:h-5" /></div> : <div className="p-2 bg-blue-100 rounded-full text-blue-600"><Users size={18} className="sm:w-5 sm:h-5" /></div>}
                        {isEditing ? "แก้ไขข้อมูลลูกค้า" : "เพิ่มลูกค้าใหม่"}
                    </DialogTitle>
                </DialogHeader>

                <div className="px-4 sm:px-6 py-4 overflow-y-auto flex-1">
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 sm:space-y-6">

                            {/* Company Info Section */}
                            <div className="space-y-3 sm:space-y-4">
                                <h3 className="text-xs sm:text-sm font-semibold text-gray-500 uppercase tracking-wider mb-2 sm:mb-3 flex items-center gap-2">
                                    <Building2 className="w-4 h-4" /> ข้อมูลทั่วไป
                                </h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
                                    <FormField
                                        control={form.control}
                                        name="companyName"
                                        render={({ field }) => (
                                            <FormItem className="col-span-1 md:col-span-2">
                                                <FormLabel className="text-xs sm:text-sm">ชื่อบริษัท / ลูกค้า <span className="text-red-500">*</span></FormLabel>
                                                <FormControl>
                                                    <Input {...field} className="h-9 sm:h-10 border-gray-300 focus:border-blue-500 focus:ring-blue-500 text-sm" placeholder="ระบุชื่อลูกค้า..." />
                                                </FormControl>
                                                <FormMessage className="text-xs" />
                                            </FormItem>
                                        )}
                                    />
                                    <FormField
                                        control={form.control}
                                        name="taxId"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel className="text-xs sm:text-sm">เลขผู้เสียภาษี</FormLabel>
                                                <FormControl>
                                                    <div className="relative">
                                                        <Receipt className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                                                        <Input {...field} className="pl-9 h-9 sm:h-10 border-gray-300 text-sm" placeholder="Tax ID" />
                                                    </div>
                                                </FormControl>
                                                <FormMessage className="text-xs" />
                                            </FormItem>
                                        )}
                                    />
                                    <FormField
                                        control={form.control}
                                        name="regularPrice"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel className="text-xs sm:text-sm">ราคาขายประจำ (บาท)</FormLabel>
                                                <FormControl>
                                                    <div className="relative">
                                                        <CreditCard className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                                                        <Input type="number" {...field} className="pl-9 h-9 sm:h-10 border-gray-300 text-blue-600 font-medium text-sm" placeholder="0.00" />
                                                    </div>
                                                </FormControl>
                                                <FormMessage className="text-xs" />
                                            </FormItem>
                                        )}
                                    />
                                </div>
                            </div>

                            <div className="border-t border-gray-100 my-2 sm:my-4"></div>

                            {/* Contact Info Section */}
                            <div className="space-y-3 sm:space-y-4">
                                <h3 className="text-xs sm:text-sm font-semibold text-gray-500 uppercase tracking-wider mb-2 sm:mb-3 flex items-center gap-2">
                                    <Phone className="w-4 h-4" /> ข้อมูลติดต่อ
                                </h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
                                    <FormField
                                        control={form.control}
                                        name="phone"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel className="text-xs sm:text-sm">เบอร์โทรศัพท์</FormLabel>
                                                <FormControl>
                                                    <div className="relative">
                                                        <Phone className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                                                        <Input {...field} className="pl-9 h-9 sm:h-10 border-gray-300 text-sm" placeholder="08x-xxx-xxxx" />
                                                    </div>
                                                </FormControl>
                                                <FormMessage className="text-xs" />
                                            </FormItem>
                                        )}
                                    />
                                    <FormField
                                        control={form.control}
                                        name="address"
                                        render={({ field }) => (
                                            <FormItem className="col-span-1 md:col-span-2">
                                                <FormLabel className="text-xs sm:text-sm">ที่อยู่</FormLabel>
                                                <FormControl>
                                                    <div className="relative">
                                                        <MapPin className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                                                        <Textarea {...field} className="pl-9 min-h-[80px] border-gray-300 resize-none text-sm" placeholder="ที่อยู่..." />
                                                    </div>
                                                </FormControl>
                                                <FormMessage className="text-xs" />
                                            </FormItem>
                                        )}
                                    />
                                </div>
                            </div>
                        </form>
                    </Form>
                </div>

                <DialogFooter className="px-4 sm:px-6 py-3 sm:py-4 border-t border-gray-100 shrink-0 flex flex-col-reverse sm:flex-row items-stretch sm:items-center justify-end gap-2">
                    <Button type="button" variant="ghost" onClick={onClose} className="text-gray-500 hover:text-gray-700 hover:bg-gray-100 w-full sm:w-auto h-10">
                        <X className="mr-2 h-4 w-4" /> ยกเลิก
                    </Button>
                    <Button
                        type="button" // Change to button and handle form submit via form Ref or ID if outside form
                        onClick={form.handleSubmit(onSubmit)}
                        className={`${isEditing ? 'bg-amber-500 hover:bg-amber-600' : 'bg-[#1a3dbf] hover:bg-blue-800'} text-white w-full sm:w-auto shadow-sm transition-all h-10`}
                        disabled={form.formState.isSubmitting}
                    >
                        {form.formState.isSubmitting ? (
                            <Loader2 className="animate-spin mr-2 h-4 w-4" />
                        ) : (
                            <Save className="mr-2 h-4 w-4" />
                        )}
                        {isEditing ? "บันทึกการแก้ไข" : "บันทึกข้อมูล"}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}

import { Users } from "lucide-react";
