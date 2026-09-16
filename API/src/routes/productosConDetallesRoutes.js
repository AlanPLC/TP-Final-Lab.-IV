import express from 'express';
import {getProductosConDetalles, getCategoria, createCategoria, getProductosConDetallesByID, createProductoConDetalles, updateProductoConDetalles, deleteProductoConDetalles} from '../controllers/productosConDetallesController.js'
import { validateBody, validateCategoriaBody } from '../validations/productosConDetallesValidations.js';
import { validateID } from '../middlewares/idValidator.js';
import { requireAuth } from '../middlewares/requireAuth.js'

const productosConDetalles = express.Router();

productosConDetalles.get('/administrador',
    ...requireAuth,
    getProductosConDetalles)

productosConDetalles.get('/categorias',
    ...requireAuth,
    getCategoria)

productosConDetalles.post('/categorias',
    ...requireAuth,
    validateCategoriaBody,
    createCategoria)


productosConDetalles.get('/administrador/:id',
    ...requireAuth,
    validateID,
    getProductosConDetallesByID)

productosConDetalles.post('/administrador',
    ...requireAuth,
    validateBody,
    createProductoConDetalles)

productosConDetalles.put('/administrador/:id',
    ...requireAuth,
    validateID,
    validateBody,
    updateProductoConDetalles,
)

productosConDetalles.delete('/administrador/:id',
    ...requireAuth,
    validateID,
    deleteProductoConDetalles)



export default productosConDetalles;