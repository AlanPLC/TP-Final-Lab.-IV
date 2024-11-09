import express from 'express';
import {getAllUsers, getUserByID, createUser, deleteUser, updateUser} from '../controllers/usuariosController.js';
import { validateID } from '../validations/usuariosValidations.js';
import { authorizeAdmin } from '../middlewares/authorize.js';
import passport from "passport"

const usuariosRouter = express.Router();

// Rutas para productos
usuariosRouter.get('/usuarios', passport.authenticate("jwt", { session: false }), getAllUsers);
usuariosRouter.get('/usuarios/:id', passport.authenticate("jwt", { session: false }), validateID, getUserByID);
usuariosRouter.post('/usuarios', passport.authenticate("jwt", { session: false }), authorizeAdmin, createUser);
usuariosRouter.delete('/usuarios/:id', passport.authenticate("jwt", { session: false }), authorizeAdmin, validateID, deleteUser);
usuariosRouter.put('/usuarios/:id', passport.authenticate("jwt", { session: false }), authorizeAdmin, validateID, updateUser);


export default usuariosRouter;