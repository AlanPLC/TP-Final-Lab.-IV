import './styles/productos.css';
import { useState, useEffect } from "react";
import useProductos from '../../hooks/Productos/useProductos.jsx';

const Productos = () => {
  const { getProductosConDetalles, error, loading} = useProductos()
  const [listaProductos, setListaProductos] = useState([])

  const mostrarProductos = async()=>{
    try {
      const response = await getProductosConDetalles()
      console.log("Data recibida: ", response)
      setListaProductos(response.data.productosConDetalles)
    } catch (error) {
      console.error(error);
    }
  }

  useEffect(() => {
    mostrarProductos()
  }, []);

  return(
    <div className='productos-main-container'>
        <div className='productos-lista-container'>
            <h1>Productos</h1>
            <ul>
              {listaProductos.map((prod)=>(
                <li key={prod.producto_id}>
                  <div className='img-container'>
                    <img src="/coca.jpeg" alt="imagen" className='imagen'/>
                  </div>
                  <div className='p-container'>
                    <p className='P1'>{prod.producto_nombre}</p>
                    <p className='P2'>{prod.categoria_nombre}</p>
                    <p className='P3'>{prod.descripcion}</p>
                    <p className='P4'>${prod.precio}</p>
                  </div>
                  <button>AGREGAR</button>
                </li>
              ))}              
            </ul>
        </div>
        <div className='productos-venta-container'>
          <h1>Boleta de Precio</h1>
        </div>
    </div>
  );
};

export default Productos;