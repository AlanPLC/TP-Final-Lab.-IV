import express from 'express';
import { getVentas, createVentas } from '../controllers/ventasController.js';
import { validateBody } from '../validations/ventasValidations.js';
import passport from "passport"

const ventasRouter = express.Router();

ventasRouter.get("/ventas",
    passport.authenticate("jwt", { session: false }),
    getVentas);

// El descuento de stock ya no lo maneja el frontend (antes hacía un PUT
// aparte por producto, sin atomicidad real con la venta) - ahora
// createVentas consume los lotes por FIFO/FEFO dentro de la misma
// transacción que crea la venta (ver ventasController.js).
ventasRouter.post("/ventas",
    passport.authenticate("jwt", { session: false }),
    validateBody,
    createVentas);

export default ventasRouter;
