"use client";

import React from 'react';
import { Page, Text, View, Document, StyleSheet, Font, Image } from '@react-pdf/renderer';

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
        marginBottom: 20,
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
        marginBottom: 4,
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
        fontSize: 10,
        color: '#666',
    },
    poNumber: {
        fontSize: 14,
        fontWeight: 'bold',
        color: '#0099cc',
    },
    originalBadge: {
        marginTop: 10,
        backgroundColor: '#0099cc',
        color: 'white',
        paddingVertical: 2,
        paddingHorizontal: 10,
        borderRadius: 10,
        alignSelf: 'flex-start',
        fontSize: 9,
    },
    line: {
        borderBottomWidth: 2,
        borderBottomColor: '#0099cc',
        marginTop: 10,
        marginBottom: 20,
    },

    // Info Blocks
    infoContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 20,
    },
    infoBox: {
        width: '48%',
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

    // Table
    table: {
        width: '100%',
        marginBottom: 10,
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
        borderBottomColor: '#ddd',
        paddingVertical: 6,
        paddingHorizontal: 4,
        alignItems: 'center',
    },
    colNo: { width: '8%', textAlign: 'center' },
    colDesc: { width: '52%' },
    colQty: { width: '10%', textAlign: 'center' },
    colPrice: { width: '15%', textAlign: 'right' },
    colTotal: { width: '15%', textAlign: 'right' },

    // Summary Section
    summaryContainer: {
        flexDirection: 'row',
        marginTop: 10,
    },
    bankInfo: {
        width: '55%',
        backgroundColor: '#f8f9fa',
        padding: 10,
        marginRight: 10,
        borderRadius: 4,
    },
    bankTitle: {
        fontSize: 10,
        fontWeight: 'bold',
        marginBottom: 4,
    },
    bankText: {
        fontSize: 9,
        marginBottom: 2,
    },
    totalsBox: {
        width: '45%',
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
        justifyContent: 'space-between',
        marginTop: 5,
        borderTopWidth: 2,
        borderTopColor: '#0099cc',
        paddingTop: 5,
        borderBottomWidth: 2,
        borderBottomColor: '#eee', // The image has line below too maybe?
        paddingBottom: 5,
    },
    netTotalLabel: {
        fontSize: 11,
        fontWeight: 'bold',
        color: '#0099cc',
    },
    netTotalValue: {
        fontSize: 11,
        fontWeight: 'bold',
        color: '#0099cc',
    },

    // Footer Signatures
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
        borderBottomColor: '#000',
        width: '100%',
        height: 1,
    },
    signatureText: {
        marginTop: 5,
        fontSize: 9,
    },
    dateLine: {
        marginTop: 15,
        borderBottomWidth: 1,
        borderBottomColor: '#eee', // Faint line for date
        width: '80%',
        textAlign: 'center',
        paddingBottom: 2,
    },
    dateLabel: {
        marginTop: 2,
        fontSize: 8,
        color: '#666',
    }
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
    const shippingCost = 0; // Hardcoded as per image 0.00
    const grandTotal = subtotal + vatAmount + shippingCost;
    const totalQty = data.items.reduce((sum, item) => sum + item.quantity, 0);

    return (
        <Document>
            <Page size="A4" style={styles.page}>
                {/* Header */}
                <View style={styles.headerContainer}>
                    <Text style={styles.companyTitle}>บริษัท ตรีเอกอุตสาหกรรมอาหาร จำกัด (สำนักงานใหญ่)</Text>
                    <Text style={styles.companyAddress}>19/12 ถ.หนองประทีป ต.หนองป่าครั่ง อ.เมือง จ.เชียงใหม่ 50000</Text>
                    <Text style={styles.companyAddress}>เบอร์โทรศัพท์ 081-599-6698, 086-900-7225 สำนักงาน 053-245-750</Text>
                    <View style={{ flexDirection: 'row' }}>
                        <Text style={styles.companyAddress}>เลขที่ประจำตัวผู้เสียภาษีอากร : </Text>
                        <Text style={styles.taxID}>0505566007959</Text>
                    </View>

                    <View style={styles.headerRight}>
                        <Text style={styles.poLabel}>เลขที่ PO</Text>
                        <Text style={styles.poNumber}>{data.poNumber}</Text>
                    </View>

                    <View style={styles.originalBadge}>
                        <Text>ต้นฉบับ</Text>
                    </View>
                </View>

                <View style={styles.line} />

                {/* Info Blocks */}
                <View style={styles.infoContainer}>
                    {/* Left Block: Supplier (Labelled as Customer/Supplier based on context) */}
                    <View style={styles.infoBox}>
                        <Text style={styles.infoLabel}>ผู้จำหน่าย</Text>
                        <Text style={styles.infoText}>{data.supplier.companyName}</Text>
                        <Text style={styles.infoTextRegular}>{data.supplier.address}</Text>
                        <Text style={styles.infoTextRegular}>โทร: {data.supplier.phone}</Text>
                        <Text style={styles.infoTextRegular}>เลขผู้เสียภาษี: {data.supplier.taxId}</Text>
                    </View>

                    {/* Right Block: Dates */}
                    <View style={styles.infoBox}>
                        <View style={{ alignItems: 'flex-end', marginBottom: 10 }}>
                            <Text style={styles.infoLabel}>วันที่สร้างรายการสั่งซื้อ</Text>
                            <Text style={styles.infoText}>{new Date(data.issueDate).toLocaleDateString('th-TH')}</Text>
                        </View>
                        <View style={{ alignItems: 'flex-end' }}>
                            <Text style={styles.infoLabel}>วันที่จัดส่ง</Text>
                            <Text style={{ ...styles.infoText, color: 'red' }}>{new Date(data.deliveryDate).toLocaleDateString('th-TH')}</Text>
                        </View>
                    </View>
                </View>

                {/* Table */}
                <View style={styles.table}>
                    <View style={styles.tableHeader}>
                        <Text style={styles.colNo}>#</Text>
                        <Text style={styles.colDesc}>รายการสินค้า</Text>
                        <Text style={styles.colQty}>จำนวน</Text>
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

                {/* Summary & Bank Info */}
                <View style={styles.summaryContainer}>
                    <View style={styles.bankInfo}>
                        <Text style={styles.bankTitle}>กรุณาโอนเงินตามหมายเลขบัญชี</Text>
                        <Text style={styles.bankText}>ธนาคารกสิกรไทย สาขาถนนเจริญนนทบุรี เชียงใหม่</Text>
                        <Text style={styles.bankText}>ออมทรัพย์ 156-1-07114-0</Text>
                        <Text style={styles.bankText}>บริษัท ตรีเอกอุตสาหกรรมอาหาร จำกัด</Text>
                    </View>

                    <View style={styles.totalsBox}>
                        <View style={styles.totalRow}>
                            <Text style={styles.totalLabel}>ราคาสินค้าก่อนหักภาษี</Text>
                            <Text style={styles.totalValue}>{subtotal.toLocaleString(undefined, { minimumFractionDigits: 8, maximumFractionDigits: 8 })}</Text>
                        </View>
                        <View style={styles.totalRow}>
                            <Text style={styles.totalLabel}>ภาษีมูลค่าเพิ่ม 7%</Text>
                            <Text style={styles.totalValue}>{vatAmount.toLocaleString(undefined, { minimumFractionDigits: 8, maximumFractionDigits: 8 })}</Text>
                        </View>
                        {/* Optional Shipping Cost if needed */}
                        <View style={styles.totalRow}>
                            <Text style={styles.totalLabel}>ค่าขนส่ง</Text>
                            <Text style={styles.totalValue}>{shippingCost.toLocaleString(undefined, { minimumFractionDigits: 2 })}</Text>
                        </View>
                        <View style={styles.totalRow}>
                            <Text style={styles.totalLabel}>จำนวนสินค้าที่สั่งซื้อ ({data.items[0]?.unit || 'หน่วย'})</Text>
                            <Text style={styles.totalValue}>{totalQty}</Text>
                        </View>

                        <View style={styles.netTotalRow}>
                            <Text style={styles.netTotalLabel}>รายรับสุทธิ</Text>
                            <Text style={styles.netTotalValue}>{grandTotal.toLocaleString(undefined, { minimumFractionDigits: 2 })} บาท</Text>
                        </View>
                    </View>
                </View>

                {/* Footer Signatures */}
                <View style={styles.footer}>
                    <View style={styles.signatureBlock}>
                        <View style={styles.signLine} />
                        <View style={{ flexDirection: 'row', justifyContent: 'center', marginTop: 5 }}>
                            <Text style={{ fontSize: 9 }}>วันที่ </Text>
                            <Text style={{ fontSize: 9 }}>___/___/______</Text>
                        </View>
                        <Text style={styles.signatureText}>ผู้รับสินค้า</Text>
                    </View>
                    <View style={styles.signatureBlock}>
                        <View style={styles.signLine} />
                        <View style={{ flexDirection: 'row', justifyContent: 'center', marginTop: 5 }}>
                            <Text style={{ fontSize: 9 }}>วันที่ </Text>
                            <Text style={{ fontSize: 9 }}>___/___/______</Text>
                        </View>
                        <Text style={styles.signatureText}>ผู้ส่งสินค้า</Text>
                    </View>
                    <View style={styles.signatureBlock}>
                        <View style={styles.signLine} />
                        <View style={{ flexDirection: 'row', justifyContent: 'center', marginTop: 5 }}>
                            <Text style={{ fontSize: 9 }}>วันที่ </Text>
                            <Text style={{ fontSize: 9 }}>___/___/______</Text>
                        </View>
                        <Text style={styles.signatureText}>ผู้มีอำนาจลงนาม</Text>
                    </View>
                </View>
            </Page>
        </Document>
    );
};

export default POTemplate;
