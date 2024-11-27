import express from 'express';
import { getVentas, createVentas, controlStock } from '../controllers/ventasController.js';
import { validateBody, validateStock } from '../validations/ventasValidations.js';
import passport from "passport"

const ventasRouter = express.Router();

ventasRouter.get("/ventas", 
    passport.authenticate("jwt", { session: false }),
    getVentas);

ventasRouter.post("/ventas",
    passport.authenticate("jwt", { session: false }),
    validateBody,
    createVentas);

ventasRouter.put("/ventas/:id",
    passport.authenticate("jwt", { session: false }),
    validateStock,
    controlStock);


export default ventasRouter;
