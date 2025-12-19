"use client";

import React, { useState, use } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useData } from '@/context/DataContext';
import { Plus, Minus, ShoppingCart, Trash2, X, Check } from 'lucide-react';
import { redirect, useRouter } from 'next/navigation';

export default function MenuPage({ params }) {
    const { id } = use(params);
    const { user } = useAuth();
    const {
        restaurants,
        cart,
        addToCart,
        removeFromCart,
        clearCart,
        placeOrder,
        addMenuItem
    } = useData();

    const restaurant = restaurants.find(r => r._id === id || r._id === id);
    const menuItems = restaurant?.menu || [];

    const [quantities, setQuantities] = useState({});


    const [showCreateModal, setShowCreateModal] = useState(false);
    const [newItem, setNewItem] = useState({ name: '', price: '', image: null, imagePreview: null });
    const [createErrors, setCreateErrors] = useState({});
    const [isSubmitting, setIsSubmitting] = useState(false);
  
 
    const [isCartOpen, setIsCartOpen] = useState(false);
    const [showConfirmationModal, setShowConfirmationModal] = useState(false);
    const [showSuccessModal, setShowSuccessModal] = useState(false);
  
    const [confirmedOrderId, setConfirmedOrderId] = useState(null);
    const [orderCreateLoading, setOrderCreateLoading] = useState(false);
    const router = useRouter();



    const restaurantCartItems = cart.filter(i => i.restaurantId === restaurant?._id);
    const cartTotal = restaurantCartItems.reduce((acc, item) => acc + (item.price * item.quantity), 0);

    if (!restaurant) {
        return <div className="p-8">Restaurant not found or loading...</div>;
    }

    const handleQuantityChange = (itemId, change) => {
        setQuantities(prev => {
            const current = prev[itemId] || 0;
            const valid = Math.max(0, current + change);
            return { ...prev, [itemId]: valid };
        });
    };

    const handleAddToCart = (item) => {
        console.log('Adding to cart:', item);
        const qty = quantities[item._id];
        if (qty > 0) {
            addToCart(
                { ...item, restaurantId: restaurant._id, restaurantName: restaurant.name, country: restaurant.country },
                qty
            );
            setQuantities(prev => ({ ...prev, [item._id]: 0 }));
            setIsCartOpen(true);
        }


        console.log('Current cart:', cart)
    };

    const handleRemoveFromCart = (itemId) => {
        removeFromCart(itemId);
    };

    const handleCartItemQuantity = (item, quantity) => {
        addToCart(item, quantity); 
    };

    const handleImageUpload = (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setNewItem(prev => ({ ...prev, image: file, imagePreview: reader.result }));
            };
            reader.readAsDataURL(file);
        }
    };

    const validateCreateForm = () => {
        const errors = {};
        if (!newItem.name.trim()) errors.name = "Food name is required";
        if (!newItem.price || parseFloat(newItem.price) <= 0) errors.price = "Price must be greater than 0";
        if (!newItem.imagePreview) errors.image = "Image is required";
        setCreateErrors(errors);
        return Object.keys(errors).length === 0;
    };

    const handleCreateItem = async (e) => {
        const formData = new FormData();
        e.preventDefault();
        if (!validateCreateForm()) return;

        setIsSubmitting(true);

        formData.append("name", newItem.name);
        formData.append("price", newItem.price);
        formData.append("image", newItem.image);

        await addMenuItem(restaurant._id,
            formData
        );

        setIsSubmitting(false);
        setShowCreateModal(false);
        setNewItem({ name: '', price: '', image: null, imagePreview: null });
        setCreateErrors({});
    };

    const handleInitialOrderClick = () => {
        setShowConfirmationModal(true);
    };
 

    const handleInitialOrderAdminClick = async () => {
        setOrderCreateLoading(true);
         const orderData = {
            userId:  user._id, 
            country: user.country,
            items: restaurantCartItems,
            totalAmount: cartTotal,
     
            restaurantId: restaurant._id,
            restaurantName: restaurant.name,
            status: 'CREATED'
        };

        const result = await placeOrder(orderData);
        if (result.success) {
            setConfirmedOrderId( result.order._id);
            clearCart();
            setShowConfirmationModal(false);
            setIsCartOpen(false);
          
            router.push(`/orders/${result.order._id}/payment`);
        } else {
            alert('Order failed: ' + result.error);
            setOrderCreateLoading(false);
        }
    }

    const handleConfirmOrder = async () => {
        const orderData = {
            userId:  user._id, 
            country: restaurant.country,
            items: restaurantCartItems,
            totalAmount: cartTotal,
         
            restaurantId: restaurant._id,
            restaurantName: restaurant.name,
            status: 'CREATED'
        };

        const result = await placeOrder(orderData);
        if (result.success) {
            setConfirmedOrderId( result.order._id);
            clearCart();
            setShowConfirmationModal(false);
            setIsCartOpen(false);
            setShowSuccessModal(true);
        } else {
            alert('Order failed: ' + result.error);
        }
    };

    return (
        <div className="relative">
            <div className={`max-w-5xl mx-auto space-y-8 transition-all duration-300 `}>
                <div className="relative rounded-2xl overflow-hidden h-64 shadow-xl">
                    <img src={restaurant.image} alt={restaurant.name} className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent flex items-end p-8">
                        <div className="text-white flex-1">
                            <h1 className="text-4xl font-bold mb-2">{restaurant.name}</h1>
                            <p className="text-white/80 flex items-center gap-2">
                                <span className="bg-white/20 px-2 py-0.5 rounded text-sm backdrop-blur-md">{restaurant.country}</span>
                                • Indian Cuisine • 4.5 Ratings
                            </p>
                        </div>
                        {['ADMIN', 'MANAGER', 'MEMBER'].includes(user.role) && (
                            <button
                                onClick={() => setShowCreateModal(true)}
                                className="bg-white text-slate-900 px-5 py-3 rounded-xl font-bold text-sm shadow-lg hover:bg-blue-50 transition-all flex items-center gap-2"
                            >
                                <Plus size={18} />
                                Add New Food
                            </button>
                        )}
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {menuItems.map(item => {
                        const qty = quantities[item._id] || 0;
                        const currencySymbol = restaurant.country === 'INDIA' ? '₹' : '$';

                        return (
                            <div key={item._id} className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden hover:shadow-lg transition-all duration-200 group flex flex-col">
                                <div className="h-48 w-full bg-slate-50 relative overflow-hidden">
                                    <img
                                        src={item.image}
                                        alt={item.name}
                                        className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-500"
                                    />
                                </div>

                                <div className="p-5 flex-1 flex flex-col">
                                    <div className="flex justify-between items-start mb-2">
                                        <h3 className="font-bold text-lg text-slate-900 leading-tight">{item.name}</h3>
                                        <span className="font-bold text-slate-900 text-lg">
                                            {currencySymbol}{item.price}
                                        </span>
                                    </div>

                                    <p className="text-sm text-slate-500 line-clamp-2 mb-4 flex-1">{item.description}</p>

                                    <div className="mt-auto flex items-center justify-between pt-4">
                                        <div className="flex items-center gap-3 bg-slate-50 rounded-lg p-1">
                                            <button
                                                onClick={() => handleQuantityChange(item._id, -1)}
                                                className="w-8 h-8 flex items-center justify-center rounded-md bg-white shadow-xs hover:bg-slate-200 text-slate-600 transition-colors"
                                                disabled={qty === 0}
                                            >
                                                <Minus size={14} />
                                            </button>
                                            <span className="w-4 text-center text-sm text-black font-semibold">{qty}</span>
                                            <button
                                                onClick={() => handleQuantityChange(item._id, 1)}
                                                className="w-8 h-8 flex items-center justify-center rounded-md bg-white shadow-xs hover:bg-slate-200 text-slate-600 transition-colors"
                                            >
                                                <Plus size={14} />
                                            </button>
                                        </div>

                                        <button
                                            onClick={() => handleAddToCart(item)}
                                            disabled={qty === 0}
                                            className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-200 disabled:text-slate-400 disabled:cursor-not-allowed text-white rounded-lg text-sm font-medium transition-colors shadow-lg shadow-blue-500/20 disabled:shadow-none"
                                        >
                                            <ShoppingCart size={16} />
                                            Add
                                        </button>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>

                {menuItems.length === 0 && (
                    <div className="text-center py-10 text-slate-500">No menu items available.</div>
                )}
            </div>

            <div className={`fixed top-0 right-0 h-full w-96 bg-white shadow-2xl transform transition-transform duration-300 z-50 border-l border-slate-100 flex flex-col ${isCartOpen ? 'translate-x-0' : 'translate-x-full'}`}>
                <div className="p-6 bg-slate-900 text-white flex items-center justify-between">
                    <h3 className="font-bold text-lg flex items-center gap-2">
                        <ShoppingCart size={20} /> Current Order
                    </h3>
                    <button onClick={() => setIsCartOpen(false)} className="text-slate-400 hover:text-white">Close</button>
                </div>

                <div className=" flex-1 overflow-y-auto p-6 space-y-4">
                    {restaurantCartItems.length === 0 ? (
                        <div className="flex flex-col items-center justify-center h-full text-slate-400 space-y-4">
                            <ShoppingCart size={48} className="opacity-20" />
                            <p>Your cart is empty</p>
                        </div>
                    ) : (
                        restaurantCartItems.map(item => (
                            <div key={item._id} className="bg-slate-50 p-4 rounded-xl border border-slate-100 space-y-3">
                                <div className="flex justify-between items-start">
                                    <div>
                                        <p className="font-semibold text-slate-900 text-sm">{item.name}</p>
                                        <p className="text-xs text-slate-500">${item.price}</p>
                                    </div>
                                    <button
                                        onClick={() => handleRemoveFromCart(item._id)}
                                        className="text-slate-400 hover:text-red-500 transition-colors p-1"
                                    >
                                        <Trash2 size={14} />
                                    </button>
                                </div>
                                <div className="flex justify-between items-center">
                                    <div className="flex items-center gap-3 bg-white border border-slate-200 rounded-lg p-1">
                                        <button
                                            onClick={() => handleCartItemQuantity(item, -1)} // Decr
                                            disabled={item.quantity <= 1}
                                            className="w-6 h-6 flex items-center justify-center rounded-md hover:bg-slate-100 text-slate-600 disabled:opacity-30"
                                        >
                                            <Minus size={12} />
                                        </button>
                                        <span className="w-4 text-center text-xs text-black font-bold">{item.quantity}</span>
                                        <button
                                            onClick={() => handleCartItemQuantity(item, 1)} // Incr
                                            className="w-6 h-6 flex items-center justify-center rounded-md hover:bg-slate-100 text-slate-600"
                                        >
                                            <Plus size={12} />
                                        </button>
                                    </div>
                                    <span className="font-bold text-slate-900 text-sm">${(item.price * item.quantity).toFixed(2)}</span>
                                </div>
                            </div>
                        ))
                    )}
                </div>

                <div className="p-6 border-t border-slate-100 bg-slate-50">
                    <div className="flex justify-between items-center mb-6">
                        <span className="text-slate-600">Total Amount</span>
                        <span className="text-2xl font-bold text-slate-900">${cartTotal.toFixed(2)}</span>
                    </div>

                    <div className="space-y-4">

                        {
                            user.role === 'MEMBER' ? (
                                <button
                                    onClick={handleInitialOrderClick}
                                    disabled={restaurantCartItems.length === 0}
                                    className="w-full py-3.5 bg-slate-900 text-white font-bold rounded-xl shadow-lg shadow-slate-900/20 hover:bg-slate-800 transition-all flex items-center justify-center gap-2"
                                >
                                    Create Order
                                </button>) :
                               orderCreateLoading ? (
                                <button
                                    disabled
                                    className="w-full py-3.5 bg-slate-900 text-white font-bold rounded-xl shadow-lg shadow-slate-900/20 flex items-center justify-center gap-2"
                                >
                                    <svg className="animate-spin h-5 w-5 mr-3 border-white border-t-2 rounded-full" viewBox="0 0 24 24"></svg>
                                    Creating Order...
                                </button>
                            ) :  (
                                    <button
                                        onClick={() =>handleInitialOrderAdminClick()}
                                        disabled={restaurantCartItems.length === 0}
                                        className="w-full py-3.5 bg-slate-900 text-white font-bold rounded-xl shadow-lg shadow-slate-900/20 hover:bg-slate-800 transition-all flex items-center justify-center gap-2"
                                    >
                                        Pay & Checkout
                                    </button>
                                )
                               
                        }
                    </div>
                </div>
            </div>

            {showCreateModal && (
                <div className="fixed inset-0 z-[70] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
                    <div className="bg-white rounded-2xl shadow-2xl p-6 w-full max-w-md scale-100 animate-in zoom-in-95 duration-200">
                        <div className="flex justify-between items-start mb-6">
                            <h3 className="text-xl font-bold text-slate-900">Add New Food Item</h3>
                            <button onClick={() => setShowCreateModal(false)} className="text-slate-400 hover:text-slate-600 transition-colors"><X size={24} /></button>
                        </div>

                        <form onSubmit={handleCreateItem} className="space-y-6 ">


                            <div className="space-y-1">
                                <label className="block text-sm font-bold text-slate-900">Food Name <span className="text-red-500">*</span></label>
                                <input
                                    type="text"
                                    value={newItem.name}
                                    onChange={e => setNewItem({ ...newItem, name: e.target.value })}
                                    className={`w-full p-3 border rounded-xl text-black outline-none transition-all ${createErrors.name ? 'border-red-300 focus:ring-2 focus:ring-red-200' : 'border-slate-200 focus:ring-2 focus:ring-blue-200'}`}
                                    placeholder="e.g. Chicken Biryani"
                                />
                                {createErrors.name && <p className="text-red-500 text-xs font-semibold flex items-center gap-1 mt-1"><X size={12} /> {createErrors.name}</p>}
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-1">
                                    <label className="block text-sm font-bold text-slate-900">Price ({restaurant.country === 'INDIA' ? '₹' : '$'}) <span className="text-red-500">*</span></label>
                                    <input
                                        type="number"
                                        value={newItem.price}
                                        onChange={e => setNewItem({ ...newItem, price: e.target.value })}
                                        className={`w-full p-3 border text-black  rounded-xl outline-none transition-all ${createErrors.price ? 'border-red-300 focus:ring-2 focus:ring-red-200' : 'border-slate-200 focus:ring-2 focus:ring-blue-200'}`}
                                        placeholder="0"
                                    />
                                    {createErrors.price && <p className="text-red-500 text-xs font-semibold flex items-center gap-1 mt-1"><X size={12} /> {createErrors.price}</p>}
                                </div>

                                <div className="space-y-1">
                                    <label className="block text-sm font-bold text-slate-900">Restaurant</label>
                                    <input
                                        type="text"
                                        value={restaurant.name}
                                        disabled
                                        className="w-full p-3 border text-black  border-slate-200 rounded-xl bg-slate-100 text-slate-500 font-medium cursor-not-allowed"
                                    />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <label className="block text-sm font-bold text-slate-900">Food Image</label>
                                <div className="border-2 border-dashed border-slate-200 rounded-xl p-4 flex flex-col items-center justify-center relative bg-slate-50 hover:bg-slate-100 transition-colors cursor-pointer group">
                                    {newItem.imagePreview ? (
                                        <div className="relative w-full h-48 rounded-lg overflow-hidden">
                                            <img src={newItem.imagePreview} alt="Preview" className="w-full h-full object-cover" />
                                            <button
                                                type="button"
                                                onClick={(e) => { e.preventDefault(); setNewItem(prev => ({ ...prev, image: null, imagePreview: null })); }}
                                                className="absolute top-2 right-2 bg-red-500 text-white p-1 rounded-full shadow-md hover:bg-red-600"
                                            >
                                                <X size={14} />
                                            </button>
                                        </div>
                                    ) : (
                                        <>
                                            <input
                                                type="file"
                                                accept="image/png, image/jpeg"
                                                onChange={handleImageUpload}
                                                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                            />
                                            <div className="text-center p-6">
                                                <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition-transform">
                                                    <Plus size={24} />
                                                </div>
                                                <p className="text-sm font-semibold text-slate-700">Click to upload image</p>
                                                <p className="text-xs text-slate-500 mt-1">PNG, JPG up to 5MB</p>
                                            </div>
                                        </>
                                    )}
                                </div>
                                {createErrors.image && <p className="text-red-500 text-xs font-semibold flex items-center gap-1"><X size={12} /> {createErrors.image}</p>}
                            </div>

                            <div className="flex gap-3 pt-4">
                                <button
                                    type="button"
                                    onClick={() => setShowCreateModal(false)}
                                    className="flex-1 py-3 bg-white border border-slate-200 text-slate-700 font-bold rounded-xl hover:bg-slate-50 transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={isSubmitting}
                                    className="flex-1 py-3 bg-slate-900 text-white font-bold rounded-xl hover:bg-slate-800 transition-all shadow-lg shadow-slate-900/20 disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                                >
                                    {isSubmitting ? (
                                        <>
                                            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                            Saving...
                                        </>
                                    ) : (
                                        'Save Food'
                                    )}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {showConfirmationModal && (
                <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
                    <div className="bg-white rounded-2xl shadow-2xl p-6 w-full max-w-sm scale-100 animate-in zoom-in-95 duration-200">
                        <h3 className="text-xl font-bold text-slate-900 mb-2">Confirm Order</h3>
                        <p className="text-slate-500 mb-6">Are you sure you want to place this order associated with <span className="font-semibold text-slate-700">{restaurant.name}</span>?</p>
                        <div className="flex gap-3">
                            <button onClick={() => setShowConfirmationModal(false)} className="flex-1 py-2.5 bg-white text-slate-700 border border-slate-200 rounded-xl font-semibold hover:bg-slate-50 transition-colors">Cancel</button>
                            <button onClick={handleConfirmOrder} className="flex-1 py-2.5 bg-slate-900 text-white rounded-xl font-semibold hover:bg-slate-800 transition-colors shadow-lg shadow-slate-900/20">Confirm</button>
                        </div>
                    </div>
                </div>
            )}

            {showSuccessModal && (
                <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
                    <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-sm text-center scale-100 animate-in zoom-in-95 duration-200 relative overflow-hidden">
                        <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                            <Check className="text-green-600" size={40} />
                        </div>
                        <h3 className="text-2xl font-bold text-slate-900 mb-2">Order Confirmed!</h3>
                        <p className="text-slate-500 mb-6">Your food is being prepared.</p>
                        <button onClick={() => setShowSuccessModal(false)} className="w-full py-3 bg-slate-900 text-white rounded-xl font-bold hover:bg-slate-800 transition-all shadow-lg shadow-slate-900/20">Done</button>
                    </div>
                </div>
            )}

            {!isCartOpen && restaurantCartItems.length > 0 && (
                <button
                    onClick={() => setIsCartOpen(true)}
                    className="fixed bottom-8 right-8 z-40 bg-slate-900 text-white px-6 py-3 rounded-full shadow-xl flex items-center gap-3 hover:scale-105 transition-transform animate-in fade-in slide-in-from-bottom-4"
                >
                    <div className="relative">
                        <ShoppingCart size={20} />
                        <span className="absolute -top-2 -right-2 w-4 h-4 bg-red-500 rounded-full text-[10px] flex items-center justify-center font-bold">
                            {restaurantCartItems.length}
                        </span>
                    </div>
                    <span className="font-bold">View Cart</span>
                </button>
            )}
        </div>
    );
}
