import '../../styles/dashboardPanels.css';
import './styles/ventas.css';
import { useState, useEffect } from "react";
import useVentas from "../../hooks/Ventas/useVentas.jsx";
import { Loader2 } from 'lucide-react';

const Ventas = () => {
    const {ventas} = useVentas()
    const [ventasList, setVentasList] = useState([])
    // Arranca en true: al montar, todavía no se hizo ningún fetch.
    const [cargandoVentas, setCargandoVentas] = useState(true)

    // Recibe el fetch del hook
    const fetchVentas = async()=>{
        setCargandoVentas(true)
        try {
            const response = await ventas()
            console.log('Data recibida:', response);

            // Agrupar por venta_id y unificar productos
            const agrupadas = response.data.ventas.reduce((acc, venta) => {
                const existingVenta = acc.find(item => item.venta_id === venta.venta_id);

                // Precio unitario del producto
                const precioUnitario = Number(venta.producto_precio);

                // Precio total del producto ajustado por cantidad
                const precioTotalProducto = precioUnitario * Number(venta.cantidad_producto);

                if (existingVenta) {
                    // Si ya existe, añadir los detalles del producto
                    existingVenta.productos.push({
                        producto_id: venta.producto_id,
                        producto_nombre: venta.producto_nombre,
                        cantidad_producto: venta.cantidad_producto,
                        precio_unitario: precioUnitario,
                        precio_total_producto: precioTotalProducto
                    });
                    existingVenta.precio_total += precioTotalProducto; // Sumar al precio total general
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
                            precio_unitario: precioUnitario,
                            precio_total_producto: precioTotalProducto
                        }],
                        precio_total: precioTotalProducto // Establecer el precio total inicial
                    });
                }

                return acc;
            }, []);

            setVentasList(agrupadas);
        } catch (error) {
            console.error("Error al obtener ventas.", error)
        } finally {
            setCargandoVentas(false)
        }
    }

    useEffect(()=>{
        fetchVentas()
    },[]);

  return(
    <div className='ventas-main-container'>
        <div className="panel-card ventas-panel">
        <div className='ventas-list-section'>
        <h1 className="panel-heading">Historial de Ventas</h1>
            {cargandoVentas ? (
            <div className="panel-loading-container">
                <p className="panel-loading">
                    <Loader2 size={16} className="panel-spinner" />
                    Cargando ventas...
                </p>
            </div>
            ) : ventasList.length > 0 ? (
            <ul className='lista'>
                {ventasList.map((venta) => (
                    <li className='venta-item' key={venta.venta_id} >
                        <div className='venta'>
                            <div>
                                <p className='p1'>{new Date(venta.fecha).toLocaleString()}</p>
                                <p className='p2'>{venta.usuario}</p>
                            </div>
                            <div className="venta-total">
                                <p className='p4'>Total</p>
                                <p className='p5'>${venta.precio_total}</p>
                            </div>
                        </div>
                        <ul className='lista-productos'>
                            {venta.productos.map((producto, index) => (
                                <li key={index} className='producto'>
                                    <span className="producto-nombre">{producto.producto_nombre}</span>
                                    <span>Cant.: {producto.cantidad_producto}</span>
                                    <span>${producto.precio_unitario} c/u</span>
                                </li>
                            ))}
                        </ul>
                    </li>
                ))}
            </ul>
            ) : (
                <p className="panel-empty">Todavía no hay ventas registradas.</p>
            )}
        </div>
        </div>
    </div>
  );
};

export default Ventas;
