
🌐 Live Deployment: https://restaurant-system-lemon.vercel.app

🛠️ Tech Stack
Frontend

Next.js

Tailwind CSS

Lucide Icons

Backend

Node.js / NestJS (API)

JWT Authentication

Role-Based Access Control (RBAC)

Database

MongoDB

🔄 Application Flow

User logs in

Views restaurants and menu items (country-based)

Adds food items to cart

Confirms order (order created with CREATED status)

Admin / Manager proceeds to checkout & payment

Order status updates to PAID

Member can only view order status

🔐 Authentication & Authorization

JWT-based authentication

Role validation on every protected API

Country-based data filtering on backend

UI hides unauthorized actions, backend enforces security

🚀 How to Run the Project Locally
1️⃣ Clone the Repository
git clone https://github.com/Karthicoc7075/restaurant_system.git
cd restaurant_system

2️⃣ Install Dependencies

npm install

3️⃣ Environment Variables

Create a .env.local file in the backend folder:

MONGODB_URI:your_mongodb_connection_string
JWT_SECRET: your_secret_key
CLOUDINARY_SECRET: your_cloundinary_secret_key
CLOUDINARY_NAME: your_cloudinary_name
CLOUDINARY_KEY:  your_cloudinary_key


🔑 Test Credentials
Admin
Email: admin@test.com
Password: 123456

Manager (India)
Email: manager.india@test.com
Password: 123456

Manager (America)
Email: manager.usa@test.com
Password: 123456

Member (India)
Email: member.india@test.com
Password: 123456

Member (America)
Email: member.usa@test.com
Password: 123456
