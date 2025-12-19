import mongoose from 'mongoose';

const PaymentMethodSchema = new mongoose.Schema({
    name: { type: String, required: true },
    type: { type: String, enum: ['UPI', 'CARD', 'STRIPE', 'CASH'], required: true },
    country: { type: String, enum: ['INDIA', 'USA'], required: true },
    isAvailable: { type: Boolean, default: true },
}, { timestamps: true });

export default mongoose.models.PaymentMethod || mongoose.model('PaymentMethod', PaymentMethodSchema);
