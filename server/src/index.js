import txRoutes from "./routes/transactions.routes.js";
import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import rateLimit from "express-rate-limit";
import dotenv from "dotenv";
import mongoose from "mongoose";

dotenv.config();

const app = express();

// Middlewares
app.use(helmet());
app.use(cors({ origin: process.env.CLIENT_URL }));
app.use(express.json());
app.use(morgan("dev"));
app.use(rateLimit({ windowMs: 15 * 60 * 1000, limit: 300 }));

// Health check
app.get("/api/health", (req, res) => {
  res.json({ ok: true, message: "Finance Tracker API is running" });
});

app.use("/api/transactions", txRoutes);

// 🔑 MongoDB connection
async function startServer() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("MongoDB connected");

    const port = process.env.PORT || 5000;
    app.listen(port, () =>
      console.log(`Server running on http://localhost:${port}`)
    );
  } catch (err) {
    console.error("MongoDB connection failed:", err.message);
  }
}

startServer();