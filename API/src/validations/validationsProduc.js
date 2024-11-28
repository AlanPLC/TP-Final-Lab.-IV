import {body, validationResult} from "express-validator";
import { db } from "../../config/db.js";

// Middleware Validar ID
export const validateID = (req,res,next) => {
    const id = Number(req.params.id);
    
    if(isNaN(id)){
        return res.status(400).send({ error: "Id no es un número." })
    }
    if(!Number.isInteger(id)){
        return res.status(400).send({ error: "Id no es un número entero." })
    }
    if(id<0){
        return res.status(400).send({ error: "ID debe ser positivo." })
    }
    next();
}
// Validaciones express validator

// Validar Body Productos
export const validateBody = [
    body('product')
    .notEmpty().withMessage('El nombre del producto es obligatorio.')
    .isAlphanumeric().withMessage('El nombre del producto solo puede contener letras y números.')
    .isLength({min: 3, max: 20}).withMessage('El ´producto debe contener de 3 a 20 carácteres.')
    // Verifica si el usuario ya existe, lógica pensada para que en un PUT se pueda mantener el mismo nombre.
    .custom(async (product, {req})=>{
        const [existente] = await db.execute("SELECT * FROM productos WHERE user = ?",[product]);

        if (existente.length > 0 && existente[0].id !== parseInt(req.params.id)) {
            throw new Error('Este producto ya existe.');
        }
        return true;
    }),

    body('descripcion')
        .isAlphanumeric().withMessage('La descripcion del producto solo puede contener letras y números.')
        .isLength({min: 3, max: 50}).withMessage('El ´producto debe contener de 3 a 50 carácteres.'),

    body('precio')
        .isNumeric(),            

    body('imagen')
        .optional()
        .isURL().withMessage('"La imagen no es URL".'),
        
    (req,res,next)=>{
        const errors = validationResult(req);
        if(!errors.isEmpty()){
            return res.status(400).json({ errors: errors.array() });
        }
        next();
    }
];