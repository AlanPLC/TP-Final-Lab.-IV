import { useState, useEffect } from 'react';
import './styles/almacen.css'
import useAlmacen from '../../hooks/Almacen/useAlmacen.jsx';

function Almacen() {
  const {getAlmacen, getCategorias, getProveedores, postAlmacen, putAlmacen, deleteAlmacen, setError,error, loading} =useAlmacen()
  const [productoId, setProductoId] = useState(0)
  const [listaProductos, setListaProductos] = useState([])
  const [onEdit, setOnEdit] = useState(false)
  const [reload, setReload] = useState(false)
  const [listaCategorias, setListaCategorias] = useState([]) 
  const [listaProveedores, setListaProveedores] = useState([])
  const [isDisabledCategoria, setIsDisabledCategoria] = useState(false);
  const [isDisabledProveedor, setIsDisabledProveedor] = useState(false);

  // Variables formulario.
  const datosIniciales = {
    nombre: "",
    descripcion: "",
    categoria: 0,
    proveedor: 0,
    precio: 0,
    cantidad: 0,
    imagen: "",
  };
  const [formData, setFormData] = useState(datosIniciales); 

  // Validar campos del formulario.
  const validarForm =
    formData.nombre.trim() &&
    formData.descripcion.trim() &&
    formData.categoria > 0 &&
    formData.proveedor > 0 &&
    formData.precio > 0 &&
    formData.cantidad > 0 &&
    formData.imagen.trim();
    
    const handleChange = (e) => {
      const { name, value } = e.target;
      setFormData({
        ...formData,
        [name]: name === "precio" || name === "cantidad" ? parseFloat(value) || 0 : value,
      });
    };

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
      
      setListaProveedores(result.data.proveedores, result.success);
      console.log("PROVEEDOR", listaProveedores);
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
        nombre: formData.nombre,
        descripcion: formData.descripcion,
        categoria_id: formData.categoria,
        proveedor_id: formData.proveedor,
        precio: formData.precio,
        cantidad_disponible: formData.cantidad,
        imagen_url: formData.imagen
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
      
      setIsDisabledCategoria(false)
      setIsDisabledProveedor(false)
      
    }

    const handleEditProducto = (producto) => {
      setProductoId(producto.producto_id)
      setOnEdit(true)
      setFormData({
        nombre: producto.producto_nombre,
        descripcion: producto.descripcion,
        categoria: producto.categoria_id,
        proveedor: producto.proveedor_id,
        precio: producto.precio,
        cantidad: producto.cantidad_disponible,
        imagen: producto.imagen_url,
      })
    }

    const modificarProducto = async()=>{
      const nuevoProducto = {
        producto_id: productoId,
        nombre: formData.nombre,
        descripcion: formData.descripcion,
        categoria_id: formData.categoria,
        proveedor_id: formData.proveedor,
        precio: formData.precio,
        cantidad_disponible: formData.cantidad,
        imagen_url: formData.imagen
      }

      const result = await putAlmacen(nuevoProducto)
        if(result.success){
          setReload(!reload)
          console.log("Productos Modificado con éxito.", result.data)
          setFormData(datosIniciales)
          setOnEdit(false)
          setError(null)
          setIsDisabledCategoria(false)
          setIsDisabledProveedor(false)
        } else{
          console.error("Error al Modificar los Productos.", result.message)
          setFormData(datosIniciales)
          setOnEdit(false)
          setIsDisabledCategoria(false)
          setIsDisabledProveedor(false)
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
      setIsDisabledCategoria(true)
      setIsDisabledProveedor(true)
    }
    
    
  return(
    <div className='almacen-container'>
      <div className='contenedor-listado'>
        <h1 className='titulo'>Listado del almacen</h1><br />
        {listaProductos && listaProductos.length > 0 ? (
            listaProductos.map((producto, index)  => (
            <li key={index}>      
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
            </li>
            ))
          ) : (
            <p>No hay productos disponibles.</p>
          )}
      </div>
      <div className='contenedor-entradas'>
            {onEdit ? (<h3>Editando Producto #{productoId}</h3>) : (<h3>Agregar Producto</h3>)}
            <form onSubmit={onEdit ? modificarProducto : agregarProducto}>
              <label>Nombre</label>
              <input
                id="nombre"
                type="text"
                name="nombre" 
                value={formData.nombre}
                onChange={handleChange}
              />

              <label>Descripcion</label>
              <input
                id="descripcion"
                type="text"
                name="descripcion" 
                value={formData.descripcion}
                onChange={handleChange}
              />

              <label>Categoria</label>
              <select
                id="categoria"
                name="categoria" 
                value={formData.categoria}
                onChange={handleChange}
                onFocus={handleSelectFocus}
              >
                <option value="" disabled={isDisabledCategoria}>
                  {isDisabledCategoria ? "" : "Categoria"}
                </option>
                {listaCategorias.map((cate) => (
                  <option key={cate.id} disabled={!isDisabledCategoria} value={cate.id}>
                    {cate.nombre}
                  </option>
                ))}
              </select>

              <label>Proveedor</label>
              <select
                id="proveedor"
                name="proveedor" 
                value={formData.proveedor}
                onChange={handleChange}
                onFocus={handleSelectFocus}
              >
                <option value="" disabled={isDisabledProveedor}>
                  {isDisabledProveedor ? "" : "Proveedor"}
                </option>
                {listaProveedores.map((prov) => (
                  <option key={prov.id} disabled={!isDisabledProveedor} value={prov.id}>
                    {prov.nombre}
                  </option>
                ))}
              </select>
              
              <div className='p-c'>
                <div className='p-c-1'>
                  <label>Precio</label>
                  <input
                    id="precio"
                    type="number"
                    name="precio" 
                    min={1}
                    value={formData.precio}
                    onChange={handleChange}
                  />
                </div>
                <div className='p-c-2'>
                  <label>Cantidad</label>
                  <input
                    id="cantidad"
                    type="number"
                    name="cantidad" 
                    min={1}
                    maxLength={2}
                    value={formData.cantidad}
                    onChange={handleChange}
                  />
                </div>
              </div>

              <label>Imagen URL</label>
              <input
                id="imagen"
                type="url"
                name="imagen" 
                maxLength={255}
                value={formData.imagen}
                onChange={handleChange}
              />

              {onEdit ? (
                <div className="buttons-cont">
                  <button
                    type="button"
                    className="b1"
                    disabled={!validarForm}
                    onClick={modificarProducto}
                  > Modificar
                  </button>
                  <button
                    type="button"
                    className="b2"
                    onClick={() => {
                      setFormData(datosIniciales); 
                      setOnEdit(false);
                      setIsDisabledCategoria(false);
                      setIsDisabledProveedor(false);
                    }}
                  >
                    Cancelar
                  </button>
                </div>
              ) : (
                <button type="submit" disabled={!validarForm}>
                  Agregar Producto
                </button>
              )}
            </form>
            {Array.isArray(error) && error.length > 0 ? (
                <div className='errores'>
                    {error.map((err, index) => (
                    <><p className="error" key={index} style={{ color: 'red' }}>{err.msg}</p><hr /></>
                    ))}
                </div>
                ) : null
              }
       </div>
    </div>
  )
};

export default Almacen;