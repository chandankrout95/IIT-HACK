import { Router } from "express";
import { protect } from "../middleware/isAuthenticated.js";
import { getPlanetSummary } from "../controllers/planet.controller.js";


const router = Router();

router.post("/describe",     getPlanetSummary);


export default router;