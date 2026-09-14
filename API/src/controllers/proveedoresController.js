import { db } from '../../config/db.js';

// Tope de proveedores: la app es para un minimarket chico, no hace falta más.
const MAX_PROVEEDORES = 5;

const FK_VIOLATION = '23503';

export const getOnlyProveedores = async(req,res)=>{
    try {
        const { rows: proveedores } = await db.query('SELECT * FROM proveedores');
        res.status(200).json({ proveedores });
    } catch (error) {
        res.status(500).json({ errors: [{ msg: "Error al mostrar los proveedores." }], error: error.message});
    }
}
export const getProveedoresConProductos = async(req,res)=>{
    try {
        // Un proveedor ya no está vinculado a un producto directamente, sino
        // a través de los lotes que le cargaron (ver schema.sql) - "sus
        // productos" son los que tienen al menos un lote de ese proveedor.
        const { rows: proveedor } = await db.query(
        `SELECT
                proveedores.id AS proveedor_id,
                proveedores.nombre AS proveedor_nombre,
                proveedores.descripcion AS proveedor_descripcion,
                productos.id AS producto_id,
                productos.nombre AS producto_nombre
            FROM proveedores
            LEFT JOIN (SELECT DISTINCT producto_id, proveedor_id FROM lotes) lotes_proveedor
                ON lotes_proveedor.proveedor_id = proveedores.id
            LEFT JOIN productos ON productos.id = lotes_proveedor.producto_id
            ORDER BY proveedores.id DESC, productos.id`);

        res.status(200).json({ proveedor });
    } catch (error) {
        res.status(500).json({ errors: [{ msg: "Error al mostrar los proveedores con productos." }], error: error.message});
    }
}

export const getProveedorByID = async(req,res)=>{
    const id = req.params.id
    try {
        const { rows: proveedor } = await db.query(
            'SELECT * FROM proveedores WHERE id = $1',
            [id]);
        if (proveedor.length === 0) {
            return res.status(404).json({ errors: [{ msg: "Proveedor no encontrado." }] });
        }
        res.status(200).json(proveedor[0]);
    } catch (error) {
        res.status(500).json({ errors: [{ msg: "Error al mostrar el proveedor por ID." }], error: error.message});
    }
}

export const createProveedores = async(req, res)=>{
    const {nombre, descripcion} = req.body
    try {
        const { rows: countRows } = await db.query('SELECT COUNT(*) FROM proveedores');
        if (Number(countRows[0].count) >= MAX_PROVEEDORES) {
            return res.status(400).json({ errors: [{ msg: `Se alcanzó el máximo de ${MAX_PROVEEDORES} proveedores.` }] });
        }

        await db.query(
        'INSERT INTO proveedores (nombre, descripcion) VALUES ($1, $2)',
        [nombre, descripcion]);
        res.status(201).json({ message: "Proveedor creado." });
    } catch (error) {
        res.status(500).json({ errors: [{ msg: "Error al crear proveedor." }], error: error.message});
    }
}

export const deleteProveedor = async(req, res)=>{
    const id = req.params.id
    try {
        const result = await db.query('DELETE FROM proveedores WHERE id = $1', [id]);
        if(result.rowCount === 0){
            return res.status(404).json({ errors: [{ msg: "Proveedor no encontrado." }] });
        }
        res.status(200).json({ message: "Proveedor eliminado." });
    } catch (error) {
        // lotes.proveedor_id es RESTRICT (ver schema.sql): no se puede borrar
        // un proveedor que ya tiene lotes cargados.
        if (error.code === FK_VIOLATION) {
            return res.status(400).json({ errors: [{ msg: "No se puede eliminar: el proveedor tiene lotes cargados." }] });
        }
        res.status(500).json({ errors: [{ msg: "Error al eliminar proveedor." }], error: error.message});
    }
}

export const updateProveedor = async(req, res)=>{
    const id = req.params.id
    const {nombre, descripcion} = req.body
    try {
        const result = await db.query('UPDATE proveedores SET nombre = $1, descripcion = $2 WHERE id = $3', [nombre, descripcion, id]);
        if(result.rowCount === 0){
            return res.status(404).json({ errors: [{ msg: "Proveedor no encontrado." }] });
        }
        res.status(200).json({ message: "Proveedor actualizado." });
    } catch (error) {
        res.status(500).json({ errors: [{ msg: "Error al actualizar el proveedor." }], error: error.message});
    }
}
