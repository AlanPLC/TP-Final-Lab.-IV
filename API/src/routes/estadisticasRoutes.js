import express from 'express';
import { getEstadisticas } from '../controllers/estadisticasController.js';
import { requireAuth } from '../middlewares/requireAuth.js'

const estadisticasRouter = express.Router();

estadisticasRouter.get("/estadisticas",
    ...requireAuth,
    getEstadisticas);

export default estadisticasRouter;
