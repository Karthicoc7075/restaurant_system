import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Restaurant from '@/models/Restaurant';
import cloudinary from "@/lib/cloundinary"

export async function POST(req,) {
  try {
    await dbConnect();
   const { pathname } = new URL(req.url);
    const id = pathname.split('/')[3]; 

    const formData = await req.formData();
    const name = formData.get('name');
    const price = formData.get('price');
    const description = formData.get('description'); 
    const image = formData.get('image');
    
    if (!name || !price || !image) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const restaurant = await Restaurant.findById({_id:id});
    if (!restaurant) {
      return NextResponse.json({ error: 'Restaurant not found' }, { status: 404 });
    }

    const bytes = await image.arrayBuffer();
    const buffer = Buffer.from(bytes);

    const uploadResult = await new Promise((resolve, reject) => {
      cloudinary.uploader.upload_stream(
        { folder: "restaurant_system/menu" },
        (error, result) => {
          if (error) reject(error);
          resolve(result);
        }
      ).end(buffer);
    });

    const menuItem = {
    
      name,
      price: parseFloat(price),
      description: description || '',
      image: uploadResult.secure_url,
    };

  await Restaurant.updateOne(
      { _id: id },
      { $push: { menu: menuItem } },
      
    );

   
    
    
    return NextResponse.json(menuItem, { status: 201 });
  } catch (error) {
    console.error("Menu upload error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
