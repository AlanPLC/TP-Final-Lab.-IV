import { body, validationResult } from 'express-validator';

export const validateLogin = [
  body('user')
    .notEmpty().withMessage('El nombre de usuario es obligatorio.')
    .isAlphanumeric().withMessage('El nombre de usuario solo puede contener letras y números.'),
  body('password')
    .notEmpty().withMessage('La contraseña es obligatoria.'),

  // Middleware para manejar los errores
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    next();
  }
];