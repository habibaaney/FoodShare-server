# FoodShare Backend API

This is the **Node.js + Express** backend API for the FoodShare project. It manages food items, user data, and requests for sharing surplus food.

## Features

- RESTful API endpoints for food CRUD operations
- User management integrated with Firebase Authentication
- MongoDB native driver for database operations
- Secure routes with JWT and role-based access control
- Pagination, filtering, and sorting support
- File uploads support (avatar upload, food images)
- Stripe integration for donations (optional)

## Tech Stack

- Node.js (v16+)
- Express.js
- MongoDB native driver
- Firebase Admin SDK (for verifying Firebase tokens)
- JSON Web Tokens (JWT)
- Dotenv for environment variables