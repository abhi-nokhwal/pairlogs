const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const path = require("path");
const fs = require("fs");
const authRoutes = require("./routes/authRoutes.js");
const imageRoutes = require("./routes/imageRoutes.js");
const quizRoutes = require("./routes/quizRoutes.js");
const personalSpaceRoutes = require("./routes/personalSpaceRoutes.js");
const coupleRoutes = require("./routes/coupleRoutes.js");
const uploadRoutes = require("./routes/uploadRoutes.js");

const app = express();

// Create upload directories if they don't exist
const uploadsDir = path.join(__dirname, "uploads");
const imagesDir = path.join(uploadsDir, "images");
const songsDir = path.join(uploadsDir, "songs");

if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir);
if (!fs.existsSync(imagesDir)) fs.mkdirSync(imagesDir);
if (!fs.existsSync(songsDir)) fs.mkdirSync(songsDir);

// Enable CORS for all routes
app.use(cors());
app.use(express.json());
app.use("/uploads", express.static("uploads"));

// Connect to MongoDB
mongoose
  .connect("mongodb://localhost:27017/pairlogs")
  .then(() => console.log("MongoDB connected"))
  .catch((err) => console.error(err));

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/images", imageRoutes);
app.use("/api/quiz", quizRoutes);
app.use("/api/personal-space", personalSpaceRoutes);
app.use("/api/couple", coupleRoutes);
app.use("/api/upload", uploadRoutes);

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Something went wrong!' });
});

app.listen(5000, () => console.log("Server running on port 5000"));