import express from 'express';
import {getAllUsers, getUserByID, createUser, deleteUser, updateUser} from '../controllers/usuariosController.js';
import { validateBody } from '../validations/usuariosValidations.js';
import { validateID } from '../middlewares/idValidator.js'
import passport from "passport"

const usuariosRouter = express.Router();

// Rutas para Usuarios, con sus middlewares, protecciones y validaciones.
usuariosRouter.get('/usuarios', 
    passport.authenticate("jwt", { session: false }), 
    getAllUsers);

usuariosRouter.get('/usuarios/:id', 
    passport.authenticate("jwt", { session: false }), 
    validateID, 
    getUserByID);

usuariosRouter.post('/usuarios', 
    validateBody, 
    createUser);

usuariosRouter.delete('/usuarios/:id',
    passport.authenticate("jwt", { session: false }),
    validateID,
    deleteUser);

usuariosRouter.put('/usuarios/:id',
    passport.authenticate("jwt", { session: false }),
    validateID,
    validateBody,
    updateUser);


export default usuariosRouter;