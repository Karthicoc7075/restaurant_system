"use client";

import { AuthProvider } from "@/context/AuthContext";
import { DataProvider } from "@/context/DataContext";
import React from "react";

export function Providers({ children }) {
    return (
        <AuthProvider>
            <DataProvider>
                {children}
            </DataProvider>
        </AuthProvider>
    );
}
