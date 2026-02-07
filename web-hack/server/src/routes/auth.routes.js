import { Router } from "express";
import { login, signup } from "../controllers/auth.controller.js";
import { protect } from "../middleware/isAuthenticated.js";

const router = Router();

router.post("/signup", signup);
router.post("/login", login);

// 🛰️ INLINE LOGOUT: Clears the JWT Cookie
router.post("/logout", (req, res) => {
  res.cookie("token", "", {
    httpOnly: true,
    expires: new Date(0), // Sets expiration to Jan 1, 1970
    secure: process.env.NODE_ENV === "production", // Only send over HTTPS in production
    sameSite: "strict"
  });

  res.status(200).json({
    status: "success",
    message: "TERMINAL_DISCONNECTED: Session purged."
  });
});

router.get('/me', protect, (req, res) => {
  res.status(200).json({
    status: 'success',
    data: {
      user: req.user 
    }
  });
});

export default router;