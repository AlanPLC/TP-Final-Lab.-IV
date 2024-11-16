import express from 'express';
import {getAllVentas,ventasById,updateVentas,createVentas} from '../controllers/VentasControllers.js';

const ventasRouter = express.Router();

// Rutas para ventas

ventasRouter.get('/ventas', getAllVentas)
ventasRouter.get('/ventas/id', ventasById)
ventasRouter.put('/ventas/id',updateVentas)
ventasRouter.post('/ventas', createVentas)

export default ventasRouter;