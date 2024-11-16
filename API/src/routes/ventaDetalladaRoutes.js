import express from 'express';
import {getAllVentas,ventasById,updateVentas,createVentas} from '../controllers/VentasControllers.js';

const ventaDetalladaRouter = express.Router();

// Rutas para ventas

ventaDetalladaRouter.get('/ventas', getAllVentas)
ventaDetalladaRouter.get('/ventas/id', ventasById)
ventaDetalladaRouter.put('/ventas/id',updateVentas)
ventaDetalladaRouter.post('/ventas', createVentas)

export default ventaDetalladaRouter;