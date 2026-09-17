import express from 'express';
import { getOnlyProveedores, getProveedoresConProductos, getProveedorByID, createProveedores, deleteProveedor, updateProveedor } from '../controllers/proveedoresController.js';
import { validateID } from '../middlewares/idValidator.js'
import { validateBody } from '../validations/proveedoresValidations.js';
import { requireAuth } from '../middlewares/requireAuth.js'
import { requireAdmin } from '../middlewares/requireAdmin.js'

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
    requireAdmin,
    validateBody,
    createProveedores);

proveedoresRouter.delete("/proveedores/:id",
    ...requireAuth,
    requireAdmin,
    validateID,
    deleteProveedor);

proveedoresRouter.put("/proveedores/:id",
    ...requireAuth,
    requireAdmin,
    validateBody,
    validateID,
    updateProveedor); //

export default proveedoresRouter;
