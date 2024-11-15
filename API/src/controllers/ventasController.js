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
            ventadetallada.producto_id, \
            ventadetallada.cantidad_producto, \
            ventadetallada.precio_unitario, \
            productos.nombre AS producto_nombre, \
            productos.precio AS producto_precio \
        FROM ventas \
        JOIN ventadetallada ON ventas.id = ventadetallada.ventas_id \
        JOIN productos ON ventadetallada.producto_id = productos.id \
        ORDER BY ventas.id;')

        res.status(200).json({ventas});
        
    } catch (error) {
        res.status(500).json({ errors: [{ msg: "Error de servidor." }] });
    }
};


// Buscar venta por ID
export const getVentasByID = async(req,res) => {
    const errors = validationResult(req)
    if(!errors.isEmpty()){
        return res.status(400).json({ errors: errors.array() });
    }
    try {
        const id = req.params.id
        const [venta] = await db.execute('SELECT \
            ventas.id AS venta_id, \
            ventas.fecha, \
            ventadetallada.producto_id, \
            ventadetallada.cantidad_producto, \
            ventadetallada.precio_unitario, \
            productos.nombre AS producto_nombre, \
            productos.precio AS producto_precio \
        FROM ventas \
        JOIN ventadetallada ON ventas.id = ventadetallada.ventas_id \
        JOIN productos ON ventadetallada.producto_id = productos.id \
        WHERE ventas.id = ?;', [id])

        if(venta.length === 0){
            return res.status(404).json({ errors: [{ msg: "La venta no existe." }] });
        }
        res.status(200).json({ venta });
    } catch (error) {
        res.status(500).json({ errors: [{ msg: "Error de servidor al obtener la venta." }] });
    }
}