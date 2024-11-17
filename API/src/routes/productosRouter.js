import express from 'express';
import {getAllProductos,productosById,updateProductos,createProductos} from '../controllers/VentasControllers.js';

const ventasProductos = express.Router();

// Rutas para Productos

productosRouter.get('/productos', getAllProductos)
productosRouter.get('/productos/id', productosById)
productosRouter.put('/productos/id',updateProductos)
productosRouter.post('/productos', createProductos)

export default productosRouter;