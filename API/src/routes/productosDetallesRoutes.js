import express from 'express';
import {createProductoConDetalles,getProductosConDetalles} from '../controllers/productosConDetallesControllers.js';


const productosConDetalles = express.Router();

// Rutas para Productos

productosConDetalles.get('/administrador', getProductosConDetalles)
productosConDetalles.post('/administrador', createProductoConDetalles)

export default productosConDetalles;