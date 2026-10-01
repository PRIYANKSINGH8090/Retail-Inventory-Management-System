# Retail Inventory Management System

A full-stack web-based Retail Inventory Management System built using React, Node.js, Express.js and MongoDB.

## Features

* Role-based Admin, Staff and Customer access
* User registration and login
* Product catalogue management
* Supplier management
* Purchase order management
* Inventory management
* Customer shopping and search
* Shopping cart
* Address management
* Order management
* Payment status management
* Sales dashboard
* Product image upload using Multer and Cloudinary
* JWT-based authentication

## Tech Stack

### Frontend

* React
* Vite
* React Router
* Axios
* Tailwind CSS

### Backend

* Node.js
* Express.js
* MongoDB
* Mongoose
* JWT
* bcrypt
* Multer
* Cloudinary

## Project Structure

```text
Retail-Inventory-Management-System/
├── frontend/
│   └── retail_inventory_role_routing/
└── backend/
    └── aa/
```

## Installation

Clone the repository:

```bash
git clone YOUR_REPOSITORY_URL
cd Retail-Inventory-Management-System
```

### Backend Setup

```bash
cd backend/aa
npm install
```

Create a `.env` file in the backend folder and configure the required environment variables.

```env
PORT=8000
MONGODB_URI=your_mongodb_connection_string
CORS_ORIGIN=http://localhost:5173
ACCESS_TOKEN_SECRET=your_access_secret
ACCESS_TOKEN_EXPIRY=1d
REFRESH_TOKEN_SECRET=your_refresh_secret
REFRESH_TOKEN_EXPIRY=10d
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```

Start the backend:

```bash
npm run dev
```

### Frontend Setup

Open another terminal:

```bash
cd frontend/retail_inventory_role_routing
npm install
npm run dev
```

Open the local URL provided by Vite, normally:

```text
http://localhost:5173
```

## Testing

Test the following workflows after starting both frontend and backend:

1. User registration and login
2. Role-based access
3. Product management
4. Supplier and purchase order management
5. Inventory updates
6. Product search and category filtering
7. Cart operations
8. Address management
9. Order placement
10. Order and payment status updates
11. Sales dashboard
12. Product image upload

## Environment Variables

Never commit the actual `.env` file to GitHub.

Use `.env.example` to document the required environment variables without exposing credentials.

## Author

Priyank Singh
