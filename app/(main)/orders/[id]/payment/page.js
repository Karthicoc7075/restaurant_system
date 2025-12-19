"use client";

import React, { useState, use } from 'react';
import { useData } from '@/context/DataContext';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { CheckCircle, CreditCard, ArrowLeft, ShieldCheck, XCircle } from 'lucide-react';
import Link from 'next/link';

export default function OrderPaymentPage({ params }) {
    const { id } = use(params);
    const router = useRouter();
   
    const { orders, updateOrderStatus, cancelOrder, fetchPaymentMethods, fetchOrders } = useData();
    const { user } = useAuth();

    const [paymentMethod, setPaymentMethod] = useState('');
    const [isProcessing, setIsProcessing] = useState(false);
    const [showSuccess, setShowSuccess] = useState(false);


    React.useEffect(() => {
        fetchOrders();
        fetchPaymentMethods(user.country);
        
    }, []);
    const order = orders.find(o => o._id === id);

    if (!order) {
        return <div className="p-10 text-center">Order not found.</div>;
    }

    if (order.status === 'PAID' && !showSuccess) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] text-center space-y-6">
                <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center">
                    <CheckCircle className="text-green-600" size={40} />
                </div>
                <h2 className="text-2xl font-bold text-slate-900">Order Already Paid</h2>
                <Link href="/orders" className="text-blue-600 font-medium hover:underline">Return to Orders</Link>
            </div>
        );
    }



    const handlePayment = async () => {

        if(!paymentMethod){
            alert("Please select a payment method.");
            return;
        }

        setIsProcessing(true);

        await new Promise(resolve => setTimeout(resolve, 1500));

        await updateOrderStatus(order._id, 'PAID',paymentMethod);

        setIsProcessing(false);
        setShowSuccess(true);
    };

    const handleCancel = async () => {
        if (confirm('Are you sure you want to cancel this order?')) {
            await cancelOrder(order._id);
            router.push('/orders'); 
        }
    };

    return (
        <div className="max-w-2xl mx-auto space-y-6 relative">
            <div className="flex items-center gap-4 mb-8">
                <Link href="/orders" className="p-2 hover:bg-slate-100 rounded-lg transition-colors text-slate-500">
                    <ArrowLeft size={20} />
                </Link>
                <h1 className="text-2xl font-bold text-slate-800">Complete Payment</h1>
            </div>

            {/* Success Modal */}
            {showSuccess && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-in fade-in duration-200">
                    <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm p-6 text-center animate-in zoom-in-95 duration-200 scale-100">
                        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                            <CheckCircle className="text-green-600 w-8 h-8" />
                        </div>
                        <h3 className="text-xl font-bold text-slate-900 mb-2">Order Completed Successfully!</h3>
                        <p className="text-slate-500 text-sm mb-6">
                            Thank you for your payment. Your order is now completed.
                        </p>
                        <button
                            onClick={() => router.push('/orders')}
                            className="w-full py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-lg font-medium transition-colors"
                        >
                            Close
                        </button>
                    </div>
                </div>
            )}

            <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-200">
                <div className="flex justify-between items-start mb-6 border-b border-slate-100 pb-6">
                    <div>
                        <p className="text-sm text-slate-500 font-mono mb-1">ORDER ID: {order._id}</p>
                        <h2 className="text-xl font-bold text-slate-900">{order.restaurantName}</h2>
                    </div>
                    <span className="px-3 py-1 bg-blue-50 text-blue-700 text-xs font-bold rounded-full uppercase tracking-wider">
                        {order.status}
                    </span>
                </div>

                <div className="space-y-3 mb-8">
                    {order.items.map((item, idx) => (
                        <div key={idx} className="flex justify-between text-sm">
                            <div className="flex gap-3">
                                <span className="font-semibold text-slate-900 bg-slate-100 w-6 h-6 flex items-center justify-center rounded text-xs">{item.quantity}</span>
                                <span className="text-slate-600">{item.name}</span>
                            </div>
                            <span className="font-medium text-slate-900">${(item.price * item.quantity).toFixed(2)}</span>
                        </div>
                    ))}
                    <div className="h-px bg-slate-100 my-4" />
                    <div className="flex justify-between items-center text-lg">
                        <span className="font-bold text-slate-900">Total Amount</span>
                        <span className="font-bold text-slate-900">${order.totalAmount.toFixed(2)}</span>
                    </div>
                </div>

                <div className="space-y-4">
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider">Select Payment Method</label>
<div>
 
                        {useData().paymentMethods.length > 0 ? (
                            useData().paymentMethods.map(method => (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 place-items-stretch">
                                <button
                                    key={method._id}
                                    onClick={() => setPaymentMethod(method.name)}
                                    className={`p-4 rounded-xl border flex items-center gap-3 transition-all ${paymentMethod === method.name ? 'border-blue-500 bg-blue-50 ring-1 ring-blue-500' : 'border-slate-200 hover:border-blue-300'}`}
                                >
                                    <div className={`w-5 h-5 rounded-full border flex items-center justify-center ${paymentMethod === method.name ? 'border-blue-500' : 'border-slate-300'}`}>
                                        {paymentMethod === method.name && <div className="w-2.5 h-2.5 bg-blue-500 rounded-full" />}
                                    </div>
                                    <span className="font-semibold text-slate-700">{method.name} ({method.type})</span>
                                </button>
                                 </div>
                            ))
                        ) : (
                          <div className='w-[100%] flex justify-center '>
                              <div className="flex flex-col items-center gap-4">
                    <div className="w-12 h-12 border-4 border-slate-200 border-t-blue-600 rounded-full animate-spin" />
                    <p className="text-slate-500 font-medium animate-pulse">Loading payment methods...</p>
                </div>
                            </div>
                        )}
</div>
                   
                   

                    <div className="grid grid-cols-2 gap-4 mt-6">
                        <button
                            onClick={handleCancel}
                            disabled={isProcessing}
                            className="w-full py-4 bg-white border border-slate-200 text-slate-700 rounded-xl font-bold text-lg hover:bg-slate-50 transition-all flex items-center justify-center gap-2 group disabled:opacity-70 disabled:cursor-not-allowed"
                        >
                            <XCircle size={20} className="text-slate-400 group-hover:text-red-500 transition-colors" /> Cancel
                        </button>
                        <button
                            onClick={handlePayment}
                            disabled={isProcessing}
                            className="w-full py-4 bg-slate-900 text-white rounded-xl font-bold text-lg hover:bg-slate-800 transition-all shadow-xl shadow-slate-900/10 flex items-center justify-center gap-2 group disabled:opacity-70 disabled:cursor-not-allowed"
                        >
                            {isProcessing ? 'Processing' : (
                                <>
                                    <ShieldCheck size={20} /> Pay Now
                                </>
                            )}
                        </button>
                    </div>


                </div>
            </div>
        </div>
    );
}
