import './styles/productos.css';
import { useState, useEffect } from "react";
import useProductos from '../../hooks/Productos/useProductos.jsx';
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import { jwtDecode } from "jwt-decode";

const Productos = () => {
  const { getProductosConDetalles, postVentas, controlStock, error, loading} = useProductos()
  const [listaProductos, setListaProductos] = useState([])
  const [productosVenta, setProductosVenta] = useState([])
  const [reload, setReload] = useState(false)
  
  // Funcionalidad generar un PDF (ticket) con los datos de la venta realizada.
  const generarPDF = (productosVenta) => {
    const doc = new jsPDF();
    const token = localStorage.getItem('token')
    const decoded = jwtDecode(token)
  
    // Título
    doc.setFontSize(18);
    doc.setFont("helvetica", "bold");
    doc.text("Minimarket Bitward", doc.internal.pageSize.getWidth() / 2, 20, {
      align: "center",
    });
  
    // Información de la venta 
    doc.setFontSize(12);
    doc.setFont("helvetica", "normal");
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
  
    // Guardar el PDF
    doc.save("ticket_venta.pdf");
  };
  
  // Traer la lista de productos
  const mostrarProductos = async()=>{
    try {
      const response = await getProductosConDetalles()
      console.log("Data recibida: ", response)
      setListaProductos(response.data.productosConDetalles)
    } catch (error) {
      console.error(error);
    }
  }
  // Llevar el producto a la lista de ventas
  const agregarProducto = (prod) => {
    const prodExiste = productosVenta.some(p => p.producto_id === prod.producto_id)
    if(prodExiste) {
      alert("Este producto ya está en la lista de ventas.")
      return
    }
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
    try {
      // Creo la venta según la lista de productos cargados.
      const response1 = await postVentas(productosBody)
      if(response1.success){
        console.log("Venta creada con éxito.", response1.data)
      }
      
      // Actualizo el stock de los productos vendidos.
      for (const producto of productosVenta){
        const actualizarStock = {
          producto_id: producto.producto_id,
          cantidad_disponible: producto.cantidad_disponible - producto.cantidad
        }
        console.log("Stock a actualizar:", actualizarStock)
        const response2 = await controlStock(actualizarStock)
        if(response2.success){
          console.log("Stock actualizado con éxito.", response2.data)
        }
      }
      
      // Genero el PDF con los datos de la venta.
      generarPDF(productosVenta)
      
      setProductosVenta([])
      setReload(!reload)
    } catch (error) {
      console.error(error);
    }
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

  // Cargar los productos cuando se carga la página o cuando la lista sufre algún cambio.
  useEffect(() => {
    mostrarProductos()
  }, [reload]);

  return(
    <div className='productos-main-container'>
        <div className='productos-lista-container'>
            <h1>Productos</h1>
            <ul>
              {listaProductos.map((prod)=>(
                <li key={prod.producto_id}>
                  <div className='img-container'>
                    <img src={prod.imagen_url} alt="imagen" className='imagen'/>
                  </div>
                  <div className='p-container'>
                    <p className='P1'>{prod.producto_nombre}</p>
                    <p className='P2'>{prod.categoria_nombre}</p>
                    <p className='P3'>{prod.descripcion}</p>
                    <p className='P4'>${prod.precio}</p>
                  </div>
                  {prod.cantidad_disponible <= 0 ? 
                    (<button className='boton-deshabilitado'>SIN STOCK</button>) : 
                    (<button onClick={()=> agregarProducto(prod)}>AGREGAR</button>)}
                </li>
              ))}              
            </ul>
        </div>
        <div className='productos-venta-container'>
          <h2>Boleta de Precio</h2>
          <div className='productos-venta'>
              <h3>Productos</h3>
              <ul>
                {productosVenta.map((prod,index)=>(
                  <li key={index}>
                    <div className='item-container'>
                      {/* Primera fila producto */}
                      <div className='d1'>
                        <p>{prod.producto_nombre}</p>
                        <img src="/delete.png" alt="X" onClick={()=>handleEliminar(prod.producto_id)}/>
                      </div>
                      {/* Segunda fila producto */}
                      <div className='d2'>   
                        <p>${prod.precio*prod.cantidad}</p>
                        <button
                          className="b1" 
                          onClick={()=>decrementarCantidad(prod.producto_id)}
                          disabled={prod.cantidad <= 1}/>
                        <input type="number" name="cantidad" id="cantidad" placeholder='Cant.' value={prod.cantidad} readOnly/>
                        <button 
                          className="b2" 
                          onClick={()=>incrementarCantidad(prod.producto_id)}
                          disabled={prod.cantidad >= prod.cantidad_disponible}/>
                      </div>
                    </div>
                    <hr />
                  </li>
                ))}
              </ul>
              {/* <button onClick={()=>console.log("Productos a vender: ",productosVenta)}>Lista</button> */}
              <hr />
              <p className='tp1'>Total</p>
              <p className='tp2'>${productosVenta.reduce((acc, curr) => acc + curr.precio*curr.cantidad, 0)}</p>
              <hr />
              <button 
                className='venta-button' 
                onClick={()=> confirmarVenta()}
                disabled={productosVenta.length == 0}>Realizar Venta</button>
          </div>
        </div>
    </div>
  );
};

export default Productos;