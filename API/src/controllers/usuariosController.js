import { db } from "../../config/db.js";
import bcrypt from "bcrypt";
import { validationResult } from "express-validator";

// Obtener todos los usuarios
export const getAllUsers = async (_, res) => {
  try {
    const [usuarios] = await db.execute("SELECT * FROM usuarios");
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
    const [usuario] = await db.execute("SELECT * FROM usuarios WHERE id = ?", [id]);

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
    const [result] = await db.execute("INSERT INTO usuarios (user, password) VALUES (?, ?)", [user, hashedPassword]);

    res.status(201).json({ message: "Usuario creado.", result });
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
    const [result] = await db.execute("DELETE FROM usuarios WHERE id = ?", [id]);

    if (result.affectedRows === 0) {
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
    const [result] = await db.execute(
      "UPDATE usuarios SET user = ?, password = ?, rol = ? WHERE id = ?",
      [user, hashedPassword, rol, id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ errors: [{ msg: "Usuario no encontrado." }] });
    }

    res.status(200).json({ message: "Usuario actualizado." });
  } catch (error) {
    res.status(500).json({ errors: [{ msg: "Error de servidor al actualizar el usuario." }], error: error.message });
  }
};