import mongoose from 'mongoose';

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/foodapp';

if (!MONGODB_URI) {
    throw new Error('Please define the MONGODB_URI environment variable inside .env.local');
}

async function dbConnect() {
  
   const connection = await  mongoose.connect(MONGODB_URI);
       return connection;
}

export default dbConnect;
