"use client";

import React, { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import RoleGuard from '@/components/RoleGuard';
import { CreditCard, Trash2, Plus, Globe, Pencil } from 'lucide-react';
import { useData } from '@/context/DataContext';
export default function PaymentsPage() {
    const { user } = useAuth();
    const { paymentMethods , fetchPaymentMethods, addPaymentMethod, deletePaymentMethod } = useData();

    const [isAdding, setIsAdding] = useState(false);
    const [newMethod, setNewMethod] = useState({ name: '', type: 'UPI', country: 'INDIA' });


    React.useEffect(() => {
        fetchPaymentMethods(user.country, user.role);
    }, []);

    const handleAdd = async (e) => {
        e.preventDefault();
        const result = await addPaymentMethod(newMethod);
        if (result.success) {
            setIsAdding(false);
            setNewMethod({ name: '', type: 'UPI', country: 'INDIA' });
        } else {
            alert('Error adding payment method: ' + result.error);
        }
    }
    const handleDelete = async (methodId) => {
        if (confirm('Are you sure you want to delete this payment method?')) {
            const result = await deletePaymentMethod(methodId);
            if (!result.success) {
                alert('Error deleting payment method: ' + result.error);
            }
        }
    }



   

    return (
        <RoleGuard allowedRoles={['ADMIN']}>
            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <h2 className="text-2xl font-bold text-slate-800">Payment Methods</h2>
                    <button
                        onClick={() => setIsAdding(true)}
                        className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium shadow-md shadow-blue-500/20"
                    >
                        <Plus size={16} />
                        Add New Method
                    </button>
                </div>

                {isAdding && (
                    <div className="bg-slate-50 p-6 rounded-xl border border-slate-200 animate-in fade-in slide-in-from-top-4">
                        <h3 className="font-bold text-slate-800 mb-4">Add Payment Method</h3>
                        <form onSubmit={handleAdd} className="grid gap-4 md:grid-cols-4 items-end">
                            <div>
                                <label className="block text-xs font-semibold text-slate-500 mb-1">Method Name</label>
                                <input
                                    type="text"
                                    value={newMethod.name}
                                    onChange={e => setNewMethod({ ...newMethod, name: e.target.value })}
                                    className="w-full px-3 py-2 rounded-lg border border-slate-300 text-slate-700 placeholder-slate-400"
                                    placeholder="e.g. Paytm UPI"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-semibold text-slate-500 mb-1">Type</label>
                                <select
                                    value={newMethod.type}
                                    onChange={e => setNewMethod({ ...newMethod, type: e.target.value })}
                                    className="w-full px-3 py-2 rounded-lg border border-slate-300 text-slate-700"
                                >
                                    <option value="UPI">UPI</option>
                                    <option value="CARD">Card</option>
                                    <option value="STRIPE">Stripe</option>
                                    <option value="CASH">Cash</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-xs font-semibold text-slate-500 mb-1">Country</label>
                                <select
                                    value={newMethod.country}
                                    onChange={e => setNewMethod({ ...newMethod, country: e.target.value })}
                                    className="w-full px-3 py-2 rounded-lg border border-slate-300 text-slate-700"
                                >
                                    <option value="INDIA">India</option>
                                    <option value="USA">USA</option>
                                </select>
                            </div>
                            <div className="flex gap-2">
                                <button type="submit" className="px-4 py-2 bg-slate-900 text-white rounded-lg text-sm font-medium hover:bg-slate-800">
                                    Save
                                </button>
                                <button type="button" onClick={() => setIsAdding(false)} className="px-4 py-2 text-slate-600 hover:bg-slate-200 rounded-lg text-sm">Cancel</button>
                            </div>
                        </form>
                    </div>
                )}

                <div className="grid gap-4">
                    {paymentMethods.map((method) => (
                        <div key={method._id} className="bg-white p-5 rounded-xl shadow-sm border border-slate-200 flex items-center justify-between group hover:border-blue-300 transition-colors">
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 bg-slate-50 rounded-lg flex items-center justify-center text-slate-400">
                                    <CreditCard size={24} />
                                </div>
                                <div>
                                    <h3 className="font-bold text-slate-900">{method.name}</h3>
                                    <div className="flex items-center gap-2 text-xs text-slate-500 mt-1">
                                        <span className="bg-slate-100 px-2 py-0.5 rounded font-mono">{method.type}</span>
                                        <span className="flex items-center gap-1">
                                            <Globe size={10} /> {method.country}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            <div className="flex gap-2">
                                <button
                                    onClick={() => handleDelete(method._id)}
                                    className="text-slate-400 hover:text-red-500 p-2 hover:bg-red-50 rounded-lg transition-colors border border-transparent hover:border-red-100"
                                    title="Delete"
                                >
                                    <Trash2 size={18} />
                                </button>
                            </div>
                        </div>
                    ))}
                    {paymentMethods.length === 0 && (
                        <p className="text-center text-slate-500 py-10">No payment methods found.</p>
                    )}
                </div>
            </div>
        </RoleGuard>
    );
}
