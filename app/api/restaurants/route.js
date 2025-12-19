import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Restaurant from '@/models/Restaurant';
import cloudinary from "@/lib/cloundinary"
import { getAuthUser } from '@/lib/auth';
import { allowRoles } from '@/lib/roleGuard';
export async function GET(req) {
    try {
        await dbConnect();

          const user = getAuthUser(req);
    if (!allowRoles(user.role, ["ADMIN", "MANAGER", "MEMBER"])) {
        return NextResponse.json(
            { message: "Forbidden" },
            { status: 403 }
        );
        }
        const { searchParams } = new URL(req.url);
        const country = searchParams.get('country');

        let query = {};
        if (country) {
            query.country = country;
        }

        const restaurants = await Restaurant.find(query);
        return NextResponse.json(restaurants);
    } catch (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}


export async function POST(req) {
    try {
        await dbConnect();
         const formData = await req.formData()
    const name = formData.get("name")
    const country = formData.get("country")
    const image = formData.get("image")

    if (!name || !country || !image) {
      return NextResponse.json({ error: "Missing fields" }, { status: 400 })
    }


    const bytes = await image.arrayBuffer()
    const buffer = Buffer.from(bytes)

    const uploadResult = await new Promise((resolve, reject) => {
      cloudinary.uploader.upload_stream(
        { folder: "restaurant_system" },
        (error, result) => {
          if (error) reject(error)
          resolve(result)
        }
      ).end(buffer)
    })

    console.log("Upload Result:", uploadResult);


        const newRestaurant = new Restaurant({ name, country, image: uploadResult.secure_url });
        await newRestaurant.save();
        
        return NextResponse.json(newRestaurant, { status: 201 });
    } catch (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
