import {db} from "../../config/db.js"


// Obtener todas las ventaDetallada
export const getAllVentaDetallada= async(req, res) => {
    try{
      const [ventaDetallada] = await db.execute("select * from ventaDetallada");
      res.status(ventaDetallada)
    }catch(error){
      res.status(500).json({errors:[{msg:"error al obtener ventaDetallada"}]})
    }
  };
// Obtener ventaDetallada por id
export const ventasDetalladaById = async (req, res) => {
  const errors = validationResult(req)
  if (!errors.isEmpty){
    return res.status(400).json({ errors: errors.array() });
  }
  try{
    const id  = req.params.id; 
    const [ventaDetalle] = await db.execute("select * from VentaDetallada where detalle_id = ?", id);
    
    if (ventaDetalle.length === 0) {
        return res.status(404).send({ message: "detalle de venta no encontrado" });
    }
    res.status(200).json(ventaDetalle[0])
  }catch(error){
    res.status(500).json({errors:[{msg:"error al obtener id ventaDetallada"}]})
  }
  
};

// Crear ventaDetallada
export const createVentaDetallada = async (req,res ) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
  
    try {
      const {cantidad, precioUnitario } = req.body;
      const [result] = await db.execute("INSERT INTO ventaDetallada (cantidad_producto, precio_unitario) VALUES (?, ?)", [cantidad, precioUnitario]);
  
      res.status(201).json({ message: "detalle de venta creado.", result });
    } catch (error) {
      res.status(500).json({ errors: [{ msg: "Error de servidor al crear detalle de venta." }] });
    }
  
}

// Actualizar ventaDetallada por id
export const updateVentaDetallada = async (req,res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  try {
    const id  = req.params.id;
    const {cantidad, precioUnitario } = req.body;
    const [result] = await db.execute("UPDATE ventaDetallada set cantidad_producto=?, precio_unitario=? where detalle_id=?", 
      [cantidad, precioUnitario, id]);
    
    if (result.affectedRows ===0){
      res.status(404).json({mesagge:"ventaDetallada no encontrada"})
    }

    res.status(201).json({ message: "detalle de venta creado.", result });
  } catch (error) {
    res.status(500).json({ errors: [{ msg: "Error de servidor al crear detalle de venta." }] });
  }


}

//Eliminar ventaDetallada por id
export const deleteVentaDetallada = async (req,res) =>{
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({errors:errors.array()})
  }
  try{
  const id  = req.params.id;
  const [result] = await db.execute("DELETE FROM ventaDetallada WHERE detalle_id=?", [id])
  if (result.affectedRows === 0) {
    return res.status(404).json({ errors: [{ msg: "Usuario no encontrado." }] });
  }
  res.status(200).json({mesagge: "ventaDetallada eliminada"})

  }catch (error){
    res.status(500).json({errors:[{msg:"error del servidor al eliminar la ventaDetallada"}]})
  }
  res.send({ result });
}