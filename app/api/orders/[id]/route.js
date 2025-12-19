import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Order from '@/models/Order';
import { getAuthUser } from "@/lib/auth";
import { allowRoles } from "@/lib/roleGuard";

export async function PATCH(req, { params }) {
    try {
        await dbConnect();
         const user = getAuthUser(req);

    if (!allowRoles(user.role, ["ADMIN", "MANAGER"])) {
      return NextResponse.json(
        { message: "Forbidden" },
        { status: 403 }
      );
    }

        const url = new URL(req.url);
        const id =  url.pathname.split('/')[3];
        const updates = await req.json();

        const order = await Order.findByIdAndUpdate(id, updates, { new: true });

        if (!order) {
            return NextResponse.json({ error: 'Order not found' }, { status: 404 });
        }

        return NextResponse.json(order);
    } catch (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
