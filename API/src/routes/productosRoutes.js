import express from 'express';
import {getAllProductos,productosById,updateProductos,createProductos, deleteProducto} from '../controllers/productosController.js';
import { validateBody } from '../validations/productosValidations.js'
import { validateID } from '../middlewares/idValidator.js';
const productosRouter = express.Router();

// Rutas para Productos

productosRouter.get('/productos', getAllProductos)
productosRouter.get('/productos/id', productosById, validateID)
productosRouter.put('/productos/id',updateProductos, validateID, validateBody)
productosRouter.post('/productos', createProductos, validateBody)
productosRouter.delete('/productos/id',deleteProducto, validateID)

export default productosRouter;