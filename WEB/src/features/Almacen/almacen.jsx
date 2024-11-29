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

  // Variables formulario.
  const datosIniciales = {
    nombre: "",
    descripcion: "",
    categoria: 0,
    proveedor: 0,
    precio: null,
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
          setFormData(datosIniciales)
          setError(null)
      } else{
          console.error("Error al crear el producto.", result.message)  
      }
      
      
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
        } else{
          console.error("Error al Modificar los Productos.", result.message)
          setFormData(datosIniciales)
          setOnEdit(false)
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
    
    
  return(
    <div className='almacen-container'>
      {/* Primer contenedor (Lista de productos) */}
      <div className='contenedor-listado'>
        <h1 className='titulo'>Listado del almacen</h1><br />
        {listaProductos && listaProductos.length > 0 ? (
            listaProductos.map((producto, index)  => (
            <li key={index}>
              <div className='pre-general'>
                <img src={producto.imagen_url} alt={producto.nombre} />
                <div className='s-general'>
                  <div className='s1'>
                    <div>   
                      <p className='p1'>#{producto.producto_id}</p>
                      <p className='p2'>{producto.producto_nombre}</p>
                      <p className='p3'>{producto.categoria_nombre}</p>
                    </div>
                    <div className='buttons'>
                      <button 
                        className="modificar" 
                        onClick={() =>handleEditProducto(producto)}
                        disabled={onEdit}/>
                      <button 
                        className="eliminar" 
                        onClick={() => eliminarProducto(producto.producto_id)}
                        disabled={onEdit}/>
                    </div>
                  </div>
                  <div className='s2'>
                    <p>{producto.descripcion}</p>
                  </div>
                  <div className='s3'>
                    <p className='p1'>Cant.:</p>
                    <p className='p2'>{producto.cantidad_disponible}</p>
                    <p className='p3'>${producto.precio}</p>
                  </div>
                </div> 
              </div>
              <hr />
            </li>
            ))
          ) : (
            <p>No hay productos disponibles.</p>
          )}
      </div>
      {/* Segundo contenedor (Formulario) */}
      <div className='contenedor-entradas'>
            {onEdit ? (<h3>Editando Producto #{productoId}</h3>) : (<h3>Agregar Producto</h3>)}
            <form onSubmit={onEdit ? modificarProducto : agregarProducto}>
              <label>Nombre</label>
              <input
                id="nombre"
                type="text"
                name="nombre"
                placeholder='Nombre del producto'
                value={formData.nombre}
                onChange={handleChange}
              />

              <label>Descripcion</label>
              <input
                id="descripcion"
                type="text"
                name="descripcion" 
                placeholder='Descripción del producto'
                value={formData.descripcion}
                onChange={handleChange}
              />

              <label>Categoria</label>
              <select
                id="categoria"
                name="categoria"
                value={formData.categoria || ""}
                onChange={handleChange}
              >
                <option value="" disabled>
                  Categoría
                </option>
                {listaCategorias.map((cate) => (
                  <option key={cate.id} value={cate.id}>
                    {cate.nombre}
                  </option>
                ))}
              </select>

              <label>Proveedor</label>
              <select
                id="proveedor"
                name="proveedor"
                value={formData.proveedor || ""}
                onChange={handleChange}
              >
                <option value="" disabled>
                  Proveedor
                </option>
                {listaProveedores.map((prov) => (
                  <option key={prov.id} value={prov.id}>
                    {prov.nombre}
                  </option>
                ))}
              </select>
              
              <div className='p-c'>
                <div className='p-c-1'>
                  <label>Precio</label>
                  <div>
                    <input
                      id="precio"
                      type="number"
                      name="precio" 
                      value={formData.precio}
                      onChange={handleChange}
                    />
                  </div>
                </div>
                <div className='p-c-2'>
                  <label>Stock</label>
                  <div className='p-c-cant'>
                    <button 
                      className="b1" 
                      type="button" 
                      onClick={() =>
                        setFormData((prev) => ({
                          ...prev,
                          cantidad: Math.max(0, prev.cantidad - 1), 
                        }))
                      }
                      disabled={formData.cantidad <= 0}/>
                    <input
                      id="cantidad"
                      type="number"
                      name="cantidad" 
                      value={formData.cantidad}
                      onChange={handleChange}
                    />
                    <button 
                      className="b2" 
                      type="button"  
                      onClick={() =>
                      setFormData((prev) => ({
                        ...prev,
                        cantidad: Math.max(0, prev.cantidad + 1), 
                      }))
                    }/>
                  </div>
                </div>
              </div>

              <label>Imagen URL</label>
              <input
                id="imagen"
                type="url"
                name="imagen" 
                placeholder='URL de la imágen del producto'
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