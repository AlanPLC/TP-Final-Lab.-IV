import '../../styles/dashboardPanels.css';
import './styles/ventas.css';
import { useState, useEffect } from "react";
import useVentas from "../../hooks/Ventas/useVentas.jsx";
import { Loader2, Calendar, Clock, ArrowUpDown } from 'lucide-react';
import SmoothWidth from '../../components/ui/SmoothWidth.jsx';
import VentaDetalleModal from './VentaDetalleModal.jsx';
import FiltroFechaModal from './FiltroFechaModal.jsx';

// Cuántos productos se listan en la tarjeta antes de resumirlos en "+N más"
// (ver detalle completo en VentaDetalleModal, al hacer click en la tarjeta).
const PRODUCTOS_VISIBLES_EN_TARJETA = 2;

const FILTROS_FECHA = [
    { key: 'todos', label: 'Todos', dias: null },
    { key: '7', label: '7 días', dias: 7 },
    { key: '30', label: '1 mes', dias: 30 },
    { key: '90', label: '3 meses', dias: 90 },
];

// "YYYY-MM-DD" -> "DD/MM", para el chip del rango custom en el botón del
// calendario (no entra el año en el espacio disponible).
function fechaCorta(iso) {
    const [, mes, dia] = iso.split('-')
    return `${dia}/${mes}`
}

