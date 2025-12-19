"use client";

import React, { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { usePathname } from 'next/navigation';
import { LogOut, Menu, Bell, Search, ChevronDown, User } from 'lucide-react';

export default function Navbar({ onMenuClick }) {
    const pathname = usePathname();
    const { user, logout } = useAuth();
    const [showSignOut, setShowSignOut] = useState(false);

    const getPageTitle = () => {
        if (pathname.includes('/dashboard')) return 'Overview';
        if (pathname.includes('/restaurants')) return 'Restaurants';
        if (pathname.includes('/orders')) return 'Orders';
        if (pathname.includes('/cart')) return 'My Cart';
        if (pathname.includes('/payments')) return 'Payments';
        return 'Dashboard';
    };

    const handleLogout = () => {
        if (confirm("Are you sure you want to sign out?")) {
            logout();
        }
    };

    if (!user) return null;

    return (
        <header className="sticky top-0 z-20 bg-white/80 backdrop-blur-md border-b border-slate-200 px-6 py-4 flex items-center justify-between">
            <div className="flex items-center gap-4">
                <button
                    onClick={onMenuClick}
                    className="p-2 -ml-2 hover:bg-slate-100 rounded-xl md:hidden text-slate-600 transition-colors"
                >
                    <Menu size={24} />
                </button>
                <h1 className="text-xl font-bold text-slate-800 hidden sm:block">{getPageTitle()}</h1>
            </div>

           

            <div className="flex items-center gap-3 sm:gap-6">
               

                <div className="relative">
                    <button
                        onClick={() => setShowSignOut(!showSignOut)}
                        className="flex items-center gap-3 pl-1 pr-2 py-1 rounded-full hover:bg-slate-50 transition-all border border-transparent hover:border-slate-200"
                    >
                        <div className="w-9 h-9 bg-gradient-to-tr from-blue-600 to-indigo-600 rounded-full flex items-center justify-center text-white font-bold shadow-md shadow-blue-500/20">
                            {user.name.charAt(0)}
                        </div>
                        <div className="hidden sm:block text-left">
                            <p className="text-sm font-bold text-slate-900 leading-none">{user.name}</p>
                            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wide mt-0.5">{user.role}</p>
                        </div>
                        <ChevronDown size={14} className="text-slate-400" />
                    </button>

                    {showSignOut && (
                        <>
                            <div className="fixed inset-0 z-10" onClick={() => setShowSignOut(false)} />
                            <div className="absolute right-0 top-full mt-2 w-48 bg-white rounded-xl shadow-xl border border-slate-100 py-1 overflow-hidden z-20 animate-in fade-in slide-in-from-top-2">
                             
                               
                                <button
                                    onClick={handleLogout}
                                    className="w-full text-left px-4 py-3 text-sm text-red-600 hover:bg-red-50 flex items-center gap-2 transition-colors font-medium border-t border-slate-50"
                                >
                                    <LogOut size={16} /> Sign Out
                                </button>
                            </div>
                        </>
                    )}
                </div>
            </div>
        </header>
    );
}
