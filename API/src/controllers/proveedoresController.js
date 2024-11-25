import { db } from '../../config/db.js';
export const getProveedoresConProductos = async(req,res)=>{
    try {
        const [proveedor] = await db.execute(
        `SELECT 
                proveedores.id AS proveedor_id,
                proveedores.nombre AS proveedor_nombre,
                proveedores.descripcion AS proveedor_descripcion,
                productos.id AS producto_id,
                productos.nombre AS producto_nombre
            FROM proveedores
            LEFT JOIN productos ON proveedores.id = productos.proveedor_id
            ORDER BY proveedores.id, productos.id`);

        res.status(200).json({ proveedor });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}

export const getProveedorByID = async(req,res)=>{
    const id = req.params.id
    try {
        const [proveedor] = await db.execute(
            'SELECT * FROM proveedores WHERE id =?',
            [id]);
        if (proveedor.length === 0) {
            return res.status(404).json({ errors: [{ msg: "Proveedor no encontrado." }] });
        }
        res.status(200).json(proveedor[0]);
    } catch (error) {
        res.status(500).json({ error: error.message });
        
    }
}

export const createProveedores = async(req, res)=>{
    const {nombre, descripcion} = req.body
    try {
        await db.execute(
        'INSERT INTO proveedores (nombre, descripcion) VALUES (?,?)',
        [nombre, descripcion]);
        res.status(201).json({ message: "Proveedor creado." });
    } catch (error) {
        res.status(500).json({ error: error.message });    
    }
}

export const deleteProveedor = async(req, res)=>{
    const id = req.params.id
    try {
        const [result] = await db.execute('DELETE FROM proveedores WHERE id =?', [id]);
        if(result.affectedRows === 0){
            return res.status(404).json({ errors: [{ msg: "Proveedor no encontrado." }] });
        }
        res.status(200).json({ message: "Proveedor eliminado." });
    } catch (error) {
        res.status(500).json({ error: error.message });    
    }
}

export const updateProveedor = async(req, res)=>{
    const id = req.params.id
    const {nombre, descripcion} = req.body
    try {
        const [result] = await db.execute('UPDATE proveedores SET nombre = ?, descripcion = ? WHERE id = ?', [nombre, descripcion, id]);
        if(result.affectedRows === 0){
            return res.status(404).json({ errors: [{ msg: "Proveedor no encontrado." }] });
        }
        res.status(200).json({ message: "Proveedor actualizado." });
    } catch (error) {
        res.status(500).json({ error: error.message });    
    }
}