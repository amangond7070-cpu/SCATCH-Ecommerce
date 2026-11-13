require("dotenv").config();
const express = require("express");
const path = require("path");
const cookieParser = require("cookie-parser");
const connectDB = require("./config/db");
const { attachUser } = require("./middleware/auth");

const app = express();
connectDB();
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(cookieParser());
app.use("/public", express.static(path.join(__dirname, "public")));
app.use("/uploads", express.static(path.join(__dirname, "uploads")));
app.use(attachUser);

app.use("/", require("./routes/pages"));
app.use("/auth", require("./routes/auth"));
app.use("/products", require("./routes/products"));
app.use("/cart", require("./routes/cart"));
app.use("/orders", require("./routes/orders"));
app.use("/admin", require("./routes/admin"));

app.use((req, res) => res.status(404).render("404", { title: "Page not found" }));
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`SCATCH running at http://localhost:${PORT}`));
