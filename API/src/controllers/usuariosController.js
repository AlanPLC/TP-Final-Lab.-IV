import { db } from "../../config/db.js";
import bcrypt from "bcrypt";
import { validationResult } from "express-validator";

// Obtener todos los usuarios
export const getAllUsers = async (_, res) => {
  try {
    const { rows: usuarios } = await db.query("SELECT * FROM usuarios");
    res.status(200).json({ usuarios });
  } catch (error) {
    res.status(500).json({ errors: [{ msg: "Error de servidor al obtener usuarios." }], error: error.message });
  }
};

// Obtener un usuario por ID
export const getUserByID = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const id = req.params.id;
    const { rows: usuario } = await db.query("SELECT * FROM usuarios WHERE id = $1", [id]);

    if (usuario.length === 0) {
      return res.status(404).json({ errors: [{ msg: "Usuario no encontrado." }] });
    }

    res.status(200).json(usuario[0]);
  } catch (error) {
    res.status(500).json({ errors: [{ msg: "Error de servidor al obtener el usuario." }], error: error.message });
  }
};

// Crear un usuario
export const createUser = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const { user, password } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);
    const { rows } = await db.query(
      'INSERT INTO usuarios ("user", password) VALUES ($1, $2) RETURNING id',
      [user, hashedPassword]
    );

    res.status(201).json({ message: "Usuario creado.", result: { insertId: rows[0].id } });
  } catch (error) {
    res.status(500).json({ errors: [{ msg: "Error de servidor al crear el usuario." }], error: error.message });
  }
};

// Eliminar un usuario por ID
export const deleteUser = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const id = req.params.id;
    const result = await db.query("DELETE FROM usuarios WHERE id = $1", [id]);

    if (result.rowCount === 0) {
      return res.status(404).json({ errors: [{ msg: "Usuario no encontrado." }] });
    }

    res.status(200).json({ message: "Usuario eliminado." });
  } catch (error) {
    res.status(500).json({ errors: [{ msg: "Error de servidor al eliminar el usuario." }], error: error.message });
  }
};

// Actualizar un usuario por ID
export const updateUser = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const id = req.params.id;
    const { user, password, rol } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);
    const result = await db.query(
      'UPDATE usuarios SET "user" = $1, password = $2, rol = $3 WHERE id = $4',
      [user, hashedPassword, rol, id]
    );

    if (result.rowCount === 0) {
      return res.status(404).json({ errors: [{ msg: "Usuario no encontrado." }] });
    }

    res.status(200).json({ message: "Usuario actualizado." });
  } catch (error) {
    res.status(500).json({ errors: [{ msg: "Error de servidor al actualizar el usuario." }], error: error.message });
  }
};
