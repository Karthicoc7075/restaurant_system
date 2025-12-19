import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import User from '@/models/User';
import bcrypt from 'bcryptjs';
import jws from 'jsonwebtoken';

export async function POST(req) {
    try {
        await dbConnect();
        const { email, password } = await req.json();

        const user = await User.findOne({ email });

        if (!user ||  !password) {
            return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
        }


        const passwordMatch = await bcrypt.compare(password, user.password);
        if (!passwordMatch) {
            return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
        }

        const userData = {
            _id: user._id,
            name: user.name,
            email: user.email,
            role: user.role,
            country: user.country
        };


     
        const token = jws.sign(userData, process.env.JWT_SECRET, { expiresIn: '7d' });

        return NextResponse.json({ user: userData, token }, { status: 200 });
    } catch (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}


