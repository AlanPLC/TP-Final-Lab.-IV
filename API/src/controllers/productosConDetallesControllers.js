import { db } from '../../config/db.js';

export const getProductosConDetalles = async(req, res)=>{
    try {
      const [productosConDetalles] = await db.execute('SELECT \
          productos.id AS producto_id, \
          productos.nombre AS producto_nombre, \
          productos.descripcion, \
          productos.precio, \
          productos.imagen_url, \
          productos_categorias.nombre AS categoria_nombre, \
          producto_stock.cantidad_disponible, \
          producto_stock.fecha_ultima_actualizacion \
      FROM productos \
      LEFT JOIN productos_categorias ON productos.categoria_id = productos_categorias.id \
      LEFT JOIN producto_stock ON productos.id = producto_stock.producto_id \
      ORDER BY productos.id;')
      res.status(200).json({ productosConDetalles });
    } catch (error) {
      res.status(500).json({ errors: [{ msg: "Error de servidor." }], error});
    }
}


export const createProductoConDetalles = async (req, res) => {
  try {
    const { nombre, descripcion, precio, categoria_nombre, proveedor_id, cantidad_disponible } = req.body;

    // Iniciar una transacción directamente en la conexión
    await db.beginTransaction();

    // Inserta el producto
    const [productoResult] = await db.query(
      "INSERT INTO productos (nombre, descripcion, precio, proveedor_id) VALUES (?, ?, ?, ?)",
      [nombre, descripcion, precio, proveedor_id]
    );

    const productoId = productoResult.insertId;

    // Inserta categoría
    const [categoriaResult] = await db.query(
      "INSERT INTO productos_categorias (nombre) VALUES (?)",
      [categoria_nombre]
    );

    // Insertar stock
    await db.query(
      "INSERT INTO producto_stock (producto_id, cantidad_disponible, fecha_ultima_actualizacion) VALUES (?, ?, NOW())",
      [productoId, cantidad_disponible]
    );

    // Confirmar la transacción
    await db.commit();
    res.status(201).json({ message: "Producto creado con detalles exitosamente." });

  } catch (error) {
    // Revertir la transacción en caso de error
    await db.rollback();
    res.status(500).json({ error: "Error al crear el producto con detalles.", error });
  }
};