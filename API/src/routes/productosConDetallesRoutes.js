import express from 'express';
import {getProductosConDetalles, getProductosConDetallesByID, createProductoConDetalles, updateProductoConDetalles, deleteProductoConDetalles} from '../controllers/productosConDetallesController.js'
import { validateBody } from '../validations/productosConDetallesValidations.js';
import { validateID } from '../middlewares/idValidator.js';

const productosConDetalles = express.Router();

productosConDetalles.get('/administrador', 
    getProductosConDetalles)

productosConDetalles.get('/administrador/:id', 
    validateID,
    getProductosConDetallesByID)

productosConDetalles.post('/administrador', 
    validateBody,
    createProductoConDetalles)

productosConDetalles.put('/administrador/:id',
    validateID,
    validateBody,
    updateProductoConDetalles,
)

productosConDetalles.delete('/administrador/:id', 
    validateID,
    deleteProductoConDetalles)

export default productosConDetalles;