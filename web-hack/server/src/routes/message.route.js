import { Router } from "express";
import { getAllChats } from "../controllers/message.controller.js";
import { protect } from "../middleware/isAuthenticated.js";


const router = Router();

router.get("/get-all", protect ,   getAllChats);


export default router;