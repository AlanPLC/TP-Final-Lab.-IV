import {db} from "../../config/db.js"
import { validationResult } from "express-validator";




// Obtener ventas por id

export const ventasById = async (req, res) => {
  const id  = req.params.id; 
  const [ventas] = await db.execute("select * from Ventas where ventas_id = ?", id);
  
  if (ventas.length === 0) {
      return res.status(404).send({ message: "Venta no encontrado" });
  }
  
  res.send({ ventas });
};


// Crear ventas

export const createVentas = async (req,res ) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }
    
      try {
        const fechaActual= new Date()
        const hora = fechaActual.getHours()
        const minutos = fechaActual.getMinutes()
        const año = fechaActual.getFullYear()
        const mes = String(fechaActual.getMonth()+1).padStart(2,'0') //le suma 1 porque enero es 0 lo convierte en cadena y completa con 0 hasta que tenga 2 digitos
        const dias =String(fechaActual.getDate()).padStart(2,'0')

        const fecha = `${dias}.${mes}.${año}-${hora}:${minutos}hs`
        const estado  = req.body;
      
        const [result] = await db.execute("INSERT INTO ventas (`fecha_pedido`, `estado_pedido`) VALUES (?, ?)", [fecha, estado]);
    
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
    const id  = req.params.id;
    const {fecha, estado } = req.body;
    const [result] = await db.execute("UPDATE ventas set fecha_pedido=?, estado_pedido=? where ventas_id=?", 
      [fecha.getTime(), estado = "En proceso", id]);

    res.status(201).json({ message: "venta creada.", result });
  } catch (error) {
    res.status(500).json({ errors: [{ msg: "Error de servidor al crear el usuario." }] });
  }


}

//Eliminar ventas por id

export const deleteVentas = async (req,res) =>{
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({errors:errors.array()})
  }
  const id  = req.params.id;
  const {fecha, estado}=req.body;
  const [result] = await db.execute("DELETE FROM ventas WHERE ventas_id=?", [id])
  res.send({ result });
}