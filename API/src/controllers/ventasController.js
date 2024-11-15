import { db } from '../../config/db.js';
import { validationResult } from "express-validator";

// Get ventas (id, fecha), ventadetallada (producto_id, cantidad_producto, precio_unitario)
// y productos (según id de producto: nombre, precio) | Date: año-mes-dias
export const getVentas = async (req, res) => {
    try {
        const [ventas] = await db.execute(
        'SELECT \
            ventas.id AS venta_id, \
            ventas.fecha, \
            usuarios.user AS usuario, \
            ventadetallada.producto_id, \
            ventadetallada.cantidad_producto, \
            productos.nombre AS producto_nombre, \
            productos.precio AS producto_precio \
        FROM ventas \
        JOIN ventadetallada ON ventas.id = ventadetallada.ventas_id \
        JOIN productos ON ventadetallada.producto_id = productos.id \
        JOIN usuarios ON ventas.usuario_id = usuarios.id \
        ORDER BY ventas.id;');

        res.status(200).json({ ventas });
    } catch (error) {
        res.status(500).json({ errors: [{ msg: "Error de servidor." }], error});
    }
};