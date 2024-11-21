import {body, validationResult} from "express-validator";
import { db } from "../../config/db.js";

// Validaciones express validator
// Validar Body Productos Con Detalles
export const validateBody = [
    body('nombre')
    .notEmpty().withMessage('El nombre del producto es obligatorio.')
    .isString().withMessage('El nombre del producto solo puede contener letras y números.')
    .isLength({min: 3, max: 20  }).withMessage('El nombre debe contener de 3 a 20 carácteres.')
    // Verifica si el producto ya existe, lógica pensada para que en un PUT se pueda mantener el mismo nombre.
    .custom(async (product, {req})=>{
        const [existente] = await db.execute("SELECT * FROM productos WHERE nombre = ?",[product]);

        if (existente.length > 0 && existente[0].id !== parseInt(req.params.id)) {
            throw new Error('Este producto ya existe.');
        }
        return true;
    }),

    body('descripcion')
    .notEmpty().withMessage('La descripción del producto es obligatoria.')
    .isString().withMessage('La descripción del producto solo puede contener letras y números.')
    .isLength({min: 3, max: 50}).withMessage('El nombre debe contener de 3 a 20 carácteres.'),

    body('precio')
    .notEmpty().withMessage('El precio del producto es obligatorio.')
    .isFloat({gt:0}).withMessage('El precio del producto debe ser mayor a 0.'),

    body('proveedor_id')
    .notEmpty().withMessage('El id del proveedor es obligatorio.')
    .isNumeric({gt:0}).withMessage('El id del proveedor debe ser mayor a 0.'),

    body('categoria_id')
    .notEmpty().withMessage('El precio del producto es obligatorio.')
    .isNumeric({gt:0}).withMessage('El precio del producto debe ser mayor a 0.'),

    body("imagen_url")
        .optional()
        .isURL().withMessage("La imagen_url debe ser una URL válida."),

    body("cantidad_disponible")
        .isInt({ min: 0 , max: 200}).withMessage("La cantidad disponible debe ser un número entero entre 0 y 200."),

    (req,res,next)=>{
        const errors = validationResult(req);
        if(!errors.isEmpty()){
            return res.status(400).json({ errors: errors.array() });
        }
        next();
    }
];