import "dotenv/config";
import express from "express";
import cors from "cors";
import { clerkMiddleware, requireAuth } from "@clerk/express";
import resumeRoute from "./routes/ResumeAnalysis";
import authRoute from "./routes/User";
import { errorHandler } from "./middlewares/errorMiddleware";

const app = express();

const allowedOrigins = [
  "http://localhost:3000",
  "https://resume-analyzer-frontend-delta.vercel.app",
];
// middlewares
app.use(clerkMiddleware());
app.use(
  cors({
    origin: allowedOrigins,
    credentials: true,
    methods: ["GET", "POST"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// routes
app.use("/api/v1/auth", authRoute);
app.use("/api/v1/resume", requireAuth(), resumeRoute);
app.use("/api/v1/test", requireAuth(), (req, res) => {
  res.send("Hello WOrld");
});

// error handler
app.use(errorHandler);
app.get("/", (req, res) => {
  res.send("Hello world 🥳");
});
const PORT = process.env.port || 5000;

app.listen(PORT, () => {
  console.log(`App is running on port ${PORT}`);
});
