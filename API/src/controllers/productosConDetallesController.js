import { db } from '../../config/db.js';

// Tope de catálogo: la app es para un minimarket chico, no hace falta más.
const MAX_PRODUCTOS = 30;

// Postgres error code para violación de foreign key (categoria_id que no
// existe, o intentar borrar un producto que tiene lotes cargados) - se usa
// para devolver un 400 claro en vez de un 500 crudo.
const FK_VIOLATION = '23503';

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
        COALESCE(stock.cantidad_disponible, 0) AS cantidad_disponible
      FROM productos
      LEFT JOIN productos_categorias ON productos.categoria_id = productos_categorias.id
      LEFT JOIN (
        SELECT producto_id, SUM(cantidad_restante) AS cantidad_disponible
        FROM lotes
        WHERE cantidad_restante > 0
        GROUP BY producto_id
      ) stock ON stock.producto_id = productos.id
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
          COALESCE(stock.cantidad_disponible, 0) AS cantidad_disponible
        FROM productos
        LEFT JOIN productos_categorias ON productos.categoria_id = productos_categorias.id
        LEFT JOIN (
          SELECT producto_id, SUM(cantidad_restante) AS cantidad_disponible
          FROM lotes
          WHERE cantidad_restante > 0
          GROUP BY producto_id
        ) stock ON stock.producto_id = productos.id
        WHERE productos.id = $1`, [id])
      if (rows.length === 0) {
        return res.status(404).json({ errors: [{ msg: "Producto no encontrado." }] });
      }
      res.status(200).json(rows[0])
  } catch (error) {
    res.status(500).json({ errors: [{ msg: "Error al mostrar el producto por id con detalles." }], error: error.message});
  }
}

// Crea solo la ficha del producto (catálogo): nombre, descripción, precio de
// venta, categoría y logo. El stock se carga aparte, por lote (ver
// lotesController.js) - un producto recién creado empieza con 0 unidades.
export const createProductoConDetalles = async (req, res) => {
  try {
    const { nombre, descripcion, precio, categoria_id, imagen_url } = req.body;

    const { rows: countRows } = await db.query('SELECT COUNT(*) FROM productos');
    if (Number(countRows[0].count) >= MAX_PRODUCTOS) {
      return res.status(400).json({ errors: [{ msg: `Se alcanzó el máximo de ${MAX_PRODUCTOS} productos.` }] });
    }

    const { rows } = await db.query(
      "INSERT INTO productos (nombre, descripcion, precio, categoria_id, imagen_url) VALUES ($1, $2, $3, $4, $5) RETURNING id",
      [nombre, descripcion, precio, categoria_id, imagen_url]
    );

    res.status(201).json({ message: "Producto creado exitosamente.", id: rows[0].id });
  } catch (error) {
    if (error.code === FK_VIOLATION) {
      return res.status(400).json({ errors: [{ msg: "La categoría seleccionada no existe." }] });
    }
    res.status(500).json({ errors: [{ msg: "Error al crear el producto." }], error: error.message});
  }
};

export const updateProductoConDetalles = async(req,res)=>{
  const id = req.params.id;
  const { nombre, descripcion, precio, categoria_id, imagen_url } = req.body;
  try {
    const result = await db.query(
      'UPDATE productos SET nombre = $1, descripcion = $2, precio = $3, categoria_id = $4, imagen_url = $5 WHERE id = $6',
      [nombre, descripcion, precio, categoria_id, imagen_url, id]
    )
    if(result.rowCount === 0){
      return res.status(404).json({ errors: [{ msg: "No se encontró el producto." }] });
    }
    res.status(200).json({ message: "Producto actualizado exitosamente." });
  } catch (error) {
    if (error.code === FK_VIOLATION) {
      return res.status(400).json({ errors: [{ msg: "La categoría seleccionada no existe." }] });
    }
    res.status(500).json({ errors: [{ msg: "Error al actualizar el producto." }], error: error.message});
  }
}

export const deleteProductoConDetalles = async(req,res)=>{
  const id = Number(req.params.id);
  try {
    const result = await db.query('DELETE FROM productos WHERE id = $1', [id])
    if(result.rowCount === 0){
      return res.status(404).json({ errors: [{ msg: "No se encontró el producto." }] });
    }
    res.status(200).json({ message: "Producto eliminado exitosamente." });
  } catch (error) {
    // lotes.producto_id es RESTRICT a propósito (ver schema.sql): no se puede
    // borrar un producto que ya tiene lotes cargados, para no perder el
    // historial de stock/costos/ventas asociado.
    if (error.code === FK_VIOLATION) {
      return res.status(400).json({ errors: [{ msg: "No se puede eliminar: el producto tiene lotes cargados." }] });
    }
    res.status(500).json({ errors: [{ msg: "Error al eliminar el producto." }], error: error.message});
  }
}
