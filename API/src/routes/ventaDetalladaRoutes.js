import express from 'express';
import {ventasById,updateVentas,createVentas} from '../controllers/VentasControllers.js';
import { validateID, validateBody } from '../validations/ventaDetalladaValidations.js';

const ventaDetalladaRouter = express.Router();

// Rutas para ventaDetallada

ventaDetalladaRouter.get('/ventas/:id', ventasById,validateID)
ventaDetalladaRouter.put('/ventas/:id',updateVentas)
ventaDetalladaRouter.post('/ventas', createVentas,validateBody)
ventaDetalladaRouter.delete('/ventas/:id',validateID)

export default ventaDetalladaRouter;