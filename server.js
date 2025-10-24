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
const corsOptions = {
  origin: [
    "http://localhost:5173",
  ],
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: [
    "Origin",
    "X-Requested-With",
    "Content-Type",
    "Accept",
    "Authorization",
  ],
  optionsSuccessStatus: 200,
};

app.use(cors(corsOptions));


app.use(express.json());
app.use("/uploads", express.static("uploads"));

// Routes
app.use("/api/videos", videoRoutes);
app.use("/api/auth", authRoutes);
app.get("/", (req, res) => {
  res.json({ message: "Video Platform API updated 24 oct" });
});
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
