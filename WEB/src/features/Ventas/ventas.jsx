import './styles/ventas.css';
import { useState, useEffect } from "react";
import useVentas from "../../hooks/Ventas/useVentas.jsx";

const Productos = () => {
    const {ventas, error, loading} = useVentas()
    const [ventasList, setVentasList] = useState([])


    // Recibe el fetch del hook
    const fetchVentas = async()=>{
        try {
            const response = await ventas()
            console.log('Data recibida:', response);

            // Agrupar por venta_id y unificar productos
            const agrupadas = response.data.ventas.reduce((acc, venta) => {
                const existingVenta = acc.find(item => item.venta_id === venta.venta_id);
                if (existingVenta) {
                    // Si ya existe, añadir los detalles del producto
                    existingVenta.productos.push({
                        producto_id: venta.producto_id,
                        producto_nombre: venta.producto_nombre,
                        cantidad_producto: venta.cantidad_producto,
                        precio: venta.producto_precio
                    });
                } else {
                    // Si no existe, crear una nueva entrada
                    acc.push({
                        venta_id: venta.venta_id,
                        fecha: venta.fecha,
                        usuario: venta.usuario,
                        productos: [{
                            producto_id: venta.producto_id,
                            producto_nombre: venta.producto_nombre,
                            cantidad_producto: venta.cantidad_producto,
                            precio: venta.producto_precio
                        }],
                    });
                }
                return acc;
            }, []);

            setVentasList(agrupadas);
        } catch (error) {
            console.error("Error al obtener ventas.", error)
        }
    }

    useEffect(()=>{
        fetchVentas()
    },[]);
    
  return(
    <div className='ventas-main-container'>
        <h1 className='ventas-titulo'>Ventas</h1>
        <div className='lista-container'>
            <ul className='lista'>
                {ventasList.map((venta) => (
                    <li key={venta.venta_id} >
                        <div className='venta'>
                            <p>Venta ID: {venta.venta_id}</p>
                            <p>Fecha: {new Date(venta.fecha).toLocaleDateString()}</p>
                            <p>Usuario: {venta.usuario}</p>
                        </div>
                        <div>
                            <ul className='lista-productos'>
                                {venta.productos.map((producto, index) => (
                                    <li key={index} className='producto'>
                                        <p>#{producto.producto_id}</p>
                                        <p>{producto.producto_nombre}</p>
                                        <p>Cant.: {producto.cantidad_producto}</p>
                                        <p>${producto.precio}</p>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </li>
                ))}
            </ul>
        </div>
    </div>
  );
};

export default Productos;