const router = require("express").Router();
const Product = require("../models/Product");
const Order = require("../models/Order");
const upload = require("../middleware/upload");
const { requireAdmin } = require("../middleware/auth");
router.use(requireAdmin);
router.get("/", async (_, res) => {
  const [products, orders] = await Promise.all([Product.find().sort({ createdAt: -1 }), Order.find().sort({ createdAt: -1 }).limit(30)]);
  res.render("admin", { title: "Admin dashboard", products, orders });
});
router.post("/products", upload.single("image"), async (req, res) => {
  const { name, description, price, category, stock } = req.body;
  await Product.create({ name, description, price: Number(price), category, stock: Number(stock), image: req.file ? `/uploads/${req.file.filename}` : "", featured: req.body.featured === "on" });
  res.redirect("/admin");
});
router.post("/products/:id/delete", async (req, res) => { await Product.findByIdAndDelete(req.params.id); res.redirect("/admin"); });
router.post("/orders/:id/status", async (req, res) => {
  const allowed = ["PROCESSING", "SHIPPED", "DELIVERED", "CANCELLED"];
  if (allowed.includes(req.body.status)) await Order.findByIdAndUpdate(req.params.id, { status: req.body.status });
  res.redirect("/admin");
});
module.exports = router;
