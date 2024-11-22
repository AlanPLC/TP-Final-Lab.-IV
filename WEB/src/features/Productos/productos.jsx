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
        <div className='lista-productos'>
            <h1 className='productos-titulo'>Productos</h1>
            <ul className='lista'>
              {listaProductos.map((prod)=>(
                <li key={prod.producto_id}>
                  <p>ID #{prod.producto_id}</p>
                  {/* <img src={prod.imagen_url} alt="imagen" /> */}
                  <p>{prod.producto_nombre}</p>
                  <p>Categoría: {prod.categoria_nombre}</p>
                  <p>Descripción: {prod.descripcion}</p>
                  <p>${prod.precio}</p>
                </li>
              ))}              
            </ul>
        </div>
    </div>
  );
};

export default Productos;