import express from 'express';
import {getProductosConDetalles, getCategoria, createCategoria, getProductosConDetallesByID, createProductoConDetalles, updateProductoConDetalles, deleteProductoConDetalles} from '../controllers/productosConDetallesController.js'
import { validateBody, validateCategoriaBody } from '../validations/productosConDetallesValidations.js';
import { validateID } from '../middlewares/idValidator.js';
import passport from "passport"

const productosConDetalles = express.Router();

productosConDetalles.get('/administrador',
    passport.authenticate("jwt", { session: false }),
    getProductosConDetalles)

productosConDetalles.get('/categorias',
    passport.authenticate("jwt", { session: false }),
    getCategoria)

productosConDetalles.post('/categorias',
    passport.authenticate("jwt", { session: false }),
    validateCategoriaBody,
    createCategoria)


productosConDetalles.get('/administrador/:id', 
    passport.authenticate("jwt", { session: false }),
    validateID,
    getProductosConDetallesByID)

productosConDetalles.post('/administrador', 
    passport.authenticate("jwt", { session: false }),
    validateBody,
    createProductoConDetalles)

productosConDetalles.put('/administrador/:id',
    passport.authenticate("jwt", { session: false }),
    validateID,
    validateBody,
    updateProductoConDetalles,
)

productosConDetalles.delete('/administrador/:id', 
    passport.authenticate("jwt", { session: false }),
    validateID,
    deleteProductoConDetalles)



export default productosConDetalles;