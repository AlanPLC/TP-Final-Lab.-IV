import express from 'express';
import { getProveedoresConProductos, getProveedorByID, createProveedores, deleteProveedor, updateProveedor } from '../controllers/proveedoresController.js';
import { validateID } from '../middlewares/idValidator.js'
import passport from "passport"
import { updateProductoConDetalles } from '../controllers/productosConDetallesController.js';

const proveedoresRouter = express.Router();

proveedoresRouter.get("/proveedores", 
    passport.authenticate("jwt", { session: false }),
    getProveedoresConProductos);

proveedoresRouter.get("/proveedores/:id", 
    passport.authenticate("jwt", { session: false }),
    validateID,
    getProveedorByID);

proveedoresRouter.post("/proveedores", 
    passport.authenticate("jwt", { session: false }),
    createProveedores);

proveedoresRouter.delete("/proveedores/:id", 
    passport.authenticate("jwt", { session: false }),
    validateID,
    deleteProveedor);

proveedoresRouter.put("/proveedores/:id", 
    passport.authenticate("jwt", { session: false }),
    validateID,
    updateProveedor); //

export default proveedoresRouter;
