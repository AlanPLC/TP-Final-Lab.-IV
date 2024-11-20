import express from 'express';
import {getAllProductoStock,productoStockById,updateProductoStock,createProductoStock, deleteProductoStock} from '../controllers/productoStockController.js';
import { validateID, validateBody } from '../validations/productosStockValidations.js';

const productosStockRouter = express.Router();

// Rutas para Productos

productosStockRouter.get('/Stock', getAllProductoStock)
productosStockRouter.get('/Stock/id', productoStockById, validateID)
productosStockRouter.put('/Stock/id', updateProductoStock, validateBody, validateID)
productosStockRouter.post('/Stock', createProductoStock, validateBody)
productosStockRouter.delete('/Stock/id', deleteProductoStock, validateID)

export default productosStockRouter;