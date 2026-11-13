const mongoose = require("mongoose");
const orderSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  items: [{ product: { type: mongoose.Schema.Types.ObjectId, ref: "Product" }, name: String, image: String, price: Number, quantity: Number }],
  total: { type: Number, required: true },
  address: { type: String, required: true },
  paymentMethod: { type: String, enum: ["COD", "RAZORPAY"], default: "COD" },
  paymentStatus: { type: String, enum: ["PENDING", "PAID"], default: "PENDING" },
  status: { type: String, enum: ["PLACED", "PROCESSING", "SHIPPED", "DELIVERED", "CANCELLED"], default: "PLACED" },
  razorpayOrderId: String
}, { timestamps: true });
module.exports = mongoose.model("Order", orderSchema);
