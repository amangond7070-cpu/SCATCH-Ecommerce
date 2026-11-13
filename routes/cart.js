const router = require("express").Router();
const Cart = require("../models/Cart");
const Product = require("../models/Product");
const { requireAuth } = require("../middleware/auth");
router.use(requireAuth);
router.get("/", async (req, res) => {
  const cart = await Cart.findOne({ user: req.user._id }).populate("items.product");
  const items = (cart?.items || []).filter(i => i.product);
  const total = items.reduce((sum, i) => sum + i.product.price * i.quantity, 0);
  res.render("cart", { title: "Your bag", items, total });
});
router.post("/add/:id", async (req, res) => {
  const product = await Product.findById(req.params.id);
  if (!product || product.stock < 1) return res.status(400).send("Product unavailable");
  let cart = await Cart.findOne({ user: req.user._id });
  if (!cart) cart = new Cart({ user: req.user._id, items: [] });
  const line = cart.items.find(i => i.product.toString() === product._id.toString());
  if (line) line.quantity = Math.min(line.quantity + 1, product.stock);
  else cart.items.push({ product: product._id, quantity: 1 });
  await cart.save(); res.redirect("/cart");
});
router.post("/update/:id", async (req, res) => {
  const qty = Math.max(1, Math.min(20, Number(req.body.quantity) || 1));
  const cart = await Cart.findOne({ user: req.user._id });
  if (cart) {
    const line = cart.items.find(i => i.product.toString() === req.params.id);
    if (line) line.quantity = qty;
    await cart.save();
  }
  res.redirect("/cart");
});
router.post("/remove/:id", async (req, res) => {
  await Cart.updateOne({ user: req.user._id }, { $pull: { items: { product: req.params.id } } });
  res.redirect("/cart");
});
module.exports = router;
