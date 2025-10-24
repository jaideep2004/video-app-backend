import express from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";
import cors from "cors";
import videoRoutes from "./routes/videoRoutes.js";
import authRoutes from "./routes/authRoutes.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());
app.use("/uploads", express.static("uploads"));

// Routes
app.use("/api/videos", videoRoutes);
app.use("/api/auth", authRoutes);

// Connect to MongoDB
mongoose
  .connect(
    process.env.MONGODB_URI ||
      "mongodb+srv://jai2004bgmi:bgmi2004@videoapp.pe9byc3.mongodb.net/?retryWrites=true&w=majority&appName=videoApp"
  )
  .then(() => console.log("Connected to MongoDB"))
  .catch((err) => console.error("MongoDB connection error:", err));

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: "Something went wrong!" });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
