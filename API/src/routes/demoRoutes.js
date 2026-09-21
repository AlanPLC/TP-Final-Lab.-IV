import express from "express";
import { refrescarDemo } from "../controllers/demoController.js";
import { requireCron } from "../middlewares/requireCron.js";

const demoRouter = express.Router();

// Lo llama el cron diario de Vercel (ver vercel.json), no un usuario - de
// ahí requireCron en vez de requireAuth/requireAdmin.
demoRouter.post("/cron/refrescar-demo", requireCron, refrescarDemo);

export default demoRouter;
