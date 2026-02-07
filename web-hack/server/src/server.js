import express from "express";
import cors from "cors";
import morgan from "morgan";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import http from "http"; 
import { connectDB } from "./config/db.js";
import apiRouter from './routes/index.js';
import { setupSocket } from "./socket.js"; 
import uploadRouter from "./routes/upload.routes.js";


dotenv.config();
connectDB();

const app = express();

app.use(cors({ origin: true, credentials: true }));
app.use(express.json());
app.use(cookieParser());
app.use(morgan("dev"));

app.get("/", (req, res) => {
  res.send("🚀 Advanced server running");
});

app.use('/api/v1', apiRouter);
app.use("/api/v1/upload", uploadRouter);


// --- Switch to http server for socket.io ---
const server = http.createServer(app);

// Setup Socket.IO
setupSocket(server);

// Start server
const PORT = process.env.PORT || 5000;
server.listen(PORT, () =>
  console.log(`Server running on http://localhost:${PORT}`)
);
