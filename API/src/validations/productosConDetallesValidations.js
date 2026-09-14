import {body, validationResult} from "express-validator";
import { db } from "../../config/db.js";
import { PRODUCT_ICON_KEYS } from "../constants/productIcons.js";

// Validaciones express validator
// Validar Body Productos Con Detalles
export const validateBody = [
    body('nombre')
    .notEmpty().withMessage('El nombre del producto es obligatorio.')
    .isString().withMessage('El nombre del producto solo puede contener letras y números.')
    .isLength({min: 3, max: 20  }).withMessage('El nombre debe contener de 3 a 20 carácteres.')
    // Verifica si el producto ya existe, lógica pensada para que en un PUT se pueda mantener el mismo nombre.
    .custom(async (product, {req})=>{
        const { rows: existente } = await db.query("SELECT id FROM productos WHERE nombre = $1", [product]);

        if (existente.length > 0 && existente[0].id !== parseInt(req.params.id)) {
            throw new Error('Este producto ya existe.');
        }
        return true;
    }),

    body('descripcion')
    .notEmpty().withMessage('La descripción del producto es obligatoria.')
    .isString().withMessage('La descripción del producto solo puede contener letras y números.')
    .isLength({min: 3, max: 100}).withMessage('La descripción debe contener de 3 a 50 carácteres.'),

    body('precio')
    .notEmpty().withMessage('El precio del producto es obligatorio.')
    .isFloat({gt:0}).withMessage('El precio del producto debe ser mayor a 0.'),

    body('categoria_id')
    .notEmpty().withMessage('La categoría del producto es obligatoria.')
    .isInt({gt:0}).withMessage('El id de la categoría debe ser mayor a 0.'),

    // Ya no se sube una imagen libre: se elige un logo de un catálogo
    // cerrado (ver WEB/src/constants/productIcons.js), así que acá solo
    // hace falta validar que la key venga en esa lista.
    body("imagen_url")
        .notEmpty().withMessage("Elegí un logo para el producto.")
        .isIn(PRODUCT_ICON_KEYS).withMessage("El logo elegido no es válido."),

    // Proveedor y stock ya no son parte de la ficha del producto: el stock
    // se carga aparte, por lote (ver lotesValidations.js).

    (req,res,next)=>{
        const errors = validationResult(req);
        if(!errors.isEmpty()){
            return res.status(400).json({ errors: errors.array() });
        }
        next();
    }
];

// Validar Body Categorías
export const validateCategoriaBody = [
    body('nombre')
    .notEmpty().withMessage('El nombre de la categoría es obligatorio.')
    .isString().withMessage('El nombre de la categoría solo puede contener letras y números.')
    .isLength({min: 3, max: 50}).withMessage('El nombre debe contener de 3 a 50 carácteres.'),

    (req,res,next)=>{
        const errors = validationResult(req);
        if(!errors.isEmpty()){
            return res.status(400).json({ errors: errors.array() });
        }
        next();
    }
];