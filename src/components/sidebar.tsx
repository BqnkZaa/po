"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { LayoutDashboard, ShoppingCart, Truck, Package, Settings, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";

const navItems = [
    { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
    { href: "/purchase-orders", label: "Purchase Orders", icon: FileText },
    { href: "/suppliers", label: "Suppliers", icon: Truck },
    { href: "/products", label: "Products", icon: Package },
    { href: "/settings", label: "Settings", icon: Settings },
];

export function Sidebar() {
    const pathname = usePathname();

    return (
        <div className="flex flex-col h-full border-r bg-card w-64 fixed left-0 top-0 overflow-y-auto z-10">
            <div className="p-6">
                <h1 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                    Tri-Ek PO System
                </h1>
            </div>
            <div className="flex-1 px-4 space-y-2">
                {navItems.map((item) => {
                    const isActive = pathname.startsWith(item.href);
                    return (
                        <Link key={item.href} href={item.href} passHref>
                            <Button
                                variant={isActive ? "secondary" : "ghost"}
                                className={cn(
                                    "w-full justify-start gap-3 h-12 text-sm font-medium transition-all duration-200",
                                    isActive
                                        ? "bg-blue-50 text-blue-700 hover:bg-blue-100 dark:bg-blue-950 dark:text-blue-200"
                                        : "text-muted-foreground hover:text-foreground"
                                )}
                            >
                                <item.icon className="h-4 w-4" />
                                {item.label}
                            </Button>
                        </Link>
                    );
                })}
            </div>
            <div className="p-4 border-t">
                <div className="flex items-center gap-3 px-2 py-2">
                    <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold text-xs">
                        A
                    </div>
                    <div className="flex flex-col">
                        <span className="text-xs font-medium">Admin User</span>
                        <span className="text-[10px] text-muted-foreground">admin@tri-ek.com</span>
                    </div>
                </div>
            </div>
        </div>
    );
}
