import '../../styles/dashboardPanels.css';
import './styles/productos.css';
import { useState, useEffect } from "react";
import useProductos from '../../hooks/Productos/useProductos.jsx';
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import { jwtDecode } from "jwt-decode";
import { getProductIcon } from '../../constants/productIcons.js';
import { Search, X, Plus, Minus, Loader2 } from 'lucide-react';
import SmoothHeight from '../../components/ui/SmoothHeight.jsx';
import Modal from '../../components/ui/Modal.jsx';

const Productos = () => {
  const { getProductosConDetalles, postVentas, error } = useProductos()
  const [listaProductos, setListaProductos] = useState([])
  // Arranca en true: al montar, todavía no se hizo ningún fetch.
  const [cargandoProductos, setCargandoProductos] = useState(true)
  const [productosVenta, setProductosVenta] = useState([])
  const [reload, setReload] = useState(false)
  const [todosLosProductos, setTodosLosProductos] = useState([])
  const [mostrarConfirmacion, setMostrarConfirmacion] = useState(false)
  // Mientras se espera la respuesta de la venta: loader en el botón y el
  // resto de la pantalla (agregar productos, editar cantidades, cancelar)
  // deshabilitado, para no permitir tocar nada hasta que termine.
  const [enviandoVenta, setEnviandoVenta] = useState(false)

  // Funcionalidad generar un PDF (ticket) con los datos de la venta realizada.
  // ventaId viene del id que devuelve el backend al crear la venta (mismo
  // criterio que un ticket real: el número de comprobante es el id de la
  // venta en la base, no algo armado del lado del cliente).
  const generarPDF = (productosVenta, ventaId) => {
    const doc = new jsPDF();
    const token = localStorage.getItem('token')
    const decoded = jwtDecode(token)
    const numeroTicket = String(ventaId).padStart(6, '0')

    // Título
    doc.setFontSize(18);
    doc.setFont("helvetica", "bold");
    doc.text("Minimarket Bitward", doc.internal.pageSize.getWidth() / 2, 20, {
      align: "center",
    });

    // Información de la venta
    doc.setFontSize(12);
    doc.setFont("helvetica", "normal");
    doc.text(`Ticket Nº: ${numeroTicket}`, 10, 30);
    doc.text(`Fecha: ${new Date().toLocaleString()}`, 10, 40);
    doc.text(`Vendedor: ${decoded.user}`, 10, 50);

    // Tabla con productos
    autoTable(doc, {
      startY: 60,
      head: [["Producto", "Cantidad", "Precio"]],
      body: productosVenta.map((prod) => [
        prod.producto_nombre,
        prod.cantidad,
        prod.precio,
      ]),
      styles: {
        head: { fillColor: [41, 128, 185], textColor: [255, 255, 255] },
        fontSize: 10,
        cellPadding: 4,
      },
      columnStyles: {
        0: { cellWidth: 70 },
        1: { halign: "center", cellWidth: 30 },
        2: { halign: "right", cellWidth: 40 },
      },
      theme: "grid",
    });

    // Total de la venta
    const total = productosVenta.reduce(
      (sum, prod) => sum + prod.cantidad * prod.precio,
      0
    );
    doc.text(`Total: $${total.toFixed(2)}`, 10, doc.previousAutoTable.finalY + 10);

    // Nombre de archivo único por ticket (número de venta + fecha), en vez
    // de un nombre estático que se pisaría entre tickets distintos.
    const fechaArchivo = new Date().toISOString().slice(0, 10);
    doc.save(`ticket_${numeroTicket}_${fechaArchivo}.pdf`);
  };

  // Traer la lista de productos
  const mostrarProductos = async()=>{
    setCargandoProductos(true)
    try {
      const response = await getProductosConDetalles()
      console.log("Data recibida: ", response)
      // Un producto sin precio todavía no está listo para venderse (se
      // cargó el producto pero falta ponerle precio de venta, ver
      // Almacen.jsx) - no tiene sentido mostrarlo acá.
      const conPrecio = response.data.productosConDetalles.filter((prod) => prod.precio != null)
      setListaProductos(conPrecio)
      setTodosLosProductos(conPrecio)
    } catch (error) {
      console.error(error);
    } finally {
      setCargandoProductos(false)
    }
  }
  // Llevar el producto a la lista de ventas. El botón ya queda deshabilitado
  // ("Agregado") mientras el producto esté en la boleta, ver el render de la
  // grilla más abajo - no hace falta volver a chequearlo acá.
  const agregarProducto = (prod) => {
    setProductosVenta([...productosVenta, { ...prod, cantidad: 1 }])
  }
  // Disparador de la venta y sus funciones.
  const confirmarVenta = async()=>{
    // Creo el body que va al fetch
    const productosBody = productosVenta.map((producto)=>{
      return {
        producto_id: producto.producto_id,
        cantidad_producto: producto.cantidad
      }
    })
    console.log("Cuerpo generado:", productosBody);
    // El backend crea la venta y descuenta el stock (por lotes, FIFO) en la
    // misma operación - si no hay stock suficiente la venta se rechaza
    // entera y no se genera el ticket.
    const response = await postVentas(productosBody)
    if(response.success){
      console.log("Venta creada con éxito.", response.data)
      generarPDF(productosVenta, response.data.id)
      setProductosVenta([])
      setReload(!reload)
    } else {
      console.error("Error al confirmar la venta.", response.message || response.errors)
    }
  }

  // El botón "Realizar Venta" solo abre la confirmación (evita ventas por
  // missclick); confirmarVenta() recién se dispara al aceptar el modal. El
  // modal se mantiene abierto (con loader) hasta que la petición termina.
  const handleConfirmarVenta = async () => {
    setEnviandoVenta(true)
    await confirmarVenta()
    setEnviandoVenta(false)
    setMostrarConfirmacion(false)
  }


  // Boton eliminar producto de la lista de ventas.
  const handleEliminar = (id) => {
    setProductosVenta((prevProductos) =>
      prevProductos.filter((prod) => prod.producto_id !== id)
    );
  };

  // Botones Incrementar/Decrementar cantidad de productos.
  const incrementarCantidad = (id) => {
    setProductosVenta((prevProductos) =>
      prevProductos.map((prod) =>
        prod.producto_id === id
          ? { ...prod, cantidad: prod.cantidad + 1 }
          : prod
      )
    );
  };
  const decrementarCantidad = (id) => {
    setProductosVenta((prevProductos) =>
      prevProductos.map((prod) =>
        prod.producto_id === id && prod.cantidad > 1
          ? { ...prod, cantidad: prod.cantidad - 1 }
          : prod
      )
    );
  };
  // Buscador de productos.
  const buscador = (nombre) => {
    if (nombre === "") {
      setListaProductos(todosLosProductos);
    } else {
      setListaProductos(
        todosLosProductos.filter((prod) => prod.producto_nombre.toLowerCase().includes(nombre.toLowerCase()))
      );
    }
  }
  // Cargar los productos cuando se carga la página o cuando la lista sufre algún cambio.
  useEffect(() => {
    mostrarProductos()
  }, [reload]);

  const totalVenta = productosVenta.reduce((acc, curr) => acc + curr.precio*curr.cantidad, 0)

  return(
    <div className='productos-main-container'>
      <div className="panel-card productos-panel">
        <div className='productos-lista-section'>
            <div className='productos-lista-head'>
              <h1 className="panel-heading">Productos</h1>
              <div className="productos-search">
                <Search size={16} />
                <input type="text" className="panel-search" placeholder="Buscar producto..." onChange={(e)=>buscador(e.target.value)} disabled={enviandoVenta}/>
              </div>
            </div>
            {cargandoProductos ? (
              <div className="panel-loading-container">
                <p className="panel-loading">
                  <Loader2 size={16} className="panel-spinner" />
                  Cargando productos...
                </p>
              </div>
            ) : (
            <ul className="productos-grid">
              {listaProductos.length > 0 ? (
                listaProductos.map((prod)=>{
                const ProductoIcon = getProductIcon(prod.imagen_url)
                const yaEnCarrito = productosVenta.some(p => p.producto_id === prod.producto_id)
                return (
                <li key={prod.producto_id}>
                  <div className='img-container'>
                    <ProductoIcon size={56} strokeWidth={1.5} className='imagen' aria-hidden="true"/>
                  </div>
                  <div className='p-container'>
                    <p className='P1' title={prod.producto_nombre}>{prod.producto_nombre}</p>
                    <p className='P2'>{prod.categoria_nombre}</p>
                    <p className='P3' title={prod.descripcion}>{prod.descripcion}</p>
                    <p className='P4'>${prod.precio}</p>
                  </div>
                  {prod.cantidad_disponible <= 0 ? (
                    <button className='boton-sin-stock' disabled>SIN STOCK</button>
                  ) : yaEnCarrito ? (
                    <button className='boton-deshabilitado' disabled>AGREGADO</button>
                  ) : (
                    <button onClick={()=> agregarProducto(prod)} disabled={enviandoVenta}>AGREGAR</button>
                  )}
                </li>
              )})
              ) : (
                <p className="panel-empty">No hay productos disponibles.</p>
              )}
            </ul>
            )}
        </div>
        <div className='productos-venta-section'>
          <h2 className="panel-heading">Boleta de Precio</h2>
          <div className='productos-venta'>
              <div className='productos-venta-lista'>
              <SmoothHeight>
              {productosVenta.length > 0 && (
              <>
              <h3>Productos</h3>
              <ul>
                {productosVenta.map((prod,index)=>(
                  <li key={index}>
                    <div className='item-container'>
                      {/* Primera fila producto */}
                      <div className='d1'>
                        <p>{prod.producto_nombre}</p>
                        <button type="button" className="quitar-item" onClick={()=>handleEliminar(prod.producto_id)} disabled={enviandoVenta}>
                          <X size={16} />
                        </button>
                      </div>
                      {/* Segunda fila producto */}
                      <div className='d2'>
                        <p>${prod.precio*prod.cantidad}</p>
                        <button
                          type="button"
                          className="b1"
                          onClick={()=>decrementarCantidad(prod.producto_id)}
                          disabled={prod.cantidad <= 1 || enviandoVenta}>
                          <Minus size={15} />
                        </button>
                        <input type="number" name="cantidad" id="cantidad" placeholder='Cant.' value={prod.cantidad} readOnly/>
                        <button
                          type="button"
                          className="b2"
                          onClick={()=>incrementarCantidad(prod.producto_id)}
                          disabled={prod.cantidad >= prod.cantidad_disponible || enviandoVenta}>
                          <Plus size={15} />
                        </button>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
              </>
              )}
              </SmoothHeight>
              </div>
              <div className='productos-venta-resumen'>
              <hr />
              <p className='tp1'>Total</p>
              <p className='tp2'>${totalVenta}</p>
              <button
                className='panel-button panel-button-primary venta-button'
                onClick={()=> setMostrarConfirmacion(true)}
                disabled={productosVenta.length == 0}>Realizar Venta</button>
              <SmoothHeight>
              {Array.isArray(error) && error.length > 0 && (
                <div className='panel-error-list venta-errores'>
                  {error.map((err, index) => (
                    <p key={index}>{err.msg}</p>
                  ))}
                </div>
              )}
              </SmoothHeight>
              </div>
          </div>
        </div>
      </div>
      {mostrarConfirmacion && (
        <Modal title="Confirmar venta" onClose={() => !enviandoVenta && setMostrarConfirmacion(false)}>
          <p className="confirmar-venta-texto">
            Vas a registrar la venta de {productosVenta.length} producto{productosVenta.length === 1 ? '' : 's'} por un total de <strong>${totalVenta}</strong>.
          </p>
          <div className="confirmar-venta-acciones">
            <button type="button" className="panel-button panel-button-secondary" onClick={() => setMostrarConfirmacion(false)} disabled={enviandoVenta}>
              Cancelar
            </button>
            <button type="button" className="panel-button panel-button-primary" onClick={handleConfirmarVenta} disabled={enviandoVenta}>
              {enviandoVenta ? <Loader2 size={16} className="panel-spinner" /> : 'Confirmar venta'}
            </button>
          </div>
        </Modal>
      )}
    </div>
  );
};

export default Productos;
