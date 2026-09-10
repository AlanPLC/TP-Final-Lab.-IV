import { db } from '../../config/db.js';

export const getProductosConDetalles = async(req, res)=>{
    try {
      const { rows: productosConDetalles } = await db.query(`SELECT
        productos.id AS producto_id,
        productos.nombre AS producto_nombre,
        productos.descripcion,
        productos.precio,
        productos.imagen_url,
        productos_categorias.id AS categoria_id,
        productos_categorias.nombre AS categoria_nombre,
        producto_stock.cantidad_disponible,
        producto_stock.fecha_ultima_actualizacion,
        proveedores.id AS proveedor_id,
        proveedores.nombre AS proveedor_nombre
      FROM productos
      LEFT JOIN productos_categorias ON productos.categoria_id = productos_categorias.id
      LEFT JOIN producto_stock ON productos.id = producto_stock.producto_id
      LEFT JOIN proveedores ON productos.proveedor_id = proveedores.id
      ORDER BY productos.id`)
      res.status(200).json({ productosConDetalles });
    } catch (error) {
      res.status(500).json({ errors: [{ msg: "Error al mostrar los productos con detalles." }], error: error.message});
    }
}

export const getCategoria = async(_, res)=>{
  try {
    const { rows: categorias } = await db.query('SELECT * FROM productos_categorias')
    res.status(200).json({ categorias });
  } catch (error) {
    res.status(500).json({ errors: [{ msg: "Error al mostrar las Categorias con detalles." }], error: error.message});
  }
}

export const getProductosConDetallesByID = async(req, res)=>{
  try {
      const id = req.params.id;
      const { rows } = await db.query(`SELECT
          productos.id AS producto_id,
          productos.nombre AS producto_nombre,
          productos.descripcion,
          productos.precio,
          productos.imagen_url,
          productos_categorias.id AS categoria_id,
          productos_categorias.nombre AS categoria_nombre,
          producto_stock.cantidad_disponible,
          producto_stock.fecha_ultima_actualizacion,
          proveedores.id AS proveedor_id,
          proveedores.nombre AS proveedor_nombre
        FROM productos
        LEFT JOIN productos_categorias ON productos.categoria_id = productos_categorias.id
        LEFT JOIN producto_stock ON productos.id = producto_stock.producto_id
        LEFT JOIN proveedores ON productos.proveedor_id = proveedores.id
        WHERE productos.id = $1
        ORDER BY productos.id`, [id])
      if (rows.length === 0) {
        return res.status(404).json({ errors: [{ msg: "Usuario no encontrado." }] });
      }
      res.status(200).json(rows[0])
  } catch (error) {
    res.status(500).json({ errors: [{ msg: "Error al mostrar el producto por id con detalles." }], error: error.message});
  }
}

export const createProductoConDetalles = async (req, res) => {
  const client = await db.connect();
  try {
    const { nombre, descripcion, precio, categoria_id, proveedor_id, imagen_url, cantidad_disponible } = req.body;

    await client.query('BEGIN');

    // Inserta el producto
    const { rows } = await client.query(
      "INSERT INTO productos (nombre, descripcion, precio, categoria_id, proveedor_id, imagen_url) VALUES ($1, $2, $3, $4, $5, $6) RETURNING id",
      [nombre, descripcion, precio, categoria_id, proveedor_id, imagen_url]
    );

    const productoId = rows[0].id;

    // Insertar stock
    await client.query(
      "INSERT INTO producto_stock (producto_id, cantidad_disponible, fecha_ultima_actualizacion) VALUES ($1, $2, NOW())",
      [productoId, cantidad_disponible]
    );

    // Confirmar la transacción
    await client.query('COMMIT');
    res.status(201).json({ message: "Producto creado con detalles exitosamente." });

  } catch (error) {
    // Revertir la transacción en caso de error
    await client.query('ROLLBACK');
    res.status(500).json({ errors: [{ msg: "Error al crear el producto con detalles." }], error: error.message});
  } finally {
    client.release();
  }
};

export const updateProductoConDetalles = async(req,res)=>{
  const id = req.params.id;
  const { nombre, descripcion, precio, categoria_id, proveedor_id, imagen_url, cantidad_disponible } = req.body;
  const client = await db.connect();
  try {
    await client.query('BEGIN');

    const result = await client.query(
      'UPDATE productos SET nombre = $1, descripcion = $2, precio = $3, categoria_id = $4, proveedor_id = $5, imagen_url = $6 WHERE id = $7',
      [nombre, descripcion, precio, categoria_id, proveedor_id, imagen_url, id]
    )
    if(result.rowCount === 0){
      await client.query('ROLLBACK');
      return res.status(404).json({ errors: [{ msg: "No se encontró el producto." }] });
    }
    await client.query(
      'UPDATE producto_stock SET cantidad_disponible = $1, fecha_ultima_actualizacion = NOW() WHERE producto_id = $2',
      [cantidad_disponible, id]
    )
    await client.query('COMMIT');
    res.status(201).json({ message: "Producto actualizado con detalles exitosamente." });
  } catch (error) {
    await client.query('ROLLBACK');
    res.status(500).json({ errors: [{ msg: "Error al actualizar el producto con detalles." }], error: error.message});
  } finally {
    client.release();
  }
}

export const deleteProductoConDetalles = async(req,res)=>{
  const id = Number(req.params.id);
  const client = await db.connect();
  try {
    await client.query('BEGIN');

    const result = await client.query('DELETE FROM producto_stock WHERE producto_id = $1', [id])

    if(result.rowCount === 0){
      await client.query('ROLLBACK');
      return res.status(404).json({ errors: [{ msg: "No se encontró el producto." }] });
    }
    await client.query('DELETE FROM productos WHERE id = $1', [id])

    await client.query('COMMIT');
    res.status(200).json({ message: "Producto y detalles eliminados exitosamente." });

  } catch (error) {
    await client.query('ROLLBACK');
    res.status(500).json({ errors: [{ msg: "Error al eliminar el producto." }], error: error.message});
  } finally {
    client.release();
  }
}
