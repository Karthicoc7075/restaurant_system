import mongoose from 'mongoose';

const UserSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    role: { type: String, enum: ['ADMIN', 'MANAGER', 'MEMBER'], default: 'MEMBER' },
    country: { type: String, enum: ['INDIA', 'USA'], default: 'INDIA' },
}, { timestamps: true });

export default mongoose.models.User || mongoose.model('User', UserSchema);
