# SCATCH — Full-stack E-commerce

A full-stack store built with HTML, Tailwind CSS, EJS, JavaScript, Node.js, Express, JWT, bcrypt, Multer, MongoDB Atlas and Mongoose.

## Features
- Registration/login with bcrypt password hashing and JWT in an HTTP-only cookie
- Product catalogue, search, category filtering, sorting and product details
- Persistent per-user shopping cart
- Checkout, COD orders, order history and stock updates
- Optional Razorpay checkout with server-side signature verification
- Admin product creation/image uploads/deletion and order status management
- Responsive EJS/Tailwind interface

## 1. Requirements
- Node.js 18+
- MongoDB Atlas database (or local MongoDB)
- Optional Razorpay test account for online payments

## 2. Install
```bash
npm install
cp .env.example .env
```
On Windows PowerShell use `Copy-Item .env.example .env`.

Edit `.env` and set `MONGODB_URI` and a long random `JWT_SECRET`.

## 3. Create an admin
Register normally at `/auth/register`, then in MongoDB Atlas open the `users` collection and change that user's `role` from `customer` to `admin`. Sign out and sign in again. The admin dashboard is at `/admin`.

For a local MongoDB shell, the update is:
```js
db.users.updateOne({ email: "your@email.com" }, { $set: { role: "admin" } })
```

## 4. Run
```bash
npm run dev
```
Open http://localhost:3000

## 5. Online payments (optional)
Add Razorpay test credentials to `RAZORPAY_KEY_ID` and `RAZORPAY_KEY_SECRET` in `.env`. Without them, checkout supports Cash on Delivery. Never expose the secret in frontend code.

## 6. Deploy on Render
1. Push this folder to a GitHub repository.
2. In Render choose **New + → Web Service** and connect the repository.
3. Build command: `npm install`; Start command: `npm start`.
4. Add all `.env` values as Render environment variables.
5. Use MongoDB Atlas network access settings to allow your Render service to connect.
6. For production image storage, replace local Multer disk storage with persistent/object storage (e.g. Cloudinary or S3). Render's local filesystem may be ephemeral.

## Important production hardening
This is a learning-project starter, not a payment-certified production store. Before going live add CSRF protection, rate limiting, email verification/password reset, input validation, secure logging, image scanning/cloud storage, transactional stock reservation, idempotent payment webhooks, shipping/tax rules, and automated tests. Configure HTTPS and rotate all secrets.
