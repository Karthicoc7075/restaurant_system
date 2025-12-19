import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import PaymentMethod from '@/models/PaymentMethod';

export async function DELETE(req, { params }) {
    try {
        await dbConnect();
        const { id } = params;
        const deleted = await PaymentMethod.findByIdAndDelete(id);

        if (!deleted) {
            return NextResponse.json({ error: 'Payment method not found' }, { status: 404 });
        }

        return NextResponse.json({ message: 'Deleted successfully' });
    } catch (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
