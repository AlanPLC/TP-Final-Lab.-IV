import express from 'express';
import { getProveedores } from '../controllers/proveedoresController.js';
import passport from "passport"

const proveedoresRouter = express.Router();

proveedoresRouter.get("/proveedores", 
    passport.authenticate("jwt", { session: false }),
    getProveedores);


export default proveedoresRouter;
