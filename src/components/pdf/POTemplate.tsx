"use client";

import React from 'react';
import { Page, Text, View, Document, StyleSheet, Font, Image } from '@react-pdf/renderer';
import { thaiBahtText } from '@/lib/thai-baht-text';

// Register Thai font
Font.register({
    family: 'Sarabun',
    fonts: [
        { src: '/fonts/Sarabun-Regular.ttf' },
        { src: '/fonts/Sarabun-Bold.ttf', fontWeight: 'bold' }
    ]
});

const styles = StyleSheet.create({
    page: {
        padding: 30, // Approx 1cm margin
        fontSize: 10,
        fontFamily: 'Sarabun',
        color: '#333',
    },
    // Header
    headerContainer: {
        marginBottom: 10,
        position: 'relative',
    },
    companyTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#0099cc', // Light blue/teal color from image
        marginBottom: 4,
    },
    companyAddress: {
        fontSize: 9,
        lineHeight: 1.3,
        marginBottom: 2,
    },
    taxID: {
        fontSize: 9,
        color: 'black',
        fontWeight: 'normal',
    },
    headerRight: {
        position: 'absolute',
        top: 0,
        right: 0,
        textAlign: 'right',
    },
    poLabel: {
        fontSize: 9,
        color: '#666',
        marginBottom: 2,
    },
    poNumber: {
        fontSize: 14,
        fontWeight: 'bold',
        color: '#0099cc',
    },
    originalBadge: {
        marginTop: 6,
        backgroundColor: '#0099cc',
        color: 'white',
        paddingVertical: 2,
        paddingHorizontal: 8,
        borderRadius: 10,
        alignSelf: 'flex-start',
        fontSize: 9,
        marginBottom: 10,
    },
    line: {
        borderBottomWidth: 2,
        borderBottomColor: '#0099cc',
        marginTop: 5,
        marginBottom: 15,
    },

    // Info Blocks
    infoContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 15,
    },
    // Left Box: Supplier
    supplierBox: {
        width: '58%', // Slightly wider
        backgroundColor: '#f8f9fa', // Light gray bg
        padding: 10,
        borderRadius: 4,
        height: 80,
    },
    infoLabel: {
        fontSize: 8,
        color: '#666',
        marginBottom: 2,
    },
    infoText: {
        fontSize: 10,
        fontWeight: 'bold',
        marginBottom: 2,
    },
    infoTextRegular: {
        fontSize: 9,
        marginBottom: 1,
    },

    // Right Box: Yellow Box Style
    yellowBox: {
        width: '40%',
        borderWidth: 1,
        borderColor: '#000',
    },
    yellowHeader: {
        backgroundColor: '#ffc000', // Gold/Darker Yellow
        paddingVertical: 5,
        alignItems: 'center',
        borderBottomWidth: 1,
        borderBottomColor: '#000',
    },
    yellowHeaderText: {
        fontSize: 11,
        fontWeight: 'bold',
    },
    yellowSubHeader: {
        backgroundColor: '#fff', // White middle section
        paddingVertical: 8,
        alignItems: 'center',
        borderBottomWidth: 1,
        borderBottomColor: '#000',
    },
    yellowSubHeaderReceipt: {
        backgroundColor: '#5677fc', // Blue for receipt pages
        paddingVertical: 8,
        alignItems: 'center',
        borderBottomWidth: 1,
        borderBottomColor: '#000',
    },
    yellowSubHeaderText: {
        fontSize: 10,
        fontWeight: 'bold',
    },
    yellowSubHeaderTextReceipt: {
        fontSize: 12,
        fontWeight: 'bold',
        color: 'black',
    },
    yellowBody: {
        backgroundColor: '#ffe699', // Lighter Yellow for bottom
        paddingVertical: 5,
        alignItems: 'center',
    },
    yellowBodyText: {
        fontSize: 11, // Larger for PO Number
        fontWeight: 'bold',
    },

    // Table
    table: {
        width: '100%',
        marginBottom: 5,
    },
    tableHeader: {
        flexDirection: 'row',
        backgroundColor: '#0099cc',
        color: 'white',
        paddingVertical: 6,
        paddingHorizontal: 4,
        alignItems: 'center',
    },
    tableRow: {
        flexDirection: 'row',
        borderBottomWidth: 0.5,
        borderBottomColor: '#eee',
        paddingVertical: 6,
        paddingHorizontal: 4,
        alignItems: 'center',
    },
    colNo1: { width: '8%', textAlign: 'center', color: 'black' },
    colNo: { width: '8%', textAlign: 'center' },
    colDesc1: { width: '42%', color: 'black' },
    colDesc: { width: '42%' },
    colQty1: { width: '10%', textAlign: 'center', color: 'black' },
    colQty: { width: '10%', textAlign: 'center' },
    colPrice1: { width: '20%', textAlign: 'right', color: 'black' },
    colPrice: { width: '20%', textAlign: 'right' },
    colTotal1: { width: '20%', textAlign: 'right', color: 'black' },
    colTotal: { width: '20%', textAlign: 'right' },

    // Summary Section
    summaryContainer: {
        marginTop: 10,
    },
    summaryContent: {
        flexDirection: 'row',
        justifyContent: 'flex-start', // Changed from flex-end
    },
    totalsBox: {
        width: '100%', // Changed from 45%
    },
    totalRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 4,
    },
    totalLabel: {
        fontSize: 9,
        color: '#333',
    },
    totalValue: {
        fontSize: 9,
        textAlign: 'right',
    },
    netTotalRow: {
        flexDirection: 'row',
        marginTop: 5,
        borderTopWidth: 2,
        borderTopColor: '#0099cc',
        borderBottomWidth: 2,
        borderBottomColor: '#0099cc', // The image shows blue lines top and bottom of this row
        paddingVertical: 6,
        backgroundColor: 'white', // Ensure it stands out
        alignItems: 'center',
    },
    netTotalLabel: {
        fontSize: 11,
        fontWeight: 'bold',
        color: '#0099cc',
        width: '40%', // Adjust width
    },
    netTotalText: {
        fontSize: 10,
        width: '60%',
        textAlign: 'right',
    },

    // Baht Text Row
    bahtTextRow: {
        flexDirection: 'row',
        justifyContent: 'flex-end',
        marginBottom: 5,
        paddingRight: 5,
    },

    footer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: 40,
    },
    signatureBlock: {
        width: '30%',
        alignItems: 'center',
    },
    signLine: {
        marginTop: 30,
        borderBottomWidth: 1,
        borderBottomColor: '#ccc',
        width: '80%',
        height: 1,
    },
    signatureText: {
        marginTop: 5,
        fontSize: 9,
    },
    // New Summary Table Styles
    summaryTable: {
        marginTop: 10,
        // borderWidth: 0.5,
        // borderColor: '#ccc',
    },
    summaryRow: {
        flexDirection: 'row',
        // borderBottomWidth: 0.5,
        // borderBottomColor: '#ccc',
        minHeight: 20,
        alignItems: 'center',
    },
    summaryLabelCol: {
        width: '70%',
        padding: 5,
        // borderRightWidth: 0.5,
        // borderRightColor: '#ccc',
    },
    summaryValueCol: {
        width: '30%',
        padding: 5,
        textAlign: 'right',
    },
    // Net Total Row specific
    netTotalRowNew: {
        flexDirection: 'row',
        // borderBottomWidth: 0.5,
        // borderBottomColor: '#ccc',
        minHeight: 30,
        alignItems: 'center',
        backgroundColor: '#fff',
    },
    netTotalLabelCol: {
        width: '20%',
        padding: 5,
        // borderRightWidth: 0.5,
        // borderRightColor: '#ccc',
    },
    netTotalTextCol: {
        width: '50%',
        padding: 5,
        textAlign: 'center',
        // borderRightWidth: 0.5,
        // borderRightColor: '#ccc'
    },
    netTotalValueCol: {
        width: '30%',
        padding: 5,
        textAlign: 'right',
    },
});

