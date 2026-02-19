"use client";

export default function Layout({ children }: { children: React.ReactNode }) {
    return (
        <div className="min-h-screen w-full">
            <main className="w-full">
                {children}
            </main>
        </div>
    );
}
