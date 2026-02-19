"use client";

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { FileText, List, Users } from 'lucide-react';

export default function NavTabs() {
    const pathname = usePathname();

    const tabs = [
        { name: 'สร้างออเดอร์', href: '/purchase-orders/create', icon: FileText },
        { name: 'PO ทั้งหมด', href: '/purchase-orders', icon: List },
        { name: 'ข้อมูลลูกค้า', href: '/customers', icon: Users },
    ];

    return (
        <div className="flex justify-center space-x-4 my-4">
            {tabs.map((tab) => {
                const isActive = pathname === tab.href;
                return (
                    <Link
                        key={tab.href}
                        href={tab.href}
                        className={cn(
                            "flex items-center space-x-2 px-6 py-2 rounded-lg font-medium transition-colors shadow-sm",
                            isActive
                                ? "bg-[#1a3dbf] text-white"
                                : "bg-white text-gray-600 hover:bg-gray-50 border border-gray-200"
                        )}
                    >
                        <tab.icon size={18} />
                        <span>{tab.name}</span>
                    </Link>
                );
            })}
        </div>
    );
}
