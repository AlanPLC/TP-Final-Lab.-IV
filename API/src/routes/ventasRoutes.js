import express from 'express';
import {ventasById,updateVentas,createVentas,deleteVentas} from '../controllers/VentasControllers.js';
import { validateID, validateBody } from '../validations/ventasValidations.js';


const ventasRouter = express.Router();

// Rutas para ventas

ventasRouter.get('/ventas/:id', ventasById,validateID)
ventasRouter.put('/ventas/:id',updateVentas,validateID,validateBody)
ventasRouter.post('/ventas/', createVentas,validateBody)
ventasRouter.delete('/ventas/:id',deleteVentas,validateID)

export default ventasRouter;