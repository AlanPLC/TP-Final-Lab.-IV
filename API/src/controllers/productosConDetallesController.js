import { db } from '../../config/db.js';

export const getProductosConDetalles = async(req, res)=>{
    try {
      const [productosConDetalles] = await db.execute('SELECT \
        productos.id AS producto_id, \
        productos.nombre AS producto_nombre, \
        productos.descripcion, \
        productos.precio, \
        productos.imagen_url, \
        productos_categorias.id AS categoria_id, \
        productos_categorias.nombre AS categoria_nombre, \
        producto_stock.cantidad_disponible, \
        producto_stock.fecha_ultima_actualizacion, \
        proveedores.id AS proveedor_id, \
        proveedores.nombre AS proveedor_nombre \
      FROM productos \
      LEFT JOIN productos_categorias ON productos.categoria_id = productos_categorias.id \
      LEFT JOIN producto_stock ON productos.id = producto_stock.producto_id \
      LEFT JOIN proveedores ON productos.proveedor_id = proveedores.id \
      ORDER BY productos.id;')
      res.status(200).json({ productosConDetalles });
    } catch (error) {
      res.status(500).json({ errors: [{ msg: "Error al mostrar los productos con detalles." }], error: error.message});
    }
}

export const getCategoria = async(_, res)=>{
  try {
    const [categorias] = await db.execute('SELECT * FROM productos_categorias')
    res.status(200).json({ categorias });
  } catch (error) {
    res.status(500).json({ errors: [{ msg: "Error al mostrar las Categorias con detalles." }], error: error.message});
  }
}

export const getProductosConDetallesByID = async(req, res)=>{
  try {
      const id = req.params.id;
      const response = await db.execute('SELECT \
          productos.id AS producto_id, \
          productos.nombre AS producto_nombre, \
          productos.descripcion, \
          productos.precio, \
          productos.imagen_url, \
          productos_categorias.id AS categoria_id, \
          productos_categorias.nombre AS categoria_nombre, \
          producto_stock.cantidad_disponible, \
          producto_stock.fecha_ultima_actualizacion, \
          proveedores.id AS proveedor_id, \
          proveedores.nombre AS proveedor_nombre \
        FROM productos \
        LEFT JOIN productos_categorias ON productos.categoria_id = productos_categorias.id \
        LEFT JOIN producto_stock ON productos.id = producto_stock.producto_id \
        LEFT JOIN proveedores ON productos.proveedor_id = proveedores.id \
        WHERE productos.id =? \
        ORDER BY productos.id;',[id])
      if (response === 0) {
        return res.status(404).json({ errors: [{ msg: "Usuario no encontrado." }] });
      }
      res.status(200).json(response[0])
  } catch (error) {
    res.status(500).json({ errors: [{ msg: "Error al mostrar el producto por id con detalles." }], error: error.message});
  }
}

export const createProductoConDetalles = async (req, res) => {
  try {
    const { nombre, descripcion, precio, categoria_id, proveedor_id, imagen_url, cantidad_disponible } = req.body;

    // Iniciar una transacción directamente en la conexión
    await db.beginTransaction();

    // Inserta el producto
    const [result] = await db.query(
      "INSERT INTO productos (nombre, descripcion, precio, categoria_id, proveedor_id, imagen_url) VALUES (?, ?, ?, ?, ?, ?)",
      [nombre, descripcion, precio, categoria_id, proveedor_id, imagen_url]
    );

    const productoId = result.insertId;

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
    res.status(500).json({ errors: [{ msg: "Error al crear el producto con detalles." }], error: error.message});
  }
};

export const updateProductoConDetalles = async(req,res)=>{
  const id = req.params.id;
  const { nombre, descripcion, precio, categoria_id, proveedor_id, imagen_url, cantidad_disponible } = req.body;
  try {

    await db.beginTransaction();

    const [result] = await db.query('UPDATE productos SET nombre =?, descripcion =?, precio =?, categoria_id =?, proveedor_id =?, imagen_url =? WHERE id =?', [nombre, descripcion, precio, categoria_id, proveedor_id, imagen_url, id])
    if(result.affectedRows === 0){
      return res.status(404).json({ errors: [{ msg: "No se encontró el producto." }] });
    }
    await db.query('UPDATE producto_stock SET cantidad_disponible =?, fecha_ultima_actualizacion =NOW() WHERE producto_id =?', [cantidad_disponible, id])
    res.status(201).json({ message: "Producto actualizado con detalles exitosamente." });
  } catch (error) {
    await db.rollback();
    res.status(500).json({ errors: [{ msg: "Error al actualizar el producto con detalles." }], error: error.message});
  }
}

export const deleteProductoConDetalles = async(req,res)=>{
  const id = Number(req.params.id);
  try {
    await db.beginTransaction();

    const [result] = await db.query('DELETE FROM producto_stock WHERE producto_id =?', [id])

    if(result.affectedRows === 0){
      return res.status(404).json({ errors: [{ msg: "No se encontró el producto." }] });
    }
    await db.query('DELETE FROM productos WHERE id =?', [id])
    
    await db.commit();
    res.status(200).json({ message: "Producto y detalles eliminados exitosamente." });
    
  } catch (error) {
    await db.rollback();
    res.status(500).json({ errors: [{ msg: "Error al eliminar el producto." }], error: error.message});
  }
}