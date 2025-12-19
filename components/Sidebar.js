"use client";

import { useAuth } from '@/context/AuthContext';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import {
    LayoutDashboard,
    UtensilsCrossed,
   
    CreditCard,
    ClipboardList,

} from 'lucide-react';

const MENU_ITEMS = [
    { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard, roles: ['ADMIN', 'MANAGER', 'MEMBER'] },
    { name: 'Restaurants', path: '/restaurants', icon: UtensilsCrossed, roles: ['ADMIN', 'MANAGER', 'MEMBER'] },
   
    { name: 'Orders', path: '/orders', icon: ClipboardList, roles: ['ADMIN', 'MANAGER', 'MEMBER'] },
    { name: 'Payments', path: '/payments', icon: CreditCard, roles: ['ADMIN'] }, 
];

export default function Sidebar({ isOpen, onClose }) {
    const { user, logout } = useAuth(); 
    const pathname = usePathname();

    if (!user) return null;

    const filteredMenu = MENU_ITEMS.filter(item => item.roles.includes(user.role));

    return (
        <aside className={`fixed inset-y-0 left-0 z-40 w-72 bg-slate-700 text-white transform transition-transform duration-300 md:translate-x-0 ${isOpen ? 'translate-x-0' : '-translate-x-full shadow-none'} shadow-2xl md:shadow-none flex flex-col`}>

          
            <div className="p-8 pb-0">
                <div className="flex items-center gap-3 mb-8">
                    <div className="w-10 h-10 bg-blue-500 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/30">
                        <UtensilsCrossed size={20} className="text-white" />
                    </div>
                    <div>
                        <h1 className="text-lg font-bold tracking-tight">Restaurant System</h1>
                    </div>
                </div>

                <div className="h-px bg-slate-800 w-full mb-6" />
            </div>

 
            <nav className="flex-1 px-4 space-y-2 overflow-y-auto">
                <p className="px-4 text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Main Menu</p>
                {filteredMenu.map((item) => {
                    const isActive = pathname.startsWith(item.path);
                    const Icon = item.icon;
                    return (
                        <Link
                            key={item.path}
                            href={item.path}
                            onClick={onClose} 
                            className={`flex items-center gap-3 px-4 py-3.5 rounded-xl transition-all duration-200 group relative overflow-hidden ${isActive ? 'bg-blue-500 text-white shadow-lg shadow-blue-900/50 font-semibold' : 'text-slate-400 hover:text-white hover:bg-slate-800'}`}
                        >
                            <Icon size={20} className={isActive ? 'text-white' : 'text-slate-500 group-hover:text-white transition-colors'} />
                            <span className="relative z-10">{item.name}</span>
                            {isActive && <div className="absolute right-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-white/20 rounded-l-full" />}
                        </Link>
                    );
                })}
            </nav>

          
        </aside>
    );
}
