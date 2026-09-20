import { body, validationResult } from "express-validator";

// Validaciones express validator
// Validar Body Lotes (carga de mercadería)
export const validateBody = [
  body('producto_id')
    .notEmpty().withMessage('El producto es obligatorio.')
    .isInt({ gt: 0 }).withMessage('El id del producto debe ser mayor a 0.'),

  body('proveedor_id')
    .notEmpty().withMessage('El proveedor es obligatorio.')
    .isInt({ gt: 0 }).withMessage('El id del proveedor debe ser mayor a 0.'),

  body('precio_costo')
    .notEmpty().withMessage('El costo de compra es obligatorio.')
    .isFloat({ gt: 0 }).withMessage('El costo de compra debe ser mayor a 0.'),

  body('cantidad')
    .notEmpty().withMessage('La cantidad es obligatoria.')
    .isInt({ gt: 0 }).withMessage('La cantidad debe ser un entero mayor a 0.'),

  body('fecha_vencimiento')
    .optional({ values: 'falsy' })
    .isISO8601().withMessage('La fecha de vencimiento no es válida.'),

  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    next();
  }
];
