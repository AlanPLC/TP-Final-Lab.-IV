import { useState, useEffect } from 'react';
import './styles/almacen.css'
import useAlmacen from '../../hooks/Almacen/useAlmacen.jsx';

function Almacen() {
  const {getAlmacen, getCategorias, getProveedores, postAlmacen, putAlmacen, deleteAlmacen, setError,error, loading} =useAlmacen()
  const [nombre, setNombre] = useState("")
  const [descripcion, setDescripcion] = useState("")
  const [categoria, setCategoria] = useState("")
  const [proveedor, setProveedor] = useState("")
  const [precio, setPrecio] = useState("")
  const [cantidad, setCantidad] = useState("")
  const [imagen, setImagen] = useState("")
  const [productoId, setProductoId] = useState(0)
  const [listaProductos, setListaProductos] = useState([])
  const [onEdit, setOnEdit] = useState(false)
  const [reload, setReload] = useState(false)
  const [listaCategorias, setListaCategorias] = useState([]) 
  const[listaProveedores, setListaProveedores] = useState([])
  const [isDisabled, setIsDisabled] = useState(false);
    
    const mostrarProductos = async ()=>{
      try {
        const response = await getAlmacen();
        console.log('Data recibida:', response);
        setListaProductos(response.data.productosConDetalles);
      } catch (error) {
        console.error(error);
      }

    }

    const fetchProveedores = async () => {
      const result = await getProveedores();
      console.log('Proveedor recibido:', result);
      
      // Verifica la estructura de result
      console.log('Proveedores de result:', JSON.stringify(result, null, 2));
      
      // if (result.success && Array.isArray(result.data)) {
        setListaProveedores(result.data.proveedores, result.success);
        console.log("PROVEEDOR", listaProveedores);
      // } else {
      //   console.error(result.message || result.errors);
      // }
    };

    const fetchCategorias = async () => {
      const result = await getCategorias();
      console.log('Categoria recibida:', result);
      console.log('Categoria de result:', JSON.stringify(result, null, 2));
      if (result.success ) {
        setListaCategorias(result.data);
        console.log("CATEGORIA",listaCategorias )
      } else {
        console.error(result.message || result.errors);
      }
    };
    
    useEffect(() => {
      fetchProveedores();
      fetchCategorias();
    }, []);
      
    useEffect(() => {
      mostrarProductos();
      
    }, [reload]);
     
    const agregarProducto = async (e) =>{
      e.preventDefault()
      
      const nuevoProducto = {
        nombre: nombre,
        descripcion: descripcion,
        categoria_id: categoria,
        proveedor_id: proveedor,
        precio: precio,
        cantidad_disponible: cantidad,
        imagen_url: imagen
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
      
      setIsDisabled(false)
      
    }

    const handleEditProducto = (producto) => {
      setProductoId(producto.producto_id)
      setNombre(producto.producto_nombre)
      setDescripcion(producto.descripcion)
      setCategoria(producto.categoria_id)
      setProveedor(producto.proveedor_id)
      setPrecio(producto.precio)
      setCantidad(producto.cantidad_disponible)
      setImagen(producto.imagen_url)
      setOnEdit(true)
      
      
    }

    const modificarProducto = async()=>{
      const nuevoProducto = {
        producto_id: productoId,
        nombre: nombre,
        descripcion: descripcion,
        categoria_id: categoria,
        proveedor_id: proveedor,
        precio: precio,
        cantidad_disponible: cantidad,
        imagen_url: imagen
      }

      const result = await putAlmacen(nuevoProducto)
        if(result.success){
          setReload(!reload)
          console.log("Productos Modificado con éxito.", result.data)
          setNombre('')
          setDescripcion('')
          setCategoria('')
          setProveedor('')
          setPrecio('')
          setCantidad('')
          setImagen('')
          setOnEdit(false)
          setError(null)
          setIsDisabled(false)
        } else{
          console.error("Error al Modificar los Productos.", result.message)
          setNombre('')
          setDescripcion('')
          setCategoria('')
          setProveedor('')
          setPrecio('')
          setCantidad('')
          setImagen('')
          setOnEdit(false)
          setIsDisabled(true)
        }
    }

    
    
    const eliminarProducto = async (id) => {
      if(confirm(`¿Quieres eliminar el producto Nº${id}?`)){
        const result = await deleteAlmacen(id)
        if(result.success){
            setReload(!reload)
            console.log("Proveedor eliminado con éxito.", result.data)
        } else{
            console.error("Error al eliminar el proveedor.", result.message)
        }
      }
         
    }
    
    const handleSelectFocus =  () => {
      setIsDisabled(true)
    }
    
    
  return(
    <div className='almacen-container'>
      <div className='contenedor-listado'>
        <h1 className='titulo'>Listado del almacen</h1><br />
        {listaProductos && listaProductos.length > 0 ? (
            listaProductos.map((producto, index)  => (
            <li key={index}  >
              
              <img src={producto.imagen_url} alt={producto.nombre} />
              <div className='s-general'>
                <div className='s1'>
                  <p>{producto.producto_id}</p>
                  <p>{producto.producto_nombre}</p>
                  <p>{producto.categoria_nombre}</p>
                </div>
                <div className='s2'>
                  <p>{producto.descripcion}</p>
                </div>
                <div className='s3'>
                  <p>{producto.cantidad_disponible}</p>
                  <p>{producto.precio}</p>
                  <button className="modificar" onClick={() =>handleEditProducto(producto)}>Modificar</button>
                  <button className="eliminar" onClick={() => eliminarProducto(producto.producto_id)}>Eliminar</button>
                </div>
              </div>
              
              <hr />
            </li>
            ))
          ) : (
            <p>No hay productos disponibles.</p>
          )}
      </div>
      <div className='contenedor-entradas'>
            <form onSubmit={agregarProducto} >
                <label >Nombre:</label>
                <input  id="nombre" type="text"  value={nombre} 
                onChange={(e) => setNombre(e.target.value)}/> 

                <label>Descripcion:</label> 
                <input id="descripcion" type="text" value={descripcion}
                onChange={(e) => setDescripcion(e.target.value)}/> 

                <label  >Categoria:</label>
                <select name="select" id="select" onChange={(e) => setCategoria(e.target.value)} value={categoria} 
                onFocus={handleSelectFocus}>
                <option value=" " disabled={isDisabled}>{isDisabled== false ? "Categoria": ""} </option>
                  {listaCategorias.map((cate) => (
                    <option  key={cate.id} disabled={!isDisabled} value={cate.id}>
                      {cate.nombre}
                    </option>
                  ))}
                </select>  

                <label >Proveedor:</label>
                <select name="select" id="select" onChange={(e) => setProveedor(e.target.value)} value={proveedor}
                  onFocus={handleSelectFocus}>
                  <option value=" "  >Proveedor</option>
                  
                  {listaProveedores.map((prov) => {
                    return ( 
                      <option key={prov.id} value={prov.id}>
                        {prov.nombre}
                      </option>
                    );
                  })}
                </select>
                
                <label >Precio:</label>
                <input min={1}  id="precio" type="number" value={precio}
                onChange={(e) => setPrecio(parseInt(e.target.value))} />

                <label >Cantidad:</label>
                <input min={1} maxLength={2}type="number" id="cantidad" value={cantidad }
                onChange={(e) => setCantidad(parseInt(e.target.value))}/>
                  
                <label >Imagen URL:</label>
                <input maxLength={255} id="imagen" type="url" value={imagen}
                onChange={(e) => setImagen(e.target.value)} />
          
                {onEdit ? (
                  <div>
                    <button type='button' onClick={modificarProducto}>Modificar</button>
                    <button type='button' onClick={() => {
                      setProductoId(null)
                      setNombre(""); 
                      setDescripcion("");
                      setCategoria("");
                      setProveedor("");
                      setPrecio("");
                      setCantidad("");
                      setImagen("")
                      setOnEdit(false)
                      setIsDisabled(false)
                    }}>Cancelar</button>
                  </div>
                ) : (
                  
                    <button type="submit" >Agregar Producto</button>
                    
                  
                )}
            </form>

            {Array.isArray(error) && error.length > 0 ? (
                <div className='errores'>
                    {error.map((err, index) => (
                    <p className="error" key={index} style={{ color: 'red' }}>{err.msg}</p>
                    ))}
                </div>
                ) : (<p>ERROR</p>)
              }
                
          
          
      </div>
    </div>
  )
};

  

export default Almacen;