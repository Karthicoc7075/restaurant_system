import mongoose from 'mongoose';

const MenuItemSchema = new mongoose.Schema({
    _id:   { type: mongoose.Schema.Types.ObjectId, auto: true },
    name: { type: String, required: true },
    price: { type: Number, required: true },
    description: { type: String },
    image: { type: String },
});

const RestaurantSchema = new mongoose.Schema({
    name: { type: String, required: true },
    image: { type: String, required: true },
    country: { type: String, enum: ['INDIA', 'USA'], required: true },
    menu: [MenuItemSchema],
}, { timestamps: true });

const Restaurant =
  mongoose.models.Restaurant ||
  mongoose.model('Restaurant', RestaurantSchema);





export default Restaurant;