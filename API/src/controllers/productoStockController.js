import { db } from "../../config/db.js";
import {obtenerFechaActual} from "./VentasControllers.js"

//Obtener todos los productos stock
export const getAllProductoStock = async (_, res) => {
  try {
    const [productos] = await db.execute("SELECT * FROM producto_stock");
    res.status(200).json({ productos });
  } catch (error) {
    res.status(500).json({ errors: [{ msg: "Error de servidor al obtener productos del stock." }] });
  }
};

//Obtener productos stock por ID
export const productoStockById = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const id = req.params.id;
    const [productos] = await db.execute("SELECT * FROM producto_stock WHERE id = ?", [id]);

    if (productos.length === 0) {
      return res.status(404).json({ errors: [{ msg: "Producto no encontrado." }] });
    }

    res.status(200).json(productos[0]);
  } catch (error) {
    res.status(500).json({ errors: [{ msg: "Error de servidor al obtener el Porducto del stock." }] });
  }
};


//Actulizar productos stock 
export const updateProductoStock = async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
  
    try {
      const id = req.params.id;
      const {producto_id , proveedor_id} = req.body
      const fecha = obtenerFechaActual()
      
      const [result] = await db.execute(
        "UPDATE producto_stock SET producto_id = ?, proveedor_id = ?, fecha_ultima_actualizacion = ?, WHERE id = ?",
        [producto_id, proveedor_id, fecha, id]
      );
  
      if (result.affectedRows === 0) {
        return res.status(404).json({ errors: [{ msg: "Producto no encontrado en el stock." }] });
      }
  
      res.status(200).json({ message: "Producto actualizado." });
    } catch (error) {
      res.status(500).json({ errors: [{ msg: "Error de servidor al actualizar el producto en stock." }] });
    }
  };  

//Crear productos stock  
export const createProductoStock = async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
  
    try {
      const {producto_id , proveedor_id} = req.body
      const fecha = obtenerFechaActual()
      
      const [result] = await db.execute(
        "INSERT INTO producto_stock SET (producto_id, proveedor_id, fecha_ultima_actualizacion ) VALUES (?, ?, ?)",
        [producto_id, proveedor_id, fecha]
      );
      res.status(201).json({ message: "Producto creado en stock.", result });
    } catch (error) {
      res.status(500).json({ errors: [{ msg: "Error de servidor al crear el productos para stock." }] });
    }
  };
  
//Eliminar productos stock por ID
export const deleteProductoStock = async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
  
    try {
      const id = req.params.id;
      const [result] = await db.execute("DELETE FROM productos WHERE id = ?", [id]);
  
      if (result.affectedRows === 0) {
        return res.status(404).json({ errors: [{ msg: "Producto no encontrado en stock." }] });
      }
  
      res.status(200).json({ message: "Producto eliminado." });
    } catch (error) {
      res.status(500).json({ errors: [{ msg: "Error de servidor al eliminar el producto del stock." }] });
    }
  };