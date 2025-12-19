"use client";

import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Sidebar from "@/components/Sidebar";
import Navbar from "@/components/Navbar";
import { Menu } from "lucide-react";

export default function DashboardLayout({ children }) {
    const { isAuthenticated, isLoading, user } = useAuth(); // Now using Context hook directly
    const router = useRouter();
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);

    useEffect(() => {
        if (!isLoading && !isAuthenticated) {
            router.push('/');
        }
    }, [isLoading, isAuthenticated, router]);

    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-slate-50">
                <div className="flex flex-col items-center gap-4">
                    <div className="w-12 h-12 border-4 border-slate-200 border-t-blue-600 rounded-full animate-spin" />
                    <p className="text-slate-500 font-medium animate-pulse">Loading dashboard...</p>
                </div>
            </div>
        );
    }

    if (!isAuthenticated || !user) {
        return null; // Will redirect
    }

    return (
        <div className="min-h-screen bg-slate-50 flex">
            {/* Sidebar - Desktop & Mobile */}
            <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />

            {/* Main Content */}
            <div className="flex-1 flex flex-col min-h-screen transition-all duration-300 md:ml-72">
                <Navbar onMenuClick={() => setIsSidebarOpen(true)} />
                <main className="flex-1 p-6 md:p-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                    {children}
                </main>
            </div>

            {/* Mobile Sidebar Overlay */}
            {isSidebarOpen && (
                <div
                    className="fixed inset-0 bg-black/50 z-30 md:hidden backdrop-blur-sm animate-in fade-in duration-200"
                    onClick={() => setIsSidebarOpen(false)}
                />
            )}
        </div>
    );
}
