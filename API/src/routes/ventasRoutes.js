import express from 'express';
import { getVentas, getVentasByID } from '../controllers/ventasController.js';
import { validateID } from '../validations/usuariosValidations.js';
import { authorizeAdmin } from '../middlewares/authorize.js';
import passport from "passport"

const ventasRouter = express.Router();

ventasRouter.get("/ventas", 
    passport.authenticate("jwt", { session: false }),
    getVentas);

ventasRouter.get("/ventas/:id",
    passport.authenticate("jwt", { session: false }),
    authorizeAdmin,
    validateID,
    getVentasByID);


export default ventasRouter;
