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
}
// Validaciones express validator

// Validar Body Usuarios
export const validateBody = [
    body('fecha')
    .notEmpty().withMessage('la fecha de compra debe ser cargada')
    .isNumeric().withMessage('la fecha de compra debe ser numero')
    .isLength({min: 7, max: 10}).withMessage('La fecha debe contener de 7 a 10 carácteres.'),

    body('estado')    
        .notEmpty().withMessage('el estado no puede estar vacio')
        .isBoolean().withMessage('No coloco el estado')
        .isBoolean({ loose: true ,convertString: true}).withMessage("input true")
        .isIn(),

    (req,res,next)=>{
        const errors = validationResult(req);
        if(!errors.isEmpty()){
            return res.status(400).json({ errors: errors.array() });
        }
        next();
    }
];