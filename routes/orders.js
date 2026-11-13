const router = require("express").Router();
const crypto = require("crypto");
const Razorpay = require("razorpay");
const Cart = require("../models/Cart");
const Order = require("../models/Order");
const Product = require("../models/Product");
const { requireAuth } = require("../middleware/auth");
router.use(requireAuth);
router.get("/checkout", async (req, res) => {
  const cart = await Cart.findOne({ user: req.user._id }).populate("items.product");
  const items = (cart?.items || []).filter(i => i.product);
  if (!items.length) return res.redirect("/cart");
  const total = items.reduce((s, i) => s + i.product.price * i.quantity, 0);
  res.render("checkout", { title: "Checkout", items, total, razorpayKey: process.env.RAZORPAY_KEY_ID || "" });
});
router.post("/place", async (req, res) => {
  const cart = await Cart.findOne({ user: req.user._id }).populate("items.product");
  const items = (cart?.items || []).filter(i => i.product);
  if (!items.length || !req.body.address?.trim()) return res.status(400).send("Cart and delivery address are required.");
  for (const i of items) if (i.quantity > i.product.stock) return res.status(400).send(`${i.product.name} is out of stock.`);
  const total = items.reduce((s, i) => s + i.product.price * i.quantity, 0);
  const method = req.body.paymentMethod === "RAZORPAY" ? "RAZORPAY" : "COD";
  const order = await Order.create({
    user: req.user._id, address: req.body.address.trim(), total, paymentMethod: method,
    items: items.map(i => ({ product: i.product._id, name: i.product.name, image: i.product.image, price: i.product.price, quantity: i.quantity }))
  });
  if (method === "RAZORPAY") {
    if (!process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET) {
      await Order.findByIdAndDelete(order._id);
      return res.status(503).send("Online payment is not configured. Add Razorpay test keys to .env or choose Cash on Delivery.");
    }
    try {
      const gateway = new Razorpay({ key_id: process.env.RAZORPAY_KEY_ID, key_secret: process.env.RAZORPAY_KEY_SECRET });
      const rpOrder = await gateway.orders.create({ amount: Math.round(total * 100), currency: "INR", receipt: order._id.toString() });
      order.razorpayOrderId = rpOrder.id; await order.save();
      return res.render("pay", { title: "Secure payment", order, rpOrder, key: process.env.RAZORPAY_KEY_ID });
    } catch (e) { await Order.findByIdAndDelete(order._id); return res.status(502).send("Payment gateway error: " + e.message); }
  }
  await finishOrder(order, items, cart);
  res.redirect("/orders/mine");
});
router.post("/verify-payment", async (req, res) => {
  const { orderId, razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;
  const order = await Order.findOne({ _id: orderId, user: req.user._id });
  if (!order || order.razorpayOrderId !== razorpay_order_id) return res.status(400).send("Invalid order.");
  const expected = crypto.createHmac("sha256", process.env.RAZORPAY_KEY_SECRET).update(`${razorpay_order_id}|${razorpay_payment_id}`).digest("hex");
  if (expected !== razorpay_signature) return res.status(400).send("Payment verification failed.");
  const cart = await Cart.findOne({ user: req.user._id }).populate("items.product");
  order.paymentStatus = "PAID"; await order.save();
  await finishOrder(order, cart?.items || [], cart);
  res.redirect("/orders/mine");
});
async function finishOrder(order, items, cart) {
  for (const i of items) if (i.product) await Product.updateOne({ _id: i.product._id }, { $inc: { stock: -i.quantity } });
  if (cart) { cart.items = []; await cart.save(); }
}
router.get("/mine", async (req, res) => {
  const orders = await Order.find({ user: req.user._id }).sort({ createdAt: -1 });
  res.render("orders", { title: "Your orders", orders });
});
module.exports = router;
