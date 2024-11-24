import {db} from "../../config/db.js"


























// Obtener ventas por id

export const ventasById = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const id = req.params.id;
    const [ventas] = await db.execute("SELECT * FROM ventas WHERE id = ?", [id]);

    if (ventas.length === 0) {
      return res.status(404).json({ errors: [{ msg: "ventas no encontrado." }] });
    }

    res.status(200).json(ventas[0]);
  } catch (error) {
    res.status(500).json({ errors: [{ msg: "Error de servidor al obtener el ventas." }] });
  }
};

export const obtenerFechaActual = () => {
  const fechaActual = new Date();
  const año = fechaActual.getFullYear();
  const mes = String(fechaActual.getMonth() + 1).padStart(2, '0'); //le suma 1 porque enero es 0 lo convierte en cadena y completa con 0 hasta que tenga 2 digitos
  const dias = String(fechaActual.getDate()).padStart(2, '0');
  const hora = String(fechaActual.getHours()).padStart(2, '0');
  const minutos = String(fechaActual.getMinutes()).padStart(2, '0');

  return `${año}.${mes}.${dias} ${hora}:${minutos}:00`; 
}

// Crear ventas

export const createVentas = async (req,res ) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }
    
      try {
        const fecha = obtenerFechaActual()
        const {estado}  = req.body; 
        const usuario_id = req.body.user   
      
        const [result] = await db.execute("INSERT INTO `ventas` (`usuario_id`, `fecha_pedido`, `estado_pedido`) VALUES (?, ?, ?)", [usuario_id, fecha, estado]);
        
        res.status(201).json({ message: "venta creada.", result });
      } catch (error) {
        res.status(500).json({ errors: [{ msg: "Error de servidor al crear el ventas." }] });
      }
    
}

// Actualizar ventas

export const updateVentas = async (req,res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  try {
    const fecha = obtenerFechaActual()
    const estado  = req.body;
    const id  = req.params.id;
    
    const [result] = await db.execute("UPDATE ventas set fecha_pedido=?, estado_pedido=? where id=?", 
      [fecha, estado , id]);

    res.status(201).json({ message: "venta actualizada.", result });
  } catch (error) {
    res.status(500).json({ errors: [{ msg: "Error de servidor al crear el ventas." }] });
  }


}

//Eliminar ventas por id

export const deleteVentas = async (req,res) =>{
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({errors:errors.array()})
  }
  try{
  const id  = req.params.id;
  const [result] = await db.execute("DELETE FROM ventas WHERE ventas_id=?", [id])
  res.send({ result });
  }catch(error){
    res.status(500).json({errors:[{msg:"Error de servidor al eliminar el ventas. "}]})
  }
}