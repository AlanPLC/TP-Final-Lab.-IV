import {body, validationResult} from "express-validator";
import { db } from "../../config/db.js";

// Validaciones express validator
export const validateBody = [
    body('nombre')
    .notEmpty().withMessage('El nombre del proveedor es obligatorio.')
    .isString().withMessage('El nombre del proveedor solo puede contener letras y números.')
    .isLength({min: 3, max: 50  }).withMessage('El nombre debe contener de 3 a 50 carácteres.')
    
    .custom(async (proveedor, {req})=>{
        const [existente] = await db.execute("SELECT id FROM proveedores WHERE nombre = ?", [proveedor]);
        if (existente.length > 0 && existente[0].id !== parseInt(req.params.id)) {
            throw new Error('Este proveedor ya existe.');
        }
        return true;
      }),

    body('descripcion')
    .optional()
    .isString().withMessage('La descripción del producto solo puede contener letras y números.')
    .isLength({min: 3, max: 100}).withMessage('La descripción debe contener de 3 a 20 carácteres.'),

    (req,res,next)=>{
        const errors = validationResult(req);
        if(!errors.isEmpty()){
            return res.status(400).json({ errors: errors.array() });
        }
        next();
    }
];