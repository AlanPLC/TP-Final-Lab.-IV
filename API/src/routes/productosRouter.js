import express from 'express';
import {getAllProductos,productosById,updateProductos,createProductos, deleteProducto} from '../controllers/productosController.js';

const productosRouter = express.Router();

// Rutas para Productos

productosRouter.get('/productos', getAllProductos)
productosRouter.get('/productos/:id', productosById)
productosRouter.put('/productos/:id',updateProductos)
productosRouter.post('/productos', createProductos)
productosRouter.delete('/productos/:id', deleteProducto)

export default productosRouter;