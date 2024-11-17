import {body, validationResult} from "express-validator";


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
};
// Validaciones express validator

// Validar Body Usuarios
export const validateBody = [
    body('cantidad')
    .notEmpty().withMessage('la cantidad esta vacia')
    .isNumeric().withMessage('la cantidad no es un numero')
    .isLength({min: 1, max: 4}).withMessage('la cantidad debe tener de 1 a 4 caracteres'),

    body('precio_unitario')    
        .notEmpty().withMessage('el precio esta vacio')
        .isFloat({gt:0}).withMessage('el precio debe ser positivo')
        .toFloat(),
        

    (req,res,next)=>{
        const errors = validationResult(req);
        if(!errors.isEmpty()){
            return res.status(400).json({ errors: errors.array() });
        }
        next();
    }
];