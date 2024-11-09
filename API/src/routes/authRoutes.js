import express from 'express';
import { loginUser } from '../controllers/authController.js';

const loginRouter = express.Router();

loginRouter.post('/login', loginUser)

export default loginRouter;