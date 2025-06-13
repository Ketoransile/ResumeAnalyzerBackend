import "dotenv/config";
import express from "express";
import cors from "cors";
import { clerkMiddleware, requireAuth } from "@clerk/express";
import resumeRoute from "./routes/ResumeAnalysis";
import authRoute from "./routes/AuthRoute";
import { errorHandler } from "./middlewares/errorMiddleware";
import helmet from "helmet";
import { rateLimit } from "express-rate-limit";

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 100,
  standardHeaders: "draft-8",
  legacyHeaders: false,
});

const app = express();

const allowedOrigins = [
  "http://localhost:3000",
  "https://resume-analyzer-frontend-delta.vercel.app",
];

// Security middlewares
app.use(helmet());
app.use(
  helmet.contentSecurityPolicy({
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "'unsafe-inline'", "https://cdn.clerk.com"],
      styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
      imgSrc: [
        "'self'",
        "data:",
        "https://images.clerk.dev",
        "https://fonts.gstatic.com",
      ],
      connectSrc: ["'self'", "https://api.clerk.com"],
      fontSrc: ["'self'", "https://fonts.gstatic.com"],
      frameSrc: ["'self'"],
      objectSrc: ["'none'"],
      mediaSrc: ["'self'"],
    },
  })
);
// Rate limiting middleware
app.use(limiter);
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
