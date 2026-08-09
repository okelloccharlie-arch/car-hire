import express from "express";
import cors from "cors";
import morgan from "morgan";

import authRoutes from "./routes/auth.routes";
import userRoutes from "./routes/user.routes";
import carRoutes from "./routes/car.routes";
import bookingRoutes from "./routes/booking.routes";
import paymentRoutes from "./routes/payment.routes";
import reportRoutes from "./routes/report.routes";
import { notFound, errorHandler } from "./middleware/error.middleware";

const app = express();

const allowedOrigins = [process.env.CLIENT_URL].filter(Boolean);

app.use(
  cors({
    origin: (origin, callback) => {
      const isLocalhost = origin && /^http:\/\/localhost:\d+$/.test(origin);
      if (!origin || isLocalhost || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true,
  })
);


app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan(process.env.NODE_ENV === "production" ? "combined" : "dev"));

app.get("/api/health", (_req, res) => {
  res.json({ success: true, message: "Car Rental API is running" });
});

app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/cars", carRoutes);
app.use("/api/bookings", bookingRoutes);
app.use("/api/payments", paymentRoutes);
app.use("/api/reports", reportRoutes);

app.use(notFound);
app.use(errorHandler);

export default app;