interface POData {
    poNumber: string;
    issueDate: string;
    deliveryDate: string;
    items: {
        productName: string;
        quantity: number;
        unit: string;
        unitPrice: number;
    }[];
    supplier: {
        companyName: string;
        contactPerson: string;
        phone: string;
        email: string;
        address: string;
        taxId: string;
    };
}

const POTemplate = ({ data }: { data: POData }) => {
    const subtotal = data.items.reduce((sum, item) => sum + item.quantity * item.unitPrice, 0);
    const vatRate = 0.07;
    const vatAmount = subtotal * vatRate;
    const shippingCost = 0;
    const grandTotal = subtotal + vatAmount + shippingCost;
    const totalQty = data.items.reduce((sum, item) => sum + Number(item.quantity), 0);
    const thaiText = thaiBahtText(grandTotal);

    const pages = [
        { label: 'ต้นฉบับ/Original', isReceipt: false },
        { label: 'สำเนา/Copy', isReceipt: false },
        { label: 'สำหรับลูกค้า/For Customers', isReceipt: false },
        { label: 'สำเนาสำหรับลูกค้า/Copy', isReceipt: false },
        { label: 'ต้นฉบับ/Original', isReceipt: true },
        { label: 'สำเนา/Copy', isReceipt: true },
    ];

    return (
        <Document>
            {pages.map((page, pageIndex) => (
                <Page key={pageIndex} size="A4" style={styles.page}>
                    {/* Header */}
                    <View style={styles.headerContainer}>
                        <Text style={styles.companyTitle}>บริษัท ตรีเอกอุตสาหกรรมอาหาร จำกัด (สำนักงานใหญ่)) </Text>
                        <Text style={styles.companyAddress}>19/12 ถ.หนองประทีป ต.หนองป่าครั่ง อ.เมือง จ.เชียงใหม่ 50000</Text>
                        <Text style={styles.companyAddress}>เบอร์โทรศัพท์ 081-599-6698, 086-900-7225 สำนักงาน 053-245-750</Text>
                        <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 5 }}>
                            <Text style={styles.companyAddress}>เลขที่ประจำตัวผู้เสียภาษีอากร : </Text>
                            <Text style={styles.taxID}> 0505566007959</Text>
                        </View>
                    </View>

                    <View style={styles.line} />

                    {/* Info Blocks */}
                    <View style={styles.infoContainer}>
                        {/* Left Block: Supplier */}
                        <View style={styles.supplierBox}>
                            <Text style={styles.infoLabel}>ลูกค้า/Customer </Text>
                            <Text style={styles.infoText}>{data.supplier.companyName}  </Text>
                            <Text style={styles.infoTextRegular}>{data.supplier.address}</Text>
                            <Text style={{ ...styles.infoTextRegular, marginTop: 2 }}>โทร: {data.supplier.phone}</Text>
                            <Text style={styles.infoTextRegular}>เลขผู้เสียภาษี: {data.supplier.taxId}</Text>
                        </View>

                        {/* Right Block: Yellow Box */}
                        <View style={styles.yellowBox}>
                            <View style={styles.yellowHeader}>
                                <Text style={styles.yellowHeaderText}>{page.label}</Text>
                            </View>
                            <View style={page.isReceipt ? styles.yellowSubHeaderReceipt : styles.yellowSubHeader}>
                                {page.isReceipt ? (
                                    <Text style={styles.yellowSubHeaderTextReceipt}>ใบเสร็จ / Receipt</Text>
                                ) : (
                                    <>
                                        <Text style={styles.yellowSubHeaderText}>ใบกำกับภาษี/ใบส่งของ/ใบแจ้งหนี้ </Text>
                                        <Text style={styles.yellowSubHeaderText}>Tax Invoice/Delivery Order/Invoice</Text>
                                    </>
                                )}
                            </View>
                            <View style={styles.yellowBody}>
                                <Text style={styles.yellowBodyText}>{data.poNumber}</Text>
                            </View>
                        </View>
                    </View>

                    {/* Table */}
                    <View style={styles.table}>
                        <View style={styles.tableHeader}>
                            <Text style={styles.colNo1}>ลำดับที่ </Text>
                            <Text style={styles.colDesc1}>รายการสินค้า</Text>
                            <Text style={styles.colQty1}>จำนวนห่อ </Text>
                            <Text style={styles.colPrice1}>ราคา/หน่วย</Text>
                            <Text style={styles.colTotal1}>รวม</Text>
                        </View>
                        {data.items.map((item, index) => (
                            <View key={index} style={styles.tableRow}>
                                <Text style={styles.colNo}>{index + 1}</Text>
                                <Text style={styles.colDesc}>{item.productName}</Text>
                                <Text style={styles.colQty}>{item.quantity}</Text>
                                <Text style={styles.colPrice}>{item.unitPrice.toLocaleString(undefined, { minimumFractionDigits: 8, maximumFractionDigits: 8 })}</Text>
                                <Text style={styles.colTotal}>{(item.quantity * item.unitPrice).toLocaleString(undefined, { minimumFractionDigits: 8, maximumFractionDigits: 8 })}</Text>
                            </View>
                        ))}
                        {/* Total Quantity Row */}
                        <View style={styles.tableRow}>
                            <Text style={{ width: '50%', paddingLeft: 4 }}>จำนวนสินค้าที่สั่งซื้อ ({data.items[0]?.unit || 'ห่อ'})</Text>
                            <Text style={styles.colQty}>{totalQty}</Text>
                            <Text style={{ width: '40%' }}></Text>
                        </View>
                    </View>

                    {/* Summary */}
                    {/* Summary */}
                    <View style={styles.summaryTable}>
                        {/* Row 1: Shipping */}
                        <View style={styles.summaryRow}>
                            <Text style={styles.summaryLabelCol}>ค่าขนส่ง (ไม่หัก VAT 7%)</Text>
                            <Text style={styles.summaryValueCol}>{shippingCost.toLocaleString(undefined, { minimumFractionDigits: 2 })}</Text>
                        </View>
                        {/* Row 2: Subtotal */}
                        <View style={styles.summaryRow}>
                            <Text style={styles.summaryLabelCol}>ราคาสินค้าก่อนภาษีมูลค่าเพิ่ม </Text>
                            <Text style={styles.summaryValueCol}>{subtotal.toLocaleString(undefined, { minimumFractionDigits: 8, maximumFractionDigits: 8 })}</Text>
                        </View>
                        {/* Row 3: VAT */}
                        <View style={styles.summaryRow}>
                            <Text style={styles.summaryLabelCol}>ภาษีมูลค่าเพิ่ม 7%</Text>
                            <Text style={styles.summaryValueCol}>{vatAmount.toLocaleString(undefined, { minimumFractionDigits: 8, maximumFractionDigits: 8 })}</Text>
                        </View>
                        {/* Row 4: Net Total */}
                        <View style={styles.netTotalRowNew}>
                            <Text style={{ ...styles.netTotalLabelCol, color: '#0099cc', fontWeight: 'bold' }}>รายรับสุทธิ</Text>
                            <Text style={{ ...styles.netTotalTextCol, color: '#0099cc', fontWeight: 'bold' }}>{thaiText} </Text>
                            <Text style={{ ...styles.netTotalValueCol, color: '#0099cc', fontWeight: 'bold', fontSize: 12 }}>{grandTotal.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} บาท</Text>
                        </View>
                    </View>



                    {/* Transfer Details Box */}
                    <View style={{ marginTop: 15, borderWidth: 1, borderColor: '#000', padding: 8, width: '55%', alignSelf: 'flex-start' }}>
                        <Text style={{ fontSize: 10, fontWeight: 'bold', marginBottom: 2 }}>กรุณาโอนเงินตามหมายเลขบัญชี</Text>
                        <Text style={{ fontSize: 10 }}>ธนาคารกสิกรไทย สาขาถนนเจริญเมือง เชียงใหม่ </Text>
                        <Text style={{ fontSize: 10 }}>ออมทรัพย์ 156-1-07114-0</Text>
                        <Text style={{ fontSize: 10 }}>บริษัท ตรีเอกอุตสาหกรรมอาหาร จำกัด  </Text>
                    </View>

                    {/* Footer Signatures */}
                    <View style={styles.footer}>
                        <View style={styles.signatureBlock}>
                            <View style={styles.signLine} />
                            <Text style={styles.signatureText}>ผู้รับสินค้า</Text>
                            <Text style={styles.signatureText}> </Text>
                            <Text style={styles.signatureText}> </Text>
                            <View style={{ flexDirection: 'row', marginTop: 5 }}>
                                <Text style={styles.signatureText}> </Text>
                                <Text style={{ fontSize: 9 }}>วันที่ __________________________</Text>
                            </View>
                        </View>
                        <View style={styles.signatureBlock}>
                            <View style={styles.signLine} />
                            <Text style={styles.signatureText}>ผู้ส่งสินค้า</Text>
                            <Text style={styles.signatureText}> </Text>
                            <Text style={styles.signatureText}> </Text>
                            <View style={{ flexDirection: 'row', marginTop: 5 }}>
                                <Text style={styles.signatureText}> </Text>
                                <Text style={{ fontSize: 9 }}>วันที่ __________________________</Text>
                            </View>
                        </View>
                        <View style={styles.signatureBlock}>
                            <View style={styles.signLine} />
                            <Text style={styles.signatureText}>นายทรงวุฒิ เดชะ </Text>
                            <Text style={styles.signatureText}>(ผู้มีอำนาจลงนาม) </Text>
                            <Text style={styles.signatureText}> </Text>
                            <View style={{ flexDirection: 'row', marginTop: 5 }}>
                                <Text style={styles.signatureText}> </Text>
                                <Text style={{ fontSize: 9 }}>วันที่ __________________________</Text>
                            </View>
                        </View>
                    </View>
                </Page >
            ))}
        </Document >
    );
};

export default POTemplate;
