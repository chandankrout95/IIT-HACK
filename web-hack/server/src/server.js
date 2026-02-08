import express from "express";
import cors from "cors";
import morgan from "morgan";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import http from "http"; 
import path from 'path'; // ✅ Added
import { fileURLToPath } from 'url'; // ✅ Added
import { connectDB } from "./config/db.js";
import apiRouter from './routes/index.js';
import { setupSocket } from "./socket.js"; 
import uploadRouter from "./routes/upload.routes.js";

dotenv.config();
connectDB();

const app = express();

// 1. Resolve paths for ES Modules
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const buildPath = path.join(__dirname, '../public'); 

// 2. Middleware & Static Files
app.use(cors({ origin: true, credentials: true }));
app.use(express.json());
app.use(cookieParser());
app.use(morgan("dev"));
app.use(express.static(buildPath)); 

// ✅ ADD THIS LINE TO SERVE IMAGES
app.use("/uploads", express.static(path.join(__dirname, "../uploads")));

// 3. API Routes
app.use('/api/v1', apiRouter);
app.use("/api/v1/upload", uploadRouter);

// 4. Status Check (Optional, renamed so it doesn't block the frontend)
app.get("/api/status", (req, res) => {
  res.send("🚀 Advanced server running");
});

// 5. THE FIX: Catch-all route for React Router
// This must be the VERY LAST route in the file.
// It sends index.html for any route not caught above (like /visualizer).
app.get('/*splat', (req, res) => {
  res.sendFile(path.join(buildPath, 'index.html'));
});

const server = http.createServer(app);
setupSocket(server);

const PORT = process.env.PORT || 5000;
server.listen(PORT, () =>
  console.log(`Server running on port ${PORT}`)
);