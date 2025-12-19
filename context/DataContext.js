"use client";

import React, { createContext, useContext, useReducer, useEffect } from 'react';

const DataContext = createContext();

const initialState = {
    restaurants: [],
    orders: [],
    cart: [],
    isLoading: false,
    error: null,
    paymentMethods: [],
};

const dataReducer = (state, action) => {
    switch (action.type) {
        case 'SET_LOADING':
            return { ...state, isLoading: action.payload };
        case 'SET_ERROR':
            return { ...state, error: action.payload, isLoading: false };
        case 'SET_RESTAURANTS':
            return { ...state, restaurants: action.payload, isLoading: false };
        case 'SET_ORDERS':
            return { ...state, orders: action.payload, isLoading: false };
        case 'ADD_ORDER':
            return { ...state, orders: [...state.orders, action.payload] };
        case 'UPDATE_ORDER_STATUS':
            const updatedOrders = state.orders.map(o =>
                (o._id === action.payload.orderId)
                    ? { ...o, status: action.payload.status }
                    : o
            );
            return { ...state, orders: updatedOrders };
        case 'CANCEL_ORDER':
            const canceledOrders = state.orders.map(o =>
                (o._id === action.payload)
                    ? { ...o, status: 'CANCELED' }
                    : o
            );
            return { ...state, orders: canceledOrders };
        case 'CART_ADD_ITEM': {
            const { item, quantity } = action.payload;
            const existingItemIndex = state.cart.findIndex(i => (i._id === item._id));

            let newCart = [...state.cart];
            if (existingItemIndex > -1) {
                const newQuantity = newCart[existingItemIndex].quantity + quantity;
                if (newQuantity <= 0) {
                    newCart.splice(existingItemIndex, 1);
                } else {
                    newCart[existingItemIndex] = { ...newCart[existingItemIndex], quantity: newQuantity };
                }
            } else if (quantity > 0) {
                newCart.push({ ...item, quantity });
            }
            return { ...state, cart: newCart };
        }
        case 'CART_REMOVE_ITEM':
            return { ...state, cart: state.cart.filter(i => (i._id !== action.payload)) };
        case 'CART_CLEAR':
            return { ...state, cart: [] };
        case 'ADD_MENU_ITEM': {
            const { restaurantId, item } = action.payload;
            const updatedRestaurants = state.restaurants.map(r => {
                if (r._id === restaurantId) {
                    return { ...r, menu: [...(r.menu || []), item] };
                }
                return r;
            });
            return { ...state, restaurants: updatedRestaurants };
        }

        case 'SET_PAYMENT_METHODS':
            return { ...state, paymentMethods: action.payload };

        case 'ADD_PAYMENT_METHOD':
            return { ...state, paymentMethods: [...state.paymentMethods, action.payload] };

        case 'DELETE_PAYMENT_METHOD':
            return { ...state, paymentMethods: state.paymentMethods.filter(m => m._id !== action.payload) };


        default:
            return state;
    }
};

