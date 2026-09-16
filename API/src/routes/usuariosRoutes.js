import express from 'express';
import {getAllUsers, getUserByID, createUser, deleteUser, updateUser} from '../controllers/usuariosController.js';
import { validateBody } from '../validations/usuariosValidations.js';
import { validateID } from '../middlewares/idValidator.js'
import { requireAuth } from '../middlewares/requireAuth.js'

const usuariosRouter = express.Router();

// Rutas para Usuarios, con sus middlewares, protecciones y validaciones.
usuariosRouter.get('/usuarios',
    ...requireAuth,
    getAllUsers);

usuariosRouter.get('/usuarios/:id',
    ...requireAuth,
    validateID,
    getUserByID);

usuariosRouter.post('/usuarios',
    validateBody,
    createUser);

usuariosRouter.delete('/usuarios/:id',
    ...requireAuth,
    validateID,
    deleteUser);

usuariosRouter.put('/usuarios/:id',
    ...requireAuth,
    validateID,
    validateBody,
    updateUser);


export default usuariosRouter;