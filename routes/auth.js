const router = require("express").Router();
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const { cookieName } = require("../middleware/auth");
const options = { httpOnly: true, sameSite: "lax", secure: process.env.NODE_ENV === "production", maxAge: 7 * 24 * 60 * 60 * 1000 };
router.get("/register", (_, res) => res.render("auth", { title: "Create account", mode: "register", error: null }));
router.get("/login", (_, res) => res.render("auth", { title: "Login", mode: "login", error: null }));
router.post("/register", async (req, res) => {
  try {
    const { name, email, password } = req.body;
    if (!name || !email || !password || password.length < 8) throw new Error("Enter all fields. Password must be at least 8 characters.");
    if (await User.findOne({ email })) throw new Error("An account with this email already exists.");
    const user = await User.create({ name, email, password: await bcrypt.hash(password, 12) });
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: "7d" });
    res.cookie(cookieName(), token, options).redirect("/");
  } catch (e) { res.status(400).render("auth", { title: "Create account", mode: "register", error: e.message }); }
});
router.post("/login", async (req, res) => {
  const user = await User.findOne({ email: req.body.email });
  if (!user || !(await bcrypt.compare(req.body.password || "", user.password)))
    return res.status(401).render("auth", { title: "Login", mode: "login", error: "Invalid email or password." });
  const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: "7d" });
  res.cookie(cookieName(), token, options).redirect("/");
});
router.post("/logout", (_, res) => res.clearCookie(cookieName()).redirect("/"));
module.exports = router;
