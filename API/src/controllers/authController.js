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
        const [usuario] = await db.execute("SELECT * FROM usuarios WHERE user = ?", [user]);

        if (usuario.length === 0) {
            return res.status(400).json({ errors: [{ msg: "Usuario o contraseña incorrectos." }] });
        }

        const comparacion = await bcrypt.compare(password, usuario[0].password);
        if (!comparacion) {
            return res.status(400).json({ errors: [{ msg: "Usuario o contraseña incorrectos." }] });
        }

        // Generar y enviar el token JWT
        const payload = { id: usuario[0].id, user: usuario[0].user };
        const token = jwt.sign(payload, process.env.SECRET_KEY, { expiresIn: '1h' });

        res.json({ token });
    } catch (error) {
        res.status(500).json({ errors: [{ msg: "Error de servidor" }] });
    }
};