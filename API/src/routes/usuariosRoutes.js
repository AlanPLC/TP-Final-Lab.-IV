import express from 'express';
import {getAllUsers} from '../controllers/usuariosController.js';

const usuariosRouter = express.Router();

// Rutas para productos
usuariosRouter.get('/usuarios', getAllUsers);


export default usuariosRouter;