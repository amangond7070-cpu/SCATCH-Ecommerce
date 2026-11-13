const jwt = require("jsonwebtoken");
const User = require("../models/User");
const cookieName = () => process.env.SESSION_COOKIE_NAME || "scatch_token";

async function attachUser(req, res, next) {
  res.locals.user = null;
  try {
    const token = req.cookies[cookieName()];
    if (token) {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      req.user = await User.findById(decoded.id).select("-password");
      res.locals.user = req.user;
    }
  } catch (_) { res.clearCookie(cookieName()); }
  next();
}
function requireAuth(req, res, next) {
  if (!req.user) return res.redirect("/auth/login");
  next();
}
function requireAdmin(req, res, next) {
  if (!req.user) return res.redirect("/auth/login");
  if (req.user.role !== "admin") return res.status(403).send("Admin access required");
  next();
}
module.exports = { attachUser, requireAuth, requireAdmin, cookieName };
