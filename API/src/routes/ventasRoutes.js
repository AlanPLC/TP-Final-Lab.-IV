import express from 'express';
import { getVentas, createVentas } from '../controllers/ventasController.js';
import { validateBody } from '../validations/ventasValidations.js';
import passport from "passport"

const ventasRouter = express.Router();

ventasRouter.get("/ventas", 
    passport.authenticate("jwt", { session: false }),
    getVentas);

ventasRouter.post("/ventas",
    passport.authenticate("jwt", { session: false }),
    validateBody,
    createVentas);


export default ventasRouter;
