import express from 'express';
import { loginUser } from '../controllers/authController.js';
import { validateLogin } from '../validations/loginValidations.js';

const loginRouter = express.Router();

loginRouter.post('/login', validateLogin, loginUser)

export default loginRouter;