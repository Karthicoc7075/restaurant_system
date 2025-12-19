"use client";

import { useAuth } from "@/context/AuthContext";

export default function RoleGuard({ children, allowedRoles }) {
    const { user, isAuthenticated } = useAuth(); 

    if (!isAuthenticated || !user) {
        return null;
    }

    if (allowedRoles && !allowedRoles.includes(user.role)) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[50vh] text-slate-400">
                <p className="text-lg font-semibold">Access Restricted</p>
                <p className="text-sm">You do not have permission to view this page.</p>
            </div>
        );
    }

    return <>{children}</>;
}
