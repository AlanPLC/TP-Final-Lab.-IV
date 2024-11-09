import express from 'express';
import {getAllUsers, getUserByID, createUser, deleteUser, updateUser} from '../controllers/usuariosController.js';
import { validateID } from '../validations/usuariosValidations.js';

const usuariosRouter = express.Router();

// Rutas para productos
usuariosRouter.get('/usuarios', getAllUsers);
usuariosRouter.get('/usuarios/:id', validateID, getUserByID);
usuariosRouter.post('/usuarios', createUser);
usuariosRouter.delete('/usuarios/:id', validateID, deleteUser);
usuariosRouter.put('/usuarios/:id', validateID, updateUser);


export default usuariosRouter;