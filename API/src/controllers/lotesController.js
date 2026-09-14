import { db } from '../../config/db.js';

const FK_VIOLATION = '23503';

// Lotes de un producto, en el mismo orden en que se van a consumir al
// vender (FEFO: el que vence antes primero; sin vencimiento o a igualdad,
// el que entró antes). Sirve para ver el detalle de stock de un producto.
export const getLotesPorProducto = async (req, res) => {
  try {
    const producto_id = req.params.id;
    const { rows: lotes } = await db.query(
      `SELECT
        lotes.id,
        lotes.producto_id,
        lotes.proveedor_id,
        proveedores.nombre AS proveedor_nombre,
        lotes.precio_costo,
        lotes.cantidad_inicial,
        lotes.cantidad_restante,
        lotes.fecha_ingreso,
        lotes.fecha_vencimiento
      FROM lotes
      JOIN proveedores ON lotes.proveedor_id = proveedores.id
      WHERE lotes.producto_id = $1
      ORDER BY lotes.fecha_vencimiento ASC NULLS LAST, lotes.fecha_ingreso ASC`,
      [producto_id]
    );
    res.status(200).json({ lotes });
  } catch (error) {
    res.status(500).json({ errors: [{ msg: "Error al mostrar los lotes del producto." }], error: error.message });
  }
};

// Carga de mercadería: crea un lote nuevo, que suma stock al producto.
export const createLote = async (req, res) => {
  try {
    const { producto_id, proveedor_id, precio_costo, cantidad, fecha_vencimiento } = req.body;

    const { rows } = await db.query(
      `INSERT INTO lotes (producto_id, proveedor_id, precio_costo, cantidad_inicial, cantidad_restante, fecha_vencimiento)
       VALUES ($1, $2, $3, $4, $4, $5) RETURNING id`,
      [producto_id, proveedor_id, precio_costo, cantidad, fecha_vencimiento || null]
    );

    res.status(201).json({ message: "Lote cargado exitosamente.", id: rows[0].id });
  } catch (error) {
    if (error.code === FK_VIOLATION) {
      return res.status(400).json({ errors: [{ msg: "El producto o el proveedor seleccionado no existe." }] });
    }
    res.status(500).json({ errors: [{ msg: "Error al cargar el lote." }], error: error.message });
  }
};
