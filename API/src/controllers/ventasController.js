import { db } from '../../config/db.js';
import jwt from "jsonwebtoken";

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
        res.status(500).json({ errors: [{ msg: "Error de servidor al mostrar ventas." }], error: error.message});
    }
};

export const createVentas = async(req, res) => {
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
        await db.beginTransaction();
        const [result] = await db.query('INSERT INTO ventas (usuario_id, fecha) VALUES (?,NOW())', [usuarioId]);

        const ventaId = result.insertId;

        // Recorro el array de objetos insertando un registro por cada producto en ventadetallada.
        const promesaDetalles = productos.map((producto) =>
            db.query(
              'INSERT INTO ventadetallada (ventas_id, producto_id, cantidad_producto) VALUES (?, ?, ?)',
              [ventaId, producto.producto_id, producto.cantidad_producto]
            )
          );
      
          // Esperar a que todas las inserciones se completen.
          await Promise.all(promesaDetalles);

        await db.commit();
        res.status(201).json({ message: "Venta creada exitosamente." });
    } catch (error) {
        await db.rollback();
        res.status(500).json({ errors: [{ msg: "Error de servidor al crear ventas." }], error: error.message});
    }
}

export const controlStock = async(req,res)=>{
    const producto_id = req.params.id;
    const { cantidad_disponible } = req.body;
    try {
        const result = await db.execute('UPDATE producto_stock SET cantidad_disponible = ? WHERE producto_id = ?',[cantidad_disponible, producto_id]);
        if(result.affectedRows === 0){
            return res.status(404).json({ errors: [{ msg: "Producto no encontrado" }] });
        }
        res.status(200).json({ message: "Stock del producto actualizado." });

    } catch (error) {
        console.error(error)
        res.status(500).json({ errors: [{ msg: "Error de servidor al actualizar stock." }], error: error.message});
    }
}