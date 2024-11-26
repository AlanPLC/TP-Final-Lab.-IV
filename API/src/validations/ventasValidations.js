import { body, validationResult } from 'express-validator';

export const validateBody = [
    body('productos')
    .isArray({ min: 1 })
    .withMessage('El campo "productos" debe ser un array con al menos un producto.'),

  // Validar cada objeto dentro del array
  body('productos.*.producto_id')
    .isInt({ gt: 0 })
    .withMessage('Cada id de producto debe ser un número entero positivo.'),

  body('productos.*.cantidad_producto')
    .isInt({ gt: 0 })
    .withMessage('Cada cantidad de productos debe ser un número entero positivo.'),

  // Middleware para manejar los errores
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    next();
  }
];

export const validateStock = [
  body('cantidad_disponible')
    .isInt({ min: 1}).withMessage("La cantidad debe productos debe ser un número entero positivo"),

// Middleware para manejar los errores
(req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  next();
}
];