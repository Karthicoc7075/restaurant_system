"use client";
import React, { useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { useData } from "@/context/DataContext";
import { Users, ShoppingBag, CheckCircle, TrendingUp, ArrowRight, Ban, Clock, AlertCircle } from "lucide-react";
import Link from 'next/link';

export default function DashboardPage() {
    const { user } = useAuth();
    const { orders ,fetchOrders} = useData();

    if (!user) return null;


    useEffect(() => {
        fetchOrders(); // Ensure fresh data
    }, []);
    // 1. Filter by Country
    const countryOrders = user.role === 'ADMIN'
        ? orders
        : orders.filter(o => o.country === user.country);

    // 2. Filter by Time (Admin: All Time, Manager/Member: Today)
    const isTodayOnly = ['MANAGER', 'MEMBER'].includes(user.role);

    const filteredOrders = isTodayOnly
        ? countryOrders.filter(o => {
            const orderDate = new Date(o.createdAt).toDateString();
            const today = new Date().toDateString();
            return orderDate === today;
        })
        : countryOrders;

    // 3. Calculate Stats
    // Pending Orders should always show ALL active pending orders (Backlog), regardless of time filter
    const pendingOrders = countryOrders.filter(o => o.status === 'CREATED');

    // Other stats respect the time filter (e.g. "How many did I sell today?")
    const totalOrders = filteredOrders.length;
    const paidOrders = filteredOrders.filter(o => o.status === 'PAID');
    const cancelledOrders = filteredOrders.filter(o => o.status === 'CANCELED');

    const revenue = paidOrders.reduce((sum, o) => sum + o.totalAmount, 0);


    const statsConfig = [
        {
            label: "Total Orders",
            value: totalOrders,
            icon: ShoppingBag,
            color: 'text-blue-600',
            bg: 'bg-blue-50',
            show: true
        },
        {
            label: "Paid Orders",
            value: paidOrders.length,
            icon: CheckCircle,
            color: 'text-green-600',
            bg: 'bg-green-50',
            show: true
        },
        {
            label: "Pending Orders",
            value: pendingOrders.length,
            icon: Clock,
            color: 'text-amber-600',
            bg: 'bg-amber-50',
            show: user.role !== 'MEMBER' 
        },
        {
            label: "Cancelled",
            value: cancelledOrders.length,
            icon: Ban,
            color: 'text-red-600',
            bg: 'bg-red-50',
            show: true
        }
    ];

    const visibleStats = statsConfig.filter(s => s.show);

    return (
        <div className="max-w-6xl mx-auto space-y-10">

           
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h2 className="text-2xl font-semibold text-slate-900">Dashboard</h2>

                </div>
                <div className="flex items-center gap-2">
                    <span className="text-xs font-medium px-3 py-1 bg-slate-100 text-slate-600 rounded-full border border-slate-200">
                        {new Date().toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric' })}
                    </span>
                </div>
            </div>

      
            <div className={`grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6`}>
                {visibleStats.map((stat, index) => {
                    const Icon = stat.icon;
                    return (
                        <div key={index} className="bg-white p-6 rounded-xl border border-slate-100 hover:border-slate-300 transition-colors group">
                            <div className="flex items-start justify-between mb-4">
                                <div className={`p-2 rounded-lg ${stat.bg} ${stat.color}`}>
                                    <Icon size={20} />
                                </div>
                                {isTodayOnly && (
                                    <span className="text-[10px] font-bold text-slate-400 bg-slate-50 px-2 py-0.5 rounded-full">
                                        Today
                                    </span>
                                )}
                            </div>
                            <div className="space-y-1">
                                <p className="text-3xl font-bold text-slate-900 tracking-tight">{stat.value}</p>
                                <p className="text-sm font-medium text-slate-500">{stat.label}</p>
                            </div>
                        </div>
                    );
                })}
            </div>


        </div>
    );
}
