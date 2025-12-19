"use client";

import React, { useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useData } from '@/context/DataContext'; // Context
import { Search, MapPin, Star, ArrowRight, Loader } from 'lucide-react';
import Link from 'next/link';

export default function RestaurantsPage() {
    const { user } = useAuth();
    const { restaurants, isLoading } = useData();

    if (!user) return null;

   
    const filteredRestaurants = user.role === 'ADMIN'
        ? restaurants
        : restaurants.filter(r => r.country === user.country);

    if (isLoading && restaurants.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
                <div className="w-12 h-12 border-4 border-slate-200 border-t-blue-600 rounded-full animate-spin" />
                <p className="text-slate-500 font-medium animate-pulse">Finding best restaurants...</p>
            </div>
        );
    }

    return (
        <div className="space-y-8">
           

        
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {filteredRestaurants.map(restaurant => (
                    <Link href={`/restaurants/${restaurant.id || restaurant._id}`} key={restaurant.id || restaurant._id} className="group block bg-white rounded-2xl overflow-hidden shadow-sm border border-slate-100 hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
                        <div className="relative h-48 overflow-hidden">
                            <img
                                src={restaurant.image}
                                alt={restaurant.name}
                                className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-700"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-60" />

                            <div className="absolute bottom-4 left-4 text-white">
                                <span className="bg-white/20 backdrop-blur-md px-2 py-0.5 rounded text-xs font-bold mb-1 inline-block border border-white/10">
                                    {restaurant.country}
                                </span>
                            </div>
                        </div>

                        <div className="p-5">
                            <div className="flex justify-between items-start mb-2">
                                <h3 className="text-xl font-bold text-slate-900 group-hover:text-blue-600 transition-colors line-clamp-1">{restaurant.name}</h3>
                                <div className="flex items-center gap-1 bg-green-50 px-1.5 py-0.5 rounded-md border border-green-100">
                                    <Star size={12} className="text-green-600 fill-green-600" />
                                    <span className="text-xs font-bold text-green-700">4.5</span>
                                </div>
                            </div>

                            <p className="text-slate-500 text-sm line-clamp-2 mb-4 h-10">
                                Experience authentic flavors and premium dining.
                            </p>

                            <div className="flex items-center justify-between pt-4 border-t border-slate-50">
                               
                                <span className="text-blue-600 text-sm font-bold flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                                    View Menu <ArrowRight size={16} />
                                </span>
                            </div>
                        </div>
                    </Link>
                ))}
            </div>

            {filteredRestaurants.length === 0 && (
                <div className="text-center py-20 bg-white rounded-2xl  shadow-md">
                  
                    <h3 className="text-lg font-bold text-slate-900">No restaurants found</h3>
                   
                </div>
            )}
        </div>
    );
}
