import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import PaymentMethod from '@/models/PaymentMethod';
import {getAuthUser} from '@/lib/auth';
import {allowRoles} from '@/lib/roleGuard';

export async function GET(req) {
    // In App Router, req is a Request object. Use req.nextUrl.searchParams
    const { searchParams } = new URL(req.url);
    const country = searchParams.get('country');
    const role = searchParams.get('role');

    try {
        await dbConnect();
         const user = getAuthUser(req);
        if (!allowRoles(user.role, ["ADMIN", "MANAGER", "MEMBER"])) {
        return NextResponse.json(
        { message: "Forbidden" },
        { status: 403 }
      );
    }


        const methods = await PaymentMethod.find({});


        if(role =="ADMIN"){
            return NextResponse.json(methods);
        }

        const filteredMethods = methods.filter(method => method.country === country );

        NextResponse.json(filteredMethods);
        

        return NextResponse.json(methods);
    } catch (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

export async function POST(req) {
    try {
        await dbConnect();
    const user = getAuthUser(req);

    if (!allowRoles(user.role, ["ADMIN"])) {
      return NextResponse.json(
        { message: "Forbidden" },
        { status: 403 }
      );
    }

        const body = await req.json();



        if (!body.name || !body.type || !body.country) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
        }

        const newMethod = new PaymentMethod(body);
        await newMethod.save();
        return NextResponse.json(newMethod, { status: 201 });
    } catch (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
