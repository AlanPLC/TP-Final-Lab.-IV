import { useState, useEffect } from 'react';
import './styles/almacen.css'
import useAlmacen from '../../hooks/Almacen/useAlmacen.jsx';

function Almacen() {
  const {getAlmacen, postAlmacen, putAlmacen, deleteAlmacen, setError,error, loading} =useAlmacen()
  const [nombre, setNombre] = useState(" ")
  const [descripcion, setDescripcion] = useState("")
  const [categoria, setCategoria] = useState("")
  const [proveedor, setProveedor] = useState("")
  const [precio, setPrecio] = useState("")
  const [cantidad, setCantidad] = useState("")
  const [imagen, setImagen] = useState("")
  const [productoId, setProductoId] = useState(0)
  const[listaProductos, setListaProductos] = useState([])
  const [onEdit, setOnEdit] = useState(false)
  const [reload, setReload] = useState(false) 
    
    const mostrarProductos = async ()=>{
      try {
        const response = await getAlmacen();
        console.log('Data recibida:', response);
        
        setListaProductos(response.data.productosConDetalles);
      } catch (error) {
        console.error(error);
      }

    }

    
    useEffect(() => {
      mostrarProductos();
    }, [reload]);
     
    const agregarProducto = async (e) =>{
      e.preventDefault()
      
      const nuevoProducto = {
        id: productoId,
        nombre: nombre,
        descripcion: descripcion,
        categoria: categoria,
        proveedor: proveedor,
        precio: precio,
        cantidad: cantidad,
        imagen: imagen
      }
      const result = await postAlmacen(nuevoProducto)
      if(result.success){
          setReload(!reload)
          console.log("Errores:", error)
          console.log("Producto creado con éxito.", result.data)
          setError(null)
      } else{
          console.error("Error al crear el producto.", result.message)
      }
      
      
    }

    const modificarProducto = async(producto)=>{
      const nuevoProducto = {
          id: proveedor,
          nombre: nombre,
          descripcion: descripcion,
          categoria: categoria,
          proveedor: proveedor,
          precio: precio,
          cantidad: cantidad,
          imagen: imagen,
      }
      const result = await putAlmacen(nuevoProducto)
        if(result.success){
          setReload(!reload)
          console.log("Productos actualizado con éxito.", result.data)
          setNombre('')
          setDescripcion('')
          setCategoria('')
          setProveedor('')
          setPrecio('')
          setCantidad('')
          setImagen('')
          setOnEdit(false)
          setError(null)
        } else{
          console.error("Error al actualizar los Productos.", result.message)
          setNombre('')
          setDescripcion('')
          setCategoria('')
          setProveedor('')
          setPrecio('')
          setCantidad('')
          setImagen('')
          setOnEdit(false)
        
        }
    }

    
    
    const eliminarProducto = async (id) => {
        if (confirm(`¿Desea quitar el productO ${id}?`)) {
          const result = await deleteAlmacen(id)
          if (result.succes){
            console.log("producto eliminado")
            setReload(!reload)
          }else{
            console.error("eror al eliminar producto",result.message)
          }
        }
          if (response.ok) {
            setProducto(productos.filter((producto) => producto.id !== id));
          }
      }
        useEffect(() => {
          mostrarProductos();
        }, [reload]); 
      
        useEffect(() => {
          console.log("Lista actualizada: ", listaProductos); 
        }, [listaProductos]);
    
  return(
    <div className='almacen-container'>
      <h1 className='titulo'>Listado del almacen</h1><br />
      <div className='contenedor-listado'>
        {listaProductos && listaProductos.length > 0 ? (
            listaProductos.map(producto => (
            <div key={producto.producto_id}>
              <img src={producto.imagen_url} alt={producto.nombre} />
              <p>{`${producto.producto_id} - ${producto.producto_nombre} - ${producto.descripcion} - P: ${producto.categoria_nombre} - ${producto.cantidad_disponible}}U - ${producto.precio}$`}</p>
              <button className="modificar" onClick={() =>{ modificarProducto(producto)
                setProductoId(producto.producto_id);
                setNombre(producto.producto_nombre);
                setDescripcion(producto.descripcion);
                setCategoria(producto.categoria_id);
                setProveedor(producto.proveedor_id);
                setPrecio(producto.precio);
                setCantidad(producto.cantidad_disponible);
                setImagen(producto.imagen_url);
                setOnEdit(true);
                }}>Modificar</button>
                <button className="eliminar" onClick={() => eliminarProducto(producto.id)}>Eliminar</button>
              </div>
            ))
          ) : (
            <p>No hay productos disponibles.</p>
          )}
      </div>
          <div className='contenedor-entradas'>
                <form onSubmit={agregarProducto}>
                    <label >Nombre:</label>
                    <input  id="nombre" type="text"  value={nombre} onChange={(e) => setNombre(e.target.value)}/> 
                    <label>Descripcion:</label> 
                    <input id="descripcion" type="text" value={descripcion}
                    onChange={(e) => setDescripcion(e.target.value)}/> 
                    <label >Categoria:</label>
                    <input id="apellido" type="text" value={categoria}
                    onChange={(e) => setCategoria(e.target.value)}/> 
                    <label >Proveedor:</label>
                    <select name="select" id="select" onChange={(e) => setProveedor(e.target.value)} value={proveedor}>
                      {listaProductos.map((prov) => (
                        <option key={prov.id} value={prov.id}>
                          {prov.categoria_nombre}
                        </option>
                      ))}
                    </select> <br />
                    <label >Precio:</label><input   id="precio" type="number" value={precio}
                    onChange={(e) => setPrecio(parseFloat(e.target.value))} />
                    <label >Cantidad:</label><input maxLength="2"type="number" id="cantidad" value={cantidad}
                    onChange={(e) => setCantidad(parseFloat(e.target.value))}/>
                    <label >Imagen URL:</label><input maxLength={255} id="imagen" type="url" value={imagen}
                    onChange={(e) => setImagen(e.target.value)} />
                    <div className="contenedor-botones">
                        <button type="submit">Guardar</button>
                        <button onClick={() => {
                          setProductoId(null)
                          setNombre(""); 
                          setDescripcion("");
                          setCategoria("");
                          setProveedor("");
                          setPrecio("");
                          setCantidad("");
                          setImagen("")
                          setOnEdit(false)}}>Cancelar</button>
                        
                    </div>
              </form>
        </div>
    </div>
  )
};

  

export default Almacen;