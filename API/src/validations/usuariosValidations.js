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

// Validar Body Usuarios
export const validateBody = [
    body('user')
    .notEmpty().withMessage('El nombre de usuario es obligatorio.')
    .isAlphanumeric().withMessage('El nombre de usuario solo puede contener letras y números.')
    .isLength({min: 3, max: 20}).withMessage('El usuario debe contener de 3 a 20 carácteres.')
    // Verifica si el usuario ya existe, lógica pensada para que en un PUT se pueda mantener el mismo nombre.
    .custom(async (user, {req})=>{
        const [existente] = await db.execute("SELECT * FROM usuarios WHERE user = ?",[user]);

        if (existente.length > 0 && existente[0].id !== parseInt(req.params.id)) {
            throw new Error('Este usuario ya existe.');
        }
        return true;
    }),

    body('password')    
        .notEmpty().withMessage('La contraseña es obligatoria')
        .isLength({ min: 8 }).withMessage('La contraseña debe tener al menos 8 caracteres')
        .matches(/[a-z]/).withMessage('Debe contener al menos una minúscula')
        .matches(/[A-Z]/).withMessage('Debe contener al menos una mayúscula')
        .matches(/\d/).withMessage('Debe contener al menos un número'),

    body('rol')
        .optional()
        .isIn(['administrador', 'vendedor']).withMessage('El rol debe ser "administrador" o "vendedor".'),

    (req,res,next)=>{
        const errors = validationResult(req);
        if(!errors.isEmpty()){
            return res.status(400).json({ errors: errors.array() });
        }
        next();
    }
];