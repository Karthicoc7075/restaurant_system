import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Restaurant from '@/models/Restaurant';
import { getAuthUser } from '@/lib/auth';
import { allowRoles } from '@/lib/roleGuard';


export async function GET(req, { params }) {
    try {
        await dbConnect();
         const user = getAuthUser(req);
    if (!allowRoles(user.role, ["ADMIN", "MANAGER", "MEMBER"])) {
        return NextResponse.json(
            { message: "Forbidden" },
            { status: 403 }
        );
        }
        const { id } = params;

        const restaurant = await Restaurant.findOne({ id }); 

        if (!restaurant) {
            return NextResponse.json({ error: 'Restaurant not found' }, { status: 404 });
        }

        return NextResponse.json(restaurant);
    } catch (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
