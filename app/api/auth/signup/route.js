import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import User from '@/models/User';
import brcypt from 'bcryptjs';
import jws from 'jsonwebtoken';

export async function POST(req) {
    try {
        await dbConnect();
        const { name, email, password, role, country } = await req.json();


        if(!name || !email || !password || !role ) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
        }



        
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return NextResponse.json({ error: 'User already exists' }, { status: 400 });
        }


        const salt = brcypt.genSaltSync(10);
        const hashedPassword = brcypt.hashSync(password, salt);


        const newUser = new User({ name, email, password: hashedPassword, role, country });
        await newUser.save();
       
        const userData = {
            _id: newUser._id,
            name: newUser.name,
            email: newUser.email,
            role: newUser.role,
            country: newUser.country
        };

        const token = jws.sign(userData, process.env.JWT_SECRET, { expiresIn: '7d' });

        return NextResponse.json({ user: userData, token }, { status: 201 });
    } catch (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}   