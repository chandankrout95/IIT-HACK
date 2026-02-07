import express from "express";
import {
  saveAsteroid,
  removeAsteroid,
  getWatchedAsteroids,
} from "../controllers/asteroid.controller.js";
import { protect } from "../middleware/isAuthenticated.js";

const router = express.Router();

router.post("/watch", protect, saveAsteroid);
router.delete("/watch/:neoReferenceId", protect, removeAsteroid);
router.get("/get-watch", protect, getWatchedAsteroids);

export default router;
