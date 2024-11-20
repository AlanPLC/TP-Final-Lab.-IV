import express from 'express';
import {ventasById,updateVentas,createVentas} from '../controllers/VentasControllers.js';
import { validateID, validateBody } from '../validations/ventaDetalladaValidations.js';

const ventaDetalladaRouter = express.Router();

// Rutas para ventaDetallada

ventaDetalladaRouter.get('/ventaDetallada/:id', ventasById,validateID)
ventaDetalladaRouter.put('/ventaDetallada/:id',updateVentas,validateID,validateBody)
ventaDetalladaRouter.post('/ventaDetallada', createVentas,validateBody)
ventaDetalladaRouter.delete('/ventaDetallada/:id',validateID)

export default ventaDetalladaRouter;