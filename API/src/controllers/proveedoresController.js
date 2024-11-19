import { db } from '../../config/db.js';
export const getProveedores = async(req,res)=>{
    try {
        const [proveedor] = await db.execute(
        `SELECT 
                proveedores.id AS proveedor_id,
                proveedores.nombre AS proveedor_nombre,
                productos.id AS producto_id,
                productos.nombre AS producto_nombre
            FROM proveedores
            LEFT JOIN productos ON proveedores.id = productos.proveedor_id
            ORDER BY proveedores.id, productos.id`);

        res.status(200).json({ proveedor });
    } catch (error) {
        res.status(500).json({ errors: [{ msg: "Error de servidor." }], error});
    }
}