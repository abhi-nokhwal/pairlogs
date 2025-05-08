const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const authRoutes = require("./routes/authRoutes.js");
const imageRoutes = require("./routes/imageRoutes.js");

const app = express();

app.use(cors());
app.use(express.json());
app.use("/uploads", express.static("uploads")); // Serve images statically

mongoose
  .connect("mongodb://localhost:27017/pairlogs")
  .then(() => console.log("MongoDB connected"))
  .catch((err) => console.error(err));

app.use("/api/auth", authRoutes);
app.use("/api/images", imageRoutes);
app.listen(5000, () => console.log("Server running on port 5000"));
