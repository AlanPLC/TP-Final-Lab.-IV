import { db } from '../../config/db.js';
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

export const loginUser = async (req, res) => {
    try {
        const { user, password } = req.body
        const [usuario] = await db.execute("SELECT * FROM usuarios WHERE user =?", [user])

        if(usuario.length === 0){
            return res.status(400).send({ message: "Usuario o contraseña incorrectos." });
        }

        const comparacion = await bcrypt.compare(password, usuario[0].password);
        if(!comparacion){
            return res.status(400).send({ message: "Usuario o contraseña incorrectos." });
        }
        const payload = {id: usuario[0].id, user: usuario[0].user}
        const token = jwt.sign(payload, process.env.SECRET_KEY, { expiresIn: '1h' });

        res.json({token})
    } catch (error) {
        res.status(500).json({ error: "Error de servidor" });
    }
}
