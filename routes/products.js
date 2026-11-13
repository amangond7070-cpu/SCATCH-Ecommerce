const router = require("express").Router();
const Product = require("../models/Product");
router.get("/", async (req, res) => {
  const filter = {};
  if (req.query.category) filter.category = req.query.category;
  if (req.query.q) filter.name = { $regex: req.query.q, $options: "i" };
  const sort = req.query.sort === "price-low" ? { price: 1 } : req.query.sort === "price-high" ? { price: -1 } : { createdAt: -1 };
  const [products, categories] = await Promise.all([Product.find(filter).sort(sort), Product.distinct("category")]);
  res.render("shop", { title: "Shop all products", products, categories, query: req.query });
});
router.get("/:id", async (req, res) => {
  const product = await Product.findById(req.params.id);
  if (!product) return res.status(404).render("404", { title: "Product not found" });
  res.render("product", { title: product.name, product });
});
module.exports = router;
