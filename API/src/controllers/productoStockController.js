import { db } from "../../config/db.js";

export const getAllProductosStock = async(req, res) => {
    const [productosStock] = await db.execute("select * from productosStock");
    res.send({ productosStock });
  };

export const getAllProductosStock_id = async(req, res) => {
    const [productos] = await db.execute("select * from productosStock = ?");
    res.send({ productosStock });
  };