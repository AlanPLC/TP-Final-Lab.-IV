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
    body('nombre')
    .notEmpty().withMessage('el nombre de producto esta vacio')
    .isLength({min: 1, max: 20}).withMessage('la nombre debe tener de 2 a 20 caracteres'),

    body('descripcion')    
        .notEmpty().withMessage('la descripcion esta vacia')
        .isLength({min: 1, max: 60}).withMessage('la cantidad debe tener de 1 a 60 caracteres'),

    body('precio')
        .notEmpty().withMessage('el precio esta vacio')
        .isFloat({gt:0}).withMessage('el precio debe ser positivo')
        .toFloat(),

    body('imagen_url')
        .notEmpty().withMessage('imagen no esta cargada'),
    (req,res,next)=>{
        const errors = validationResult(req);
        if(!errors.isEmpty()){
            return res.status(400).json({ errors: errors.array() });
        }
        next();
    }
];