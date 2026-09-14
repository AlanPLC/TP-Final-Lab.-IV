import { db } from '../../config/db.js';
import jwt from "jsonwebtoken";

// Get ventas (id, fecha), ventadetallada (producto_id, cantidad_producto, precio_unitario)
// y productos (según id de producto: nombre, precio) | Date: año-mes-dias
export const getVentas = async (req, res) => {
    try {
        const { rows: ventas } = await db.query(
        `SELECT
            ventas.id AS venta_id,
            ventas.fecha,
            usuarios."user" AS usuario,
            ventadetallada.producto_id,
            ventadetallada.cantidad_producto,
            productos.nombre AS producto_nombre,
            COALESCE(ventadetallada.precio_unitario, productos.precio) AS producto_precio
        FROM ventas
        JOIN ventadetallada ON ventas.id = ventadetallada.ventas_id
        JOIN productos ON ventadetallada.producto_id = productos.id
        JOIN usuarios ON ventas.usuario_id = usuarios.id
        ORDER BY ventas.id DESC, ventadetallada.id`);

        res.status(200).json({ ventas });
    } catch (error) {
        res.status(500).json({ errors: [{ msg: "Error de servidor al mostrar ventas." }], error: error.message});
    }
};

// Error controlado (no es un bug del servidor) para diferenciarlo del catch
// genérico de abajo - ver su uso en el bucle de consumo de lotes.
class VentaInvalida extends Error {}

export const createVentas = async(req, res) => {
    let client;
    try {
        // Extraigo el token del header, lo decodifico y coloco el id
        // extraido del payload en una variable para utilizarlo en el post.
        const authHeader = req.headers.authorization;
        if (!authHeader) {
            return res.status(401).json({ error: 'No se proporcionó el token.' });
        }
        const token = authHeader.split(' ')[1]; // Extraer el token "Bearer + token"
        const secretKey = process.env.SECRET_KEY; // Llave secreta para verificar el token.

        const decoded = jwt.verify(token, secretKey);
        const usuarioId = decoded.id;

        // Insertamos productos como array de objetos, teniendo cada uno el id del producto y la cantidad.
        const { productos } = req.body;

        // Inicio transacción para peticiones Post.
        client = await db.connect();
        await client.query('BEGIN');
        const { rows } = await client.query('INSERT INTO ventas (usuario_id, fecha) VALUES ($1, NOW()) RETURNING id', [usuarioId]);

        const ventaId = rows[0].id;

        // Por cada línea de venta: se fija el precio de venta actual (queda
        // congelado en la venta) y se descuenta el stock tomando lotes en
        // orden FEFO (el que vence antes primero; sin vencimiento o a
        // igualdad, el que entró antes) - partiendo entre varios lotes si
        // hace falta para cubrir la cantidad pedida.
        for (const { producto_id, cantidad_producto } of productos) {
            const { rows: prodRows } = await client.query('SELECT precio FROM productos WHERE id = $1', [producto_id]);
            if (prodRows.length === 0) {
                throw new VentaInvalida(`El producto Nº${producto_id} no existe.`);
            }
            const precioUnitario = prodRows[0].precio;

            // FOR UPDATE: bloquea esas filas de lotes hasta el COMMIT, para
            // que dos ventas simultáneas no puedan descontar del mismo
            // stock dos veces.
            const { rows: lotesDisponibles } = await client.query(
                `SELECT id, cantidad_restante, precio_costo FROM lotes
                 WHERE producto_id = $1 AND cantidad_restante > 0
                 ORDER BY fecha_vencimiento ASC NULLS LAST, fecha_ingreso ASC
                 FOR UPDATE`,
                [producto_id]
            );

            let pendiente = cantidad_producto;
            const consumos = [];
            for (const lote of lotesDisponibles) {
                if (pendiente <= 0) break;
                const tomar = Math.min(pendiente, lote.cantidad_restante);
                consumos.push({ loteId: lote.id, cantidad: tomar, precioCosto: lote.precio_costo });
                pendiente -= tomar;
            }

            if (pendiente > 0) {
                throw new VentaInvalida(`Stock insuficiente para el producto Nº${producto_id}.`);
            }

            const { rows: detalleRows } = await client.query(
                'INSERT INTO ventadetallada (ventas_id, producto_id, cantidad_producto, precio_unitario) VALUES ($1, $2, $3, $4) RETURNING id',
                [ventaId, producto_id, cantidad_producto, precioUnitario]
            );
            const ventaDetalladaId = detalleRows[0].id;

            for (const consumo of consumos) {
                await client.query('UPDATE lotes SET cantidad_restante = cantidad_restante - $1 WHERE id = $2', [consumo.cantidad, consumo.loteId]);
                await client.query(
                    'INSERT INTO ventadetallada_lotes (ventadetallada_id, lote_id, cantidad, precio_costo) VALUES ($1, $2, $3, $4)',
                    [ventaDetalladaId, consumo.loteId, consumo.cantidad, consumo.precioCosto]
                );
            }
        }

        await client.query('COMMIT');
        res.status(201).json({ message: "Venta creada exitosamente." });
    } catch (error) {
        if (client) await client.query('ROLLBACK');
        if (error instanceof VentaInvalida) {
            return res.status(400).json({ errors: [{ msg: error.message }] });
        }
        res.status(500).json({ errors: [{ msg: "Error de servidor al crear ventas." }], error: error.message});
    } finally {
        if (client) client.release();
    }
}
