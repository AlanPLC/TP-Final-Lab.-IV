import express from 'express';
import { getVentas } from '../controllers/ventasController.js';
import { authorizeAdmin } from '../middlewares/authorize.js';
import passport from "passport"

const ventasRouter = express.Router();

ventasRouter.get("/ventas", 
    passport.authenticate("jwt", { session: false }),
    authorizeAdmin, 
    getVentas);


export default ventasRouter;
