import { io } from "socket.io-client";

const SOCKET_URL = window.location.hostname === "localhost" 
  ? "http://localhost:5000" 
  : window.location.origin; // Points to your Render URL (e.g., cosmic-watch.onrender.com)

const socket = io(SOCKET_URL, {
  withCredentials: true,
  transports: ["websocket", "polling"] 
});

export default socket;