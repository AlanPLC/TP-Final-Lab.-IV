import { db } from "../../config/db.js";

export const getAllUsers = async(req, res) => {
  try {
    const [usuarios] = await db.execute("select * from usuarios");
    res.status(200).send({ usuarios });
  } catch (error) {
    res.status(500).send({error});
  }

  };

export const getUserByID = async(req, res) => {
  try {
    const id = req.params.id;
    const [usuario] = await db.execute("select * from usuarios where id=?", [id]);
    if (usuario.length === 0) {
      return res.status(404).send({ message: "Usuario no encontrado." });
    }
    res.status(200).send(usuario[0]);
  } catch (error) {
    res.status(500).send({error});
  }
}

export const createUser = async(req, res) => {
  try {
    const { user, password } = req.body;
    const [result] = await db.execute("INSERT INTO usuarios (user, password) VALUES (?,?)", [user, password]);
    res.status(201).send({ message: "Usuario creado.", result: result });
  } catch (error) {
    res.status(500).send({error});
  }
}

export const deleteUser = async(req, res) => {
  try {
    const id = req.params.id;
    const [result] = await db.execute("DELETE FROM usuarios WHERE id =?", [id]);
    if (result.affectedRows === 0) {
      return res.status(404).send({ message: "Usuario no encontrado." });
    }
    res.status(201).send({ message: "Usuario eliminado.", result: result });
  } catch (error) {
    res.status(500).send({error});
  }
}

export const updateUser = async(req, res) => {
  try {
    const id = req.params.id;
    const { user, password, rol} = req.body;
    const [result] = await db.execute("UPDATE usuarios SET user =?, password =?, rol=? WHERE id =?", [user, password, rol, id]);
    if (result.affectedRows === 0) {
      return res.status(404).send({ message: "Usuario no encontrado." });
    }
    res.status(200).send({ message: "Usuario actualizado.", result: result });
  } catch (error) {
    res.status(500).send({error});
  }
}