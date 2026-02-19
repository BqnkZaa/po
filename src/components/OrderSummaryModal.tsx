import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";
import { CheckSquare, Edit, ClipboardList } from "lucide-react";

interface OrderSummaryModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
    data: any; // Using any for flexibility with form data, or define strict type
    getSupplierName: (id: string) => string;
    grandTotal: number;
    subtotal: number;
    vatAmount: number;
    totalQuantity: number;
}

export function OrderSummaryModal({
    isOpen,
    onClose,
    onConfirm,
    data,
    getSupplierName,
    grandTotal,
    subtotal,
    vatAmount,
    totalQuantity,
}: OrderSummaryModalProps) {
    // Combine all items for display
    const allItems = [
        ...(data.standardItems || []),
        ...(data.manualItems || []),
        ...(data.otherItems || []),
    ].filter(item => Number(item.quantity || 0) > 0); // Only show items with quantity

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="max-w-3xl bg-white p-0 overflow-hidden border border-gray-200 shadow-xl sm:rounded-lg max-h-[90vh] flex flex-col">
                <div className="bg-white p-6 pb-0 text-center shrink-0">
                    <DialogHeader>
                        <DialogTitle className="flex items-center justify-center gap-2 text-xl font-bold text-[#3B82F6]">
                            <ClipboardList className="w-6 h-6 text-[#F97316] fill-orange-100" />
                            <span className="text-[#3B82F6]">ตรวจสอบออเดอร์</span>
                        </DialogTitle>
                    </DialogHeader>
                </div>

                <div className="p-6 space-y-6 overflow-y-auto">
                    {/* Header Info */}
                    <div className="bg-[#eff6ff] rounded-lg p-5 text-sm space-y-1">
                        <div className="flex gap-2">
                            <span className="font-bold text-gray-700 w-32">เลข PO:</span>
                            <span className="font-bold text-[#2563EB]">P025690218-P001</span> {/* Placeholder as per screenshot/mock */}
                        </div>
                        <div className="flex gap-2">
                            <span className="font-bold text-gray-700 w-32">ลูกค้า:</span>
                            <span className="text-gray-600">{getSupplierName(data.supplierId)}</span>
                        </div>
                        <div className="flex gap-2">
                            <span className="font-bold text-gray-700 w-32">วันที่สร้างรายการสั่งซื้อ:</span>
                            <span className="text-gray-600">{data.issueDate ? format(data.issueDate, "dd/MM/yyyy") : "-"}</span>
                        </div>
                        <div className="flex gap-2">
                            <span className="font-bold text-gray-700 w-32">วันที่จัดส่ง:</span>
                            <span className="font-bold text-red-600">{data.deliveryDate ? format(data.deliveryDate, "dd/MM/yyyy") : "-"}</span>
                        </div>
                    </div>

                    {/* Table */}
                    <div className="border-t border-gray-100">
                        <table className="w-full text-sm">
                            <thead className="bg-[#f8fafc] text-gray-700 font-bold border-b border-gray-100">
                                <tr>
                                    <th className="py-3 px-4 text-left">สินค้า</th>
                                    <th className="py-3 px-4 text-center">จำนวน</th>
                                    <th className="py-3 px-4 text-right">ราคา/หน่วย</th>
                                    <th className="py-3 px-4 text-right">รวม</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50">
                                {allItems.map((item, index) => (
                                    <tr key={index}>
                                        <td className="py-3 px-4 text-gray-600">{item.productName || "Unknown Product"}</td>
                                        <td className="py-3 px-4 text-center text-gray-600">{item.quantity}</td>
                                        <td className="py-3 px-4 text-right text-gray-600">
                                            {Number(item.unitPrice || 0).toFixed(8)}
                                        </td>
                                        <td className="py-3 px-4 text-right font-bold text-gray-700">
                                            {(Number(item.quantity || 0) * Number(item.unitPrice || 0)).toLocaleString(undefined, { minimumFractionDigits: 8 })}
                                        </td>
                                    </tr>
                                ))}
                                {allItems.length === 0 && (
                                    <tr>
                                        <td colSpan={4} className="py-8 text-center text-gray-400">ไม่มีรายการสินค้า</td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>

                    {/* Footer / Totals */}
                    <div className="border-t border-gray-100 pt-4 space-y-2 text-right">
                        <div className="flex justify-between items-center text-gray-600">
                            <span>ราคาสินค้าก่อนหักภาษี:</span>
                            <span>{subtotal.toLocaleString(undefined, { minimumFractionDigits: 8 })} บาท</span>
                        </div>
                        <div className="flex justify-between items-center text-gray-600">
                            <span>ภาษีมูลค่าเพิ่ม 7%:</span>
                            <span>{vatAmount.toLocaleString(undefined, { minimumFractionDigits: 8 })} บาท</span>
                        </div>
                        <div className="flex justify-between items-center text-gray-600">
                            <span>ค่าขนส่ง:</span>
                            <span>{Number(data.shippingCost || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })} บาท</span>
                        </div>
                        <div className="flex justify-between items-center pt-2 border-t border-gray-100">
                            <span className="text-[#2563EB] font-bold text-lg">รายรับสุทธิ:</span>
                            <span className="text-[#2563EB] font-bold text-xl">{grandTotal.toLocaleString(undefined, { minimumFractionDigits: 2 })} บาท</span>
                        </div>
                        <div className="flex justify-between items-center pt-1">
                            <span className="text-gray-600 text-sm">จำนวนสินค้าที่สั่งซื้อ (ห่อ):</span>
                            <span className="text-gray-800 font-bold">{totalQuantity.toLocaleString()}</span>
                        </div>
                    </div>

                    {/* Actions */}
                    <div className="flex justify-center gap-3 pt-2">
                        <Button
                            onClick={onConfirm}
                            className="bg-[#10B981] hover:bg-[#059669] text-white w-40 font-bold h-11 text-base shadow-sm"
                        >
                            <CheckSquare className="w-5 h-5 mr-2" /> ยืนยันบันทึก
                        </Button>
                        <Button
                            onClick={onClose}
                            variant="secondary"
                            className="bg-[#6B7280] text-white hover:bg-[#4B5563] w-32 font-bold h-11 text-base shadow-sm"
                        >
                            <Edit className="w-4 h-4 mr-2" /> แก้ไข
                        </Button>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}
