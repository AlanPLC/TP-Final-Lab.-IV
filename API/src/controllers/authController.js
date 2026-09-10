import { db } from '../../config/db.js';
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { validationResult } from "express-validator";

export const loginUser = async (req, res) => {
    // Almaceno los errores desde express-validator
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        // Si hay errores de validación se devuelven al front
        return res.status(400).json({ errors: errors.array() });
    }

    try {
        const { user, password } = req.body;
        const { rows } = await db.query('SELECT * FROM usuarios WHERE "user" = $1', [user]);

        if (rows.length === 0) {
            return res.status(400).json({ errors: [{ msg: "Usuario o contraseña incorrectos." }] });
        }

        const comparacion = await bcrypt.compare(password, rows[0].password);
        if (!comparacion) {
            return res.status(400).json({ errors: [{ msg: "Usuario o contraseña incorrectos." }] });
        }

        // Generar y enviar el token JWT
        const payload = { id: rows[0].id, user: rows[0].user, rol: rows[0].rol };
        const token = jwt.sign(payload, process.env.SECRET_KEY, { expiresIn: '1h' });

        res.json({ token });
    } catch (error) {
        res.status(500).json({ errors: [{ msg: "Error de servidor" }], error: error.message });
    }
};