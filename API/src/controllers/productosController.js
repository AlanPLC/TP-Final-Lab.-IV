import { db } from "../../config/db.js";
<<<<<<< HEAD
import { validationResult } from "express-validator";
=======
>>>>>>> Francisco-Brizuela

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

<<<<<<< HEAD
    res.status(200).json(usuario[0]);
  } catch (error) {
    res.status(500).json({ errors: [{ msg: "Error de servidor al obtener el Producto." }] });
=======
    res.status(200).json(productos[0]);
  } catch (error) {
    res.status(500).json({ errors: [{ msg: "Error de servidor al obtener el Porducto." }] });
>>>>>>> Francisco-Brizuela
  }
};

//Actulizar productos   
<<<<<<< HEAD
export const uptdateProductos = async (req, res) => {
=======
export const updateProductos = async (req, res) => {
>>>>>>> Francisco-Brizuela
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
  
    try {
      const id = req.params.id;
<<<<<<< HEAD
      const { producto, nombre, descripcion, precio, proveedor } = req.body;
      const [result] = await db.execute(
        "UPDATE productos SET producto = ?, nombre = ?, descripcion = ?, precio = ?, proveedor = ?, WHERE id = ?",
        [producto, nombre, descripcion, precio, proveedor, id]
=======
      const { producto, nombre, descripcion, precio,imagen } = req.body;
      const categoria_id = req.body.categoria_id
      const proveedor_id = req.body.proveedor_id
      const [result] = await db.execute(
        "UPDATE productos SET producto = ?, nombre = ?, descripcion = ?, precio = ?, proveedor = ?, categoria_id=?, imagen_url = ?, WHERE id = ?",
        [producto, nombre, descripcion, precio, proveedor_id, categoria_id,imagen ,id]
>>>>>>> Francisco-Brizuela
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
<<<<<<< HEAD
export const createProducto = async (req, res) => {
=======
export const createProductos = async (req, res) => {
>>>>>>> Francisco-Brizuela
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
  
    try {
<<<<<<< HEAD
      const { user, password } = req.body;
      const [result] = await db.execute("INSERT INTO productos (productos), nombre, descripcion, precio, proveedor VALUES (?, ?)", [productos, descripcion, precio, proveedor]);
=======
      const { productos, descripcion, precio,imgen } = req.body;
      const categoria_id = req.body.categoria_id
      const proveedor_id = req.body.proveedor_id   
      const [result] = await db.execute("INSERT INTO productos (nombre, descripcion, precio,categoria_id ,proveedor_id,imagen_url) VALUES (? ,? ,?, ?, ? )", 
      [productos, descripcion, precio, categoria_id, proveedor_id ,imgen]);
>>>>>>> Francisco-Brizuela
  
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