const Ventas = () => {
    const {ventas} = useVentas()
    // todasLasVentas: lo que devuelve el backend, agrupado y sin filtrar -
    // ventasList es la vista filtrada/ordenada (ver useEffect más abajo).
    const [todasLasVentas, setTodasLasVentas] = useState([])
    const [ventasList, setVentasList] = useState([])
    // 'todos' | '7' | '30' | '90' | 'custom' (rango elegido a mano, ver
    // rangoPersonalizado y FiltroFechaModal).
    const [filtroFecha, setFiltroFecha] = useState('todos')
    const [rangoPersonalizado, setRangoPersonalizado] = useState({ desde: '', hasta: '' })
    const [mostrarFiltroFecha, setMostrarFiltroFecha] = useState(false)
    // true = más viejo primero: el orden por default (false) es más nuevo
    // primero, igual que el orden que ya trae el backend por id descendente.
    const [ordenAscendente, setOrdenAscendente] = useState(false)
    // Arranca en true: al montar, todavía no se hizo ningún fetch.
    const [cargandoVentas, setCargandoVentas] = useState(true)
    // Venta cuyo modal de detalle está abierto (null = ninguno).
    const [ventaSeleccionada, setVentaSeleccionada] = useState(null)

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

            setTodasLasVentas(agrupadas);
        } catch (error) {
            console.error("Error al obtener ventas.", error)
        } finally {
            setCargandoVentas(false)
        }
    }

    useEffect(()=>{
        fetchVentas()
    },[]);

    // Filtro de fecha + orden - se recalcula cada vez que cambia alguno de
    // los dos, o llega una lista nueva de ventas.
    useEffect(() => {
        let filtradas = todasLasVentas

        if (filtroFecha === 'custom') {
            if (rangoPersonalizado.desde) {
                const desde = new Date(`${rangoPersonalizado.desde}T00:00:00`).getTime()
                filtradas = filtradas.filter((venta) => new Date(venta.fecha).getTime() >= desde)
            }
            if (rangoPersonalizado.hasta) {
                // Hasta las 23:59:59 de ese día, para que incluya ventas de esa
                // misma fecha (si no, "hasta hoy" excluiría las de hoy mismo).
                const hasta = new Date(`${rangoPersonalizado.hasta}T23:59:59`).getTime()
                filtradas = filtradas.filter((venta) => new Date(venta.fecha).getTime() <= hasta)
            }
        } else {
            const filtro = FILTROS_FECHA.find((f) => f.key === filtroFecha)
            if (filtro?.dias != null) {
                const limite = Date.now() - filtro.dias * 24 * 60 * 60 * 1000
                filtradas = filtradas.filter((venta) => new Date(venta.fecha).getTime() >= limite)
            }
        }

        const ordenadas = [...filtradas].sort((a, b) => {
            const diff = new Date(a.fecha) - new Date(b.fecha)
            return ordenAscendente ? diff : -diff
        })
        setVentasList(ordenadas)
    }, [todasLasVentas, filtroFecha, rangoPersonalizado, ordenAscendente]);

    const elegirFiltroPreset = (key) => {
        setFiltroFecha(key)
        setRangoPersonalizado({ desde: '', hasta: '' })
    }

    const aplicarRangoPersonalizado = (rango) => {
        if (!rango.desde && !rango.hasta) {
            setFiltroFecha('todos')
        } else {
            setFiltroFecha('custom')
        }
        setRangoPersonalizado(rango)
    }

  return(
    <div className='ventas-main-container'>
        <div className="panel-card ventas-panel">
        <div className='ventas-list-section'>
        <div className="ventas-list-head">
            <h1 className="panel-heading">Historial de Ventas</h1>
            <div className="ventas-filtros-bar">
                {FILTROS_FECHA.map((f) => (
                    <button
                        key={f.key}
                        type="button"
                        className={filtroFecha === f.key ? 'active' : ''}
                        onClick={() => elegirFiltroPreset(f.key)}
                    >
                        {f.label}
                    </button>
                ))}
                <button
                    type="button"
                    className={filtroFecha === 'custom' ? 'active' : ''}
                    onClick={() => setMostrarFiltroFecha(true)}
                    title="Elegir rango de fechas"
                >
                    <Calendar size={16} />
                    {filtroFecha === 'custom' && (
                        <SmoothWidth>
                            <span className="ventas-calendario-rango">
                                {rangoPersonalizado.desde ? fechaCorta(rangoPersonalizado.desde) : '…'}
                                {' - '}
                                {rangoPersonalizado.hasta ? fechaCorta(rangoPersonalizado.hasta) : '…'}
                            </span>
                        </SmoothWidth>
                    )}
                </button>
                <button
                    type="button"
                    onClick={() => setOrdenAscendente((v) => !v)}
                >
                    <ArrowUpDown size={14} />
                    <SmoothWidth>{ordenAscendente ? 'Más viejo primero' : 'Más nuevo primero'}</SmoothWidth>
                </button>
            </div>
        </div>
        <div className="ventas-scroll">
            {cargandoVentas ? (
            <div className="panel-loading-container">
                <p className="panel-loading">
                    <Loader2 size={16} className="panel-spinner" />
                    Cargando ventas...
                </p>
            </div>
            ) : ventasList.length > 0 ? (
            <ul className='lista'>
                {ventasList.map((venta) => {
                    const fecha = new Date(venta.fecha)
                    const productosOcultos = venta.productos.length - PRODUCTOS_VISIBLES_EN_TARJETA
                    return (
                    <li
                        className='venta-item'
                        key={venta.venta_id}
                        onClick={() => setVentaSeleccionada(venta)}
                        role="button"
                        tabIndex={0}
                        onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') setVentaSeleccionada(venta) }}
                    >
                        <div className='venta'>
                            <div className="venta-fecha-hora">
                                <div className="venta-fecha-hora-row">
                                    <p className='p1'>
                                        <Calendar size={13} />
                                        {fecha.toLocaleDateString()}
                                    </p>
                                    <p className='p1'>
                                        <Clock size={13} />
                                        {fecha.toLocaleTimeString()}
                                    </p>
                                </div>
                                <p className='p2'>{venta.usuario}</p>
                            </div>
                            <div className="venta-total">
                                <p className='p4'>Total</p>
                                <p className='p5'>${venta.precio_total}</p>
                            </div>
                        </div>
                        <ul className='lista-productos'>
                            {venta.productos.slice(0, PRODUCTOS_VISIBLES_EN_TARJETA).map((producto, index) => (
                                <li key={index} className='producto'>
                                    <span className="producto-nombre">{producto.producto_nombre}</span>
                                    <span>Cant.: {producto.cantidad_producto}</span>
                                    <span>${producto.precio_unitario} c/u</span>
                                </li>
                            ))}
                        </ul>
                        {productosOcultos > 0 && (
                            <p className="venta-mas-productos">+{productosOcultos} producto{productosOcultos === 1 ? '' : 's'} más</p>
                        )}
                    </li>
                )})}
            </ul>
            ) : (
                <p className="panel-empty">
                    {filtroFecha === 'todos' ? 'Todavía no hay ventas registradas.' : 'No hay ventas registradas en ese período.'}
                </p>
            )}
        </div>
        </div>
        </div>
        {ventaSeleccionada && (
            <VentaDetalleModal
                venta={ventaSeleccionada}
                onClose={() => setVentaSeleccionada(null)}
            />
        )}
        {mostrarFiltroFecha && (
            <FiltroFechaModal
                desde={rangoPersonalizado.desde}
                hasta={rangoPersonalizado.hasta}
                onAplicar={aplicarRangoPersonalizado}
                onClose={() => setMostrarFiltroFecha(false)}
            />
        )}
    </div>
  );
};

export default Ventas;
