import express from 'express';
import { getProveedores } from '../controllers/proveedoresController.js';
import passport from "passport"

const proveedoresRoutes = express.Router();

proveedoresRoutes.get("/proveedores", 
    passport.authenticate("jwt", { session: false }),
    getProveedores);


export default proveedoresRoutes;
