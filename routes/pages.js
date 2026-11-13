const router = require("express").Router();
const Product = require("../models/Product");
router.get("/", async (req, res) => {
  const products = await Product.find().sort({ createdAt: -1 }).limit(8);
  res.render("home", { title: "SCATCH | Discover your style", products });
});
router.get("/shop", (req, res) => res.redirect("/products"));
module.exports = router;
