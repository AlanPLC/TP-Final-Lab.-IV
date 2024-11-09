import { db } from "../../config/db.js";

export const getAllUsers = async(req, res) => {
    const [usuarios] = await db.execute("select * from usuarios");
    res.send({ usuarios });
  };
