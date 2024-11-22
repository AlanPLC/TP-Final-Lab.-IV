import { db } from "../../config/db.js";
import { validationResult } from "express-validator";

//Obtener todos los productos
export const getAllProductos = async (_, res) => {
  try {
    const [productos] = await db.execute("SELECT * FROM productos");
    res.status(200).json({ productos });
  } catch (error) {
    res.status(500).json({ errors: [{ msg: "Error de servidor al obtener productos." }] });
  }
};

//Obtener productos por ID
export const productosById = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const id = req.params.id;
    const [productos] = await db.execute("SELECT * FROM productos WHERE id = ?", [id]);

    if (productos.length === 0) {
      return res.status(404).json({ errors: [{ msg: "Producto no encontrado." }] });
    }

    res.status(200).json(usuario[0]);
  } catch (error) {
    res.status(500).json({ errors: [{ msg: "Error de servidor al obtener el Producto." }] });
  }
};

//Actulizar productos   
export const uptdateProductos = async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
  
    try {
      const id = req.params.id;
      const { producto, nombre, descripcion, precio, proveedor } = req.body;
      const [result] = await db.execute(
        "UPDATE productos SET producto = ?, nombre = ?, descripcion = ?, precio = ?, proveedor = ?, WHERE id = ?",
        [producto, nombre, descripcion, precio, proveedor, id]
      );
  
      if (result.affectedRows === 0) {
        return res.status(404).json({ errors: [{ msg: "Producto no encontrado." }] });
      }
  
      res.status(200).json({ message: "Producto actualizado." });
    } catch (error) {
      res.status(500).json({ errors: [{ msg: "Error de servidor al actualizar el producto." }] });
    }
  };  

//Crear productos   
export const createProducto = async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
  
    try {
      const { user, password } = req.body;
      const [result] = await db.execute("INSERT INTO productos (productos), nombre, descripcion, precio, proveedor VALUES (?, ?)", [productos, descripcion, precio, proveedor]);
  
      res.status(201).json({ message: "Producto creado.", result });
    } catch (error) {
      res.status(500).json({ errors: [{ msg: "Error de servidor al crear el productos." }] });
    }
  };
  
//Eliminar productos por ID
export const deleteProducto = async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
  
    try {
      const id = req.params.id;
      const [result] = await db.execute("DELETE FROM productos WHERE id = ?", [id]);
  
      if (result.affectedRows === 0) {
        return res.status(404).json({ errors: [{ msg: "Producto no encontrado." }] });
      }
  
      res.status(200).json({ message: "Producto eliminado." });
    } catch (error) {
      res.status(500).json({ errors: [{ msg: "Error de servidor al eliminar el producto." }] });
    }
  };