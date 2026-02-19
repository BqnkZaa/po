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
        color: 'red',
        fontWeight: 'bold',
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
        backgroundColor: '#0055aa', // Blue for receipt pages
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
    colNo: { width: '8%', textAlign: 'center' },
    colDesc1: { width: '42%', color: 'cyan' },
    colDesc: { width: '42%' },
    colQty: { width: '10%', textAlign: 'center' },
    colPrice: { width: '20%', textAlign: 'right' },
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
    const totalQty = data.items.reduce((sum, item) => sum + item.quantity, 0);
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
                            <Text style={styles.taxID}>0505566007959</Text>
                        </View>
                    </View>

                    <View style={styles.line} />

                    {/* Info Blocks */}
                    <View style={styles.infoContainer}>
                        {/* Left Block: Supplier */}
                        <View style={styles.supplierBox}>
                            <Text style={styles.infoLabel}>ผู้จำหน่าย </Text>
                            <Text style={styles.infoText}>{data.supplier.companyName} </Text>
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
                            <Text style={styles.colNo}>ลำดับที่ </Text>
                            <Text style={styles.colDesc1}>รายการสินค้า</Text>
                            <Text style={styles.colQty}>จำนวนห่อ </Text>
                            <Text style={styles.colPrice}>ราคา/หน่วย</Text>
                            <Text style={styles.colTotal}>รวม</Text>
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
                    </View>

                    {/* Summary */}
                    <View style={styles.summaryContainer}>
                        <View style={styles.summaryContent}>
                            <View style={styles.totalsBox}>
                                <View style={{ backgroundColor: '#f9f9f9', padding: 10, borderRadius: 2, marginBottom: 5 }}>
                                    <View style={styles.totalRow}>
                                        <Text style={styles.totalLabel}>ราคาสินค้าก่อนหักภาษี</Text>
                                        <Text style={styles.totalValue}>{subtotal.toLocaleString(undefined, { minimumFractionDigits: 8, maximumFractionDigits: 8 })}</Text>
                                    </View>
                                    <View style={styles.totalRow}>
                                        <Text style={styles.totalLabel}>ภาษีมูลค่าเพิ่ม 7%</Text>
                                        <Text style={styles.totalValue}>{vatAmount.toLocaleString(undefined, { minimumFractionDigits: 8, maximumFractionDigits: 8 })}</Text>
                                    </View>
                                    <View style={styles.totalRow}>
                                        <Text style={styles.totalLabel}>ค่าขนส่ง</Text>
                                        <Text style={styles.totalValue}>{shippingCost.toLocaleString(undefined, { minimumFractionDigits: 2 })}</Text>
                                    </View>
                                    <View style={styles.totalRow}>
                                        <Text style={styles.totalLabel}>จำนวนสินค้าที่สั่งซื้อ ({data.items[0]?.unit || 'หน่วย'})</Text>
                                        <Text style={styles.totalValue}>{totalQty}</Text>
                                    </View>
                                </View>

                                <View style={styles.netTotalRow}>
                                    <Text style={styles.netTotalLabel}>รายรับสุทธิ</Text>
                                    <Text style={{ ...styles.netTotalText, color: '#0099cc' }}>{thaiText}บาทถ้วน</Text>
                                </View>
                            </View>
                        </View>
                    </View>

                    {/* Footer Signatures */}
                    <View style={styles.footer}>
                        <View style={styles.signatureBlock}>
                            <View style={styles.signLine} />
                            <Text style={styles.signatureText}>ผู้รับสินค้า</Text>
                            <View style={{ flexDirection: 'row', marginTop: 5 }}>
                                <Text style={{ fontSize: 9 }}>วันที่ ___/___/______</Text>
                            </View>
                        </View>
                        <View style={styles.signatureBlock}>
                            <View style={styles.signLine} />
                            <Text style={styles.signatureText}>ผู้ส่งสินค้า</Text>
                            <View style={{ flexDirection: 'row', marginTop: 5 }}>
                                <Text style={{ fontSize: 9 }}>วันที่ ___/___/______</Text>
                            </View>
                        </View>
                        <View style={styles.signatureBlock}>
                            <View style={styles.signLine} />
                            <Text style={styles.signatureText}>ผู้มีอำนาจลงนาม </Text>
                            <View style={{ flexDirection: 'row', marginTop: 5 }}>
                                <Text style={{ fontSize: 9 }}>วันที่ ___/___/______</Text>
                            </View>
                        </View>
                    </View>
                </Page>
            ))}
        </Document>
    );
};

export default POTemplate;
