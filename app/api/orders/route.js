import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Order from '@/models/Order';
import { getAuthUser } from "@/lib/auth";
import { allowRoles } from "@/lib/roleGuard";

export async function GET(req) {
    try {
        await dbConnect();
         const user = getAuthUser(req);

    if (!allowRoles(user.role, ["ADMIN", "MANAGER", "MEMBER"])) {
      return NextResponse.json(
        { message: "Forbidden" },
        { status: 403 }
      );
    }

        const { searchParams } = new URL(req.url);
        const userId = searchParams.get('userId');
        const role = searchParams.get('role'); 
        const country = searchParams.get('country');

        let query = {};
        if (role === 'MEMBER' && userId) {
            query.userId = userId;
        } else if (role === 'MANAGER' && country) {
            query.userCountry = country; 
        }
        const orders = await Order.find(query).sort({ createdAt: -1 });
        return NextResponse.json(orders);
    } catch (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

export async function POST(req) {
    try {
        await dbConnect();

        user = getAuthUser(req);
        
        if (!allowRoles(user.role, ["ADMIN", "MANAGER", "MEMBER"])) {
        return NextResponse.json(
            { message: "Forbidden" },
            { status: 403 }
        );
        }   

        const body = await req.json();



        const order = Order(body);
        await order.save();
        return NextResponse.json(order, { status: 201 });
    } catch (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