export function DataProvider({ children }) {
    const [state, dispatch] = useReducer(dataReducer, initialState);

 
    useEffect(() => {
        const fetchData = async () => {
            dispatch({ type: 'SET_LOADING', payload: true });
            try {
               
                const resResponse = await fetch('/api/restaurants',{
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${localStorage.getItem('token')}`
                    },
                });
                const resData = await resResponse.json();
                if (resResponse.ok) {
                    dispatch({ type: 'SET_RESTAURANTS', payload: resData.data || resData });
                }

           
            } catch (error) {
                dispatch({ type: 'SET_ERROR', payload: error.message });
            }
        };
        fetchData();
    }, []);

    const addToCart = (item, quantity = 1) => {
        dispatch({ type: 'CART_ADD_ITEM', payload: { item, quantity } });
    };

    const removeFromCart = (itemId) => {
        dispatch({ type: 'CART_REMOVE_ITEM', payload: itemId });
    };

    const clearCart = () => {
        dispatch({ type: 'CART_CLEAR' });
    };

    const placeOrder = async (orderData) => {
        try {
            const response = await fetch('/api/orders', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                 },
                body: JSON.stringify(orderData),
            });
            const data = await response.json();
            if (response.ok) {
                dispatch({ type: 'ADD_ORDER', payload: data });
                return { success: true, order: data };
            }
            return { success: false, error: data.error };
        } catch (e) {
            return { success: false, error: e.message };
        }
    };

    const updateOrderStatus = async (orderId, status,paymentMethod) => {
        try {
            await fetch(`/api/orders/${orderId}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' ,
                    'Authorization': `Bearer ${localStorage.getItem('token')}`

                },
                body: JSON.stringify({ status, paymentMethod }),
            });

            dispatch({ type: 'UPDATE_ORDER_STATUS', payload: { orderId, status } });
        } catch (e) {
            console.error("Failed to update status", e);
        }
    };

    const cancelOrder = async (orderId) => {
        try {
            await fetch(`/api/orders/${orderId}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
            });

            await fetch(`/api/orders/${orderId}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                 },
                body: JSON.stringify({ status: 'CANCELED' ,}),
            });

            dispatch({ type: 'CANCEL_ORDER', payload: orderId });
        } catch (e) {
            console.error("Failed to cancel order", e);
        }
    };

    const addMenuItem = async (restaurantId, itemData) => {
        try {
            const response = await fetch(`/api/restaurants/${restaurantId}/menu`, {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` },
                body: itemData, 
            });
            const data = await response.json();
            if (response.ok) {
                dispatch({ type: 'ADD_MENU_ITEM', payload: { restaurantId, item: data } });
                return true;
            }
            return false;
        } catch (e) {
            console.error(e);
            return false;
        }
    };

    const fetchOrders = async () => {
        try {
            const response = await fetch('/api/orders',{
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                },  
            });
            const data = await response.json();
            if (response.ok) {
                dispatch({ type: 'SET_ORDERS', payload: data.data || data });
            }
        } catch (e) {
            console.error("Fetch orders failed", e);
        }
    }

    const fetchPaymentMethods = async (country,role) => {
        try {
            const response = await fetch(`/api/payment-methods?country=${country}&role=${role}`, {
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            });
            const data = await response.json();
            if (response.ok) {
                dispatch({ type: 'SET_PAYMENT_METHODS', payload: data });
                return data;
            }
            return [];
        }
        catch (e) {
            console.error("Fetch payment methods failed", e);
            return [];
        }
    }
    const addPaymentMethod = async (methodData) => {
        try {
            const response = await fetch('/api/payment-methods', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                },
                body: JSON.stringify(methodData),
            });
            const data = await response.json();
            if (response.ok) {
                dispatch({ type: 'ADD_PAYMENT_METHOD', payload: data });
                return { success: true, method: data };
            }
            return { success: false, error: data.error };

        }

        catch (e) {
            return { success: false, error: e.message };
        }
    }

    const deletePaymentMethod = async (methodId) => {
        try {
            const response = await fetch(`/api/payment-methods/${methodId}`, {
                headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` },
                method: 'DELETE',
            });
            if (response.ok) {
                dispatch({ type: 'DELETE_PAYMENT_METHOD', payload: methodId });
                return { success: true };
            }
            return { success: false, error: "Failed to delete" };
        }
        catch (e) {
            return { success: false, error: e.message };
        }
    }

    return (
        <DataContext.Provider value={{
            ...state,
            addToCart,
            removeFromCart,
            clearCart,
            placeOrder,
            updateOrderStatus,
            cancelOrder,
            addMenuItem,
            fetchOrders,
            dispatch,
            fetchPaymentMethods,
            addPaymentMethod,
            deletePaymentMethod,
        }}>
            {children}
        </DataContext.Provider>
    );
}

export const useData = () => useContext(DataContext);
