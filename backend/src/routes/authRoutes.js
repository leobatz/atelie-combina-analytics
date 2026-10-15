import { Router } from "express";
import { Login } from "../controllers/authController.js";
import bloqueadorLogin from "../middlewares/bloqueadorLogin.js";

const router = Router();

router.post("/", bloqueadorLogin, Login);

export default router;