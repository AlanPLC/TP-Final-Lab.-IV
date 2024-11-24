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
     
    const handleSubmit = async (e) =>{
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
          console.log("Proveedor creado con éxito.", result.data)
          setError(null)
      } else{
          console.error("Error al crear el proveedor.", result.message)
      }
      
      
    }

    const actualizarProducto = async()=>{
      const nuevoProducto = {
          id: proveedorID,
          nombre: nombre,
          descripcion: descripcion,
      }
      const result = await putAlmacen(nuevoProducto)
        if(result.success){
          setReload(!reload)
          console.log("Productos actualizado con éxito.", result.data)
          setNombre('')
          setDescripcion('')
          setOnEdit(false)
          setProveedorID(null)
          setError(null)
        } else{
          console.error("Error al actualizar los Productos.", result.message)
          setNombre('')
          setDescripcion('')
          setOnEdit(false)
          setProveedorID(null)
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
                        <button className="modificar" onClick={() => modificarProducto(producto)}>Modificar</button>
                        <button className="eliminar" onClick={() => eliminarProducto(producto.id)}>Eliminar</button>
                    </div>
                ))
            ) : (
                <p>No hay productos disponibles.</p>
            )}
        </div>
          <div className='contenedor-entradas'>
                <form onSubmit={handleSubmit}>
                    <label >Nombre:</label>
                    <input  id="nombre" type="text"  value={nombre}onChange={(e) => setNombre(parseFloat(e.target.value))}/> 
                    <label>Descripcion:</label> 
                    <input id="descripcion" type="text" value={descripcion}
                    onChange={(e) => setDescripcion(parseFloat(e.target.value))}/> 
                    <label >Categoria:</label>
                    <input id="apellido" type="text" value={categoria}
                    onChange={(e) => setCategoria(parseFloat(e.target.value))}/> 
                    <label >Proveedor:</label>
                    <input id="proveedor" type="text"value={proveedor}
                    onChange={(e) => setProveedor(parseFloat(e.target.value))} />
                    <label >Precio:</label><input   id="precio" type="number" value={precio}
                    onChange={(e) => setPrecio(parseFloat(e.target.value))} />
                    <label >Cantidad:</label><input maxLength="2"type="number" name="" id="cantidad" value={cantidad}
                    onChange={(e) => setCantidad(parseFloat(e.target.value))}/>
                    <label >Imagen URL:</label><input maxLength={255} id="imagen" type="url" value={imagen}
                    onChange={(e) => setImagen(parseFloat(e.target.value))} />
                    <div className="contenedor-botones">
                        <button onClick={()=> {modificarProducto(producto)}}>Guardar</button>
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