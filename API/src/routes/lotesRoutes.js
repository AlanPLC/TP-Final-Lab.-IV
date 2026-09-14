import express from 'express';
import { getLotesPorProducto, createLote } from '../controllers/lotesController.js';
import { validateBody } from '../validations/lotesValidations.js';
import { validateID } from '../middlewares/idValidator.js';
import passport from "passport"

const lotesRouter = express.Router();

lotesRouter.get('/lotes/producto/:id',
    passport.authenticate("jwt", { session: false }),
    validateID,
    getLotesPorProducto)

lotesRouter.post('/lotes',
    passport.authenticate("jwt", { session: false }),
    validateBody,
    createLote)

export default lotesRouter;
