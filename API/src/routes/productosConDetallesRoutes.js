import express from 'express';
import {getProductosConDetalles, createProductoConDetalles} from '../controllers/productosConDetallesController.js'

const productosConDetalles = express.Router();

productosConDetalles.get('/administrador', getProductosConDetalles)
productosConDetalles.post('/administrador', createProductoConDetalles)

export default productosConDetalles;