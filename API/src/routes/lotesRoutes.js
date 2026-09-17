import express from 'express';
import { getLotesPorProducto, createLote } from '../controllers/lotesController.js';
import { validateBody } from '../validations/lotesValidations.js';
import { validateID } from '../middlewares/idValidator.js';
import { requireAuth } from '../middlewares/requireAuth.js'
import { requireAdmin } from '../middlewares/requireAdmin.js'

const lotesRouter = express.Router();

lotesRouter.get('/lotes/producto/:id',
    ...requireAuth,
    validateID,
    getLotesPorProducto)

lotesRouter.post('/lotes',
    ...requireAuth,
    requireAdmin,
    validateBody,
    createLote)

export default lotesRouter;
