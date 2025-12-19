"use client";

import React, { useEffect } from 'react';
import { useData } from '@/context/DataContext';
import { useAuth } from '@/context/AuthContext';
import { Clock, CheckCircle, XCircle, Slash } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function OrdersPage() {
    const { orders, isLoading, fetchOrders, cancelOrder } = useData();
    const { user } = useAuth();
    const router = useRouter();

    useEffect(() => {
        fetchOrders();
    }, []);

    if (!user) return null;

    const filteredOrders = user.role === 'ADMIN'
        ? orders
        : orders.filter(o => o.country === user.country);

    const canManageOrders = ['ADMIN', 'MANAGER'].includes(user.role);

    const handlePay = (orderId) => {
        router.push(`/orders/${orderId}/payment`);
    };

    const handleCancel = (orderId) => {
        if (confirm('Are you sure you want to cancel this order?')) {
            cancelOrder(orderId);
        }
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'PAID': return 'bg-green-100 text-green-700 border-green-200';
            case 'CANCELED': return 'bg-red-100 text-red-700 border-red-200';
            default: return 'bg-blue-100 text-blue-700 border-blue-200';
        }
    };

    if (isLoading && orders.length === 0) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <h2 className="text-2xl font-bold text-slate-800">Orders ({filteredOrders.length})</h2>

            <div className="grid gap-4">
                {filteredOrders.map((order) => (
                    <div key={order.id || order._id} className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                        <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                                <span className="font-mono text-xs text-slate-400">#{order._id}</span>
                                <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold border ${getStatusColor(order.status)}`}>
                                    {order.status}
                                </span>
                                <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider bg-slate-100 px-2 py-0.5 rounded">
                                    {order.country}
                                </span>
                            </div>
                            <h3 className="font-bold text-slate-900">{order.restaurantName }</h3>
                            <p className="text-sm text-slate-500 mt-1">
                                {order.items.map(i => `${i.quantity}x ${i.name}`).join(', ')}
                            </p>
                            <p className="text-xs text-slate-400 mt-2">
                                {new Date(order.createdAt).toLocaleString()}
                            </p>
                        </div>

                        <div className="flex items-center gap-6">
                            <div className="text-right">
                                <p className="text-sm text-slate-500">Total Amount</p>
                                <p className="text-xl font-bold text-slate-900 ml-auto">${order.totalAmount.toFixed(2)}</p>
                            </div>

                            {/* Actions */}
                            <div className="flex items-center gap-3">
                                {canManageOrders && order.status === "CREATED" && (
                                    <>
                                        <button onClick={() => handlePay(order.id || order._id)} className="flex items-center gap-2 px-6 py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-sm font-bold transition-all shadow-lg shadow-slate-900/10 active:scale-95" > <CheckCircle size={18} />  Pay </button>
                                        <button
                                            onClick={() => handleCancel(order.id || order._id)}
                                            className="flex items-center gap-1.5 px-4 py-2.5
                                               border border-red-200 text-red-600
                                               hover:bg-red-50 rounded-xl text-sm
                                               transition-all active:scale-95"
                                        >
                                            <XCircle size={18} />
                                            Cancel
                                        </button>
                                    </>
                                )}

                                {!canManageOrders && order.status === "CREATED" && (
                                    <span className="px-3 py-1.5 text-xs font-medium
                                                 text-amber-700 bg-amber-100
                                                 rounded-full">
                                        Waiting for Manager Payment
                                    </span>
                                )}
                            </div>

                        </div>
                    </div>
                ))}

                {filteredOrders.length === 0 && (
                    <div className="text-center py-20 bg-white rounded-xl border border-slate-200 border-dashed text-slate-400">
                        <Slash size={48} className="mx-auto mb-4 opacity-20" />
                        <p>No orders found.</p>
                    </div>
                )}
            </div>

        </div>
    );
}
