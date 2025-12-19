import mongoose from 'mongoose';

const OrderItemSchema = new mongoose.Schema({
    
    name: { type: String },
    price: { type: Number },
    quantity: { type: Number },
});

const OrderSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    country: { type: String , required: true },
    restaurantName: { type: String , required: true },
    restaurantId: { type: String }, 
    items: [OrderItemSchema],
    totalAmount: { type: Number, required: true },
    status: { type: String, enum: ['CREATED', 'PAID', 'CANCELLED'], default: 'CREATED' },
    paymentMethod: { type: String },
}, { timestamps: true });

const Order = mongoose.models.Order || mongoose.model('Order', OrderSchema);

export default Order;
