import './styles/ventas.css';
import { useState, useEffect } from "react";
import useVentas from "../../hooks/Ventas/useVentas.jsx";

const Ventas = () => {
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
                const precioProducto = Number(venta.producto_precio);
                if (existingVenta) {
                    // Si ya existe, añadir los detalles del producto
                    existingVenta.productos.push({
                        producto_id: venta.producto_id,
                        producto_nombre: venta.producto_nombre,
                        cantidad_producto: venta.cantidad_producto,
                        precio: precioProducto
                    });
                    existingVenta.precio_total += precioProducto;
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
                            precio: precioProducto
                        }],
                        precio_total: precioProducto
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
                    <li className='li-main' key={venta.venta_id} >
                        <div className='venta'>
                            <p className='p1'>#{venta.venta_id}</p>
                            <p className='p2'>{new Date(venta.fecha).toLocaleDateString()}</p>
                            <p className='p3'>{venta.usuario}</p>
                            <div>
                                <p className='p4'>Total</p>
                                <p className='p5'>${venta.precio_total}</p>
                            </div>
                        </div>
                        <div>
                            <ul className='lista-productos'>
                                {venta.productos.map((producto, index) => (
                                    <li key={index} className='producto'>
                                        <p className='p-id'>ID #{producto.producto_id}</p>
                                        <hr />
                                        <p>{producto.producto_nombre}</p>
                                        <hr />
                                        <p>Cant.: {producto.cantidad_producto}</p>
                                        <hr />
                                        <p>${producto.precio} c/u</p>   
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

export default Ventas;