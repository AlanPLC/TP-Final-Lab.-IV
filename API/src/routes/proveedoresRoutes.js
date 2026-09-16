import express from 'express';
import { getOnlyProveedores, getProveedoresConProductos, getProveedorByID, createProveedores, deleteProveedor, updateProveedor } from '../controllers/proveedoresController.js';
import { validateID } from '../middlewares/idValidator.js'
import { validateBody } from '../validations/proveedoresValidations.js';
import { requireAuth } from '../middlewares/requireAuth.js'

const proveedoresRouter = express.Router();
proveedoresRouter.get("/onlyproveedores",
    ...requireAuth,
    getOnlyProveedores);

proveedoresRouter.get("/proveedores",
    ...requireAuth,
    getProveedoresConProductos);

proveedoresRouter.get("/proveedores/:id",
    ...requireAuth,
    validateID,
    getProveedorByID);

proveedoresRouter.post("/proveedores",
    ...requireAuth,
    validateBody,
    createProveedores);

proveedoresRouter.delete("/proveedores/:id",
    ...requireAuth,
    validateID,
    deleteProveedor);

proveedoresRouter.put("/proveedores/:id",
    ...requireAuth,
    validateBody,
    validateID,
    updateProveedor); //

export default proveedoresRouter;
