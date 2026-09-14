import { useState, useEffect } from 'react';
import '../../styles/dashboardPanels.css'
import './styles/almacen.css'
import useAlmacen from '../../hooks/Almacen/useAlmacen.jsx';
import { PRODUCT_ICONS, getProductIcon } from '../../constants/productIcons.js';
import { Pencil, Trash2, ChevronDown, ChevronUp, Search } from 'lucide-react';
import SmoothHeight from '../../components/ui/SmoothHeight.jsx';
import SelectField from '../../components/ui/SelectField.jsx';
import Calendar from '../../components/ui/Calendar.jsx';

// Mismo tope que valida el backend (ver API/src/controllers/productosConDetallesController.js)
// - acá solo es para dar feedback temprano, la verdad la tiene el servidor.
const MAX_PRODUCTOS = 30;

const datosInicialesProducto = {
  nombre: "",
  descripcion: "",
  categoria: 0,
  precio: "",
  imagen: "",
};

const datosInicialesLote = {
  producto_id: 0,
  proveedor_id: 0,
  precio_costo: "",
  cantidad: 0,
  fecha_vencimiento: "",
};

function Almacen() {
  const {getAlmacen, getCategorias, getProveedores, postAlmacen, putAlmacen, deleteAlmacen, getLotes, postLote, setError, error} = useAlmacen()

  // "producto": crear/editar la ficha del producto (catálogo).
  // "lote": cargar mercadería (stock) de un producto ya existente.
  const [tab, setTab] = useState('producto')

  const [productoId, setProductoId] = useState(0)
  const [listaProductos, setListaProductos] = useState([])
  const [onEdit, setOnEdit] = useState(false)
  const [reload, setReload] = useState(false)
  const [listaCategorias, setListaCategorias] = useState([])
  const [listaProveedores, setListaProveedores] = useState([])
  const [todosLosProductos, setTodosLosProductos] = useState([])

  const [formData, setFormData] = useState(datosInicialesProducto);
  const [loteData, setLoteData] = useState(datosInicialesLote);
  const [tieneVencimiento, setTieneVencimiento] = useState(false);

  // Detalle de lotes de un producto (expandible en el listado).
  const [productoExpandidoId, setProductoExpandidoId] = useState(null)
  const [lotesPorProducto, setLotesPorProducto] = useState({})
  const [cargandoLotes, setCargandoLotes] = useState(false)

  const validarFormProducto =
    formData.nombre.trim() &&
    formData.descripcion.trim() &&
    formData.categoria > 0 &&
    formData.precio > 0 &&
    formData.imagen.trim();

  const validarFormLote =
    loteData.producto_id > 0 &&
    loteData.proveedor_id > 0 &&
    loteData.precio_costo > 0 &&
    loteData.cantidad > 0;

  const limiteAlcanzado = !onEdit && todosLosProductos.length >= MAX_PRODUCTOS;

    const handleChange = (e) => {
      const { name, value } = e.target;
      setFormData({
        ...formData,
        [name]: name === "precio" ? parseFloat(value) || 0 : value,
      });
    };

    const handleLoteChange = (e) => {
      const { name, value } = e.target;
      setLoteData((prev) => ({
        ...prev,
        [name]: name === "precio_costo" || name === "cantidad" ? parseFloat(value) || 0 : value,
      }));
    };

    const mostrarProductos = async ()=>{
      try {
        const response = await getAlmacen();
        console.log('Data recibida:', response);
        setListaProductos(response.data.productosConDetalles);
        setTodosLosProductos(response.data.productosConDetalles);
      } catch (error) {
        console.error(error);
      }
    }

    const fetchProveedores = async () => {
      const result = await getProveedores();
      console.log('Proveedor recibido:', result);
      if (result.success) {
        setListaProveedores(result.data.proveedores);
      } else {
        console.error(result.message || result.errors);
      }
    };

    const fetchCategorias = async () => {
      const result = await getCategorias();
      console.log('Categoria recibida:', result);
      if (result.success ) {
        setListaCategorias(result.data);
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
        precio: formData.precio,
        imagen_url: formData.imagen
      }
      const result = await postAlmacen(nuevoProducto)
      if(result.success){
          setReload(!reload)
          console.log("Producto creado con éxito.", result.data)
          setFormData(datosInicialesProducto)
          setError(null)
      } else{
          console.error("Error al crear el producto.", result.message)
      }
    }

    const handleEditProducto = (producto) => {
      setProductoId(producto.producto_id)
      setOnEdit(true)
      setTab('producto')
      setFormData({
        nombre: producto.producto_nombre,
        descripcion: producto.descripcion,
        categoria: producto.categoria_id,
        precio: producto.precio,
        imagen: producto.imagen_url,
      })
    }

    const modificarProducto = async()=>{
      const nuevoProducto = {
        producto_id: productoId,
        nombre: formData.nombre,
        descripcion: formData.descripcion,
        categoria_id: formData.categoria,
        precio: formData.precio,
        imagen_url: formData.imagen
      }

      const result = await putAlmacen(nuevoProducto)
        if(result.success){
          setReload(!reload)
          console.log("Productos Modificado con éxito.", result.data)
          setFormData(datosInicialesProducto)
          setOnEdit(false)
          setError(null)
        } else{
          console.error("Error al Modificar los Productos.", result.message)
          setFormData(datosInicialesProducto)
          setOnEdit(false)
        }
    }

    const eliminarProducto = async (id) => {
      if(confirm(`¿Quieres eliminar el producto Nº${id}?`)){
        const result = await deleteAlmacen(id)
        if(result.success){
            setReload(!reload)
            console.log("Producto eliminado con éxito.", result.data)
        } else{
            console.error("Error al eliminar el producto.", result.message)
        }
      }
    }

    // Carga de mercadería: crea un lote para un producto ya existente.
    const cargarLote = async (e) => {
      e.preventDefault()
      const nuevoLote = {
        producto_id: loteData.producto_id,
        proveedor_id: loteData.proveedor_id,
        precio_costo: loteData.precio_costo,
        cantidad: loteData.cantidad,
        fecha_vencimiento: loteData.fecha_vencimiento || null,
      }
      const result = await postLote(nuevoLote)
      if (result.success) {
        setReload(!reload)
        setLotesPorProducto((prev) => {
          const next = { ...prev }
          delete next[String(nuevoLote.producto_id)]
          return next
        })
        setLoteData(datosInicialesLote)
        setTieneVencimiento(false)
        setError(null)
      } else {
        console.error("Error al cargar el lote.", result.message)
      }
    }

    // Muestra/oculta el detalle de lotes de un producto (orden FEFO: el que
    // vence antes primero, ver API/src/controllers/lotesController.js).
    const toggleLotesProducto = async (productoId) => {
      if (productoExpandidoId === productoId) {
        setProductoExpandidoId(null)
        return
      }
      setProductoExpandidoId(productoId)
      if (!lotesPorProducto[productoId]) {
        setCargandoLotes(true)
        const result = await getLotes(productoId)
        if (result.success) {
          setLotesPorProducto((prev) => ({ ...prev, [productoId]: result.data }))
        }
        setCargandoLotes(false)
      }
    }

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
  return(
    <div className='almacen-container'>
      <div className="panel-card almacen-panel">
        {/* Sección izquierda: listado */}
        <div className='almacen-list-section'>
            <div className='almacen-list-head'>
              <h1 className="panel-heading">Listado del Almacén</h1>
              <div className="almacen-search">
                <Search size={16} />
                <input type="text" className="panel-search" placeholder="Buscar producto..." onChange={(e)=>buscador(e.target.value)}/>
              </div>
            </div>
        <ul className="almacen-list">
        {listaProductos && listaProductos.length > 0 ? (
            listaProductos.map((producto, index)  => {
            const ProductoIcon = getProductIcon(producto.imagen_url)
            const expandido = productoExpandidoId === producto.producto_id
            return (
            <li key={index} className="almacen-item">
              <div className='pre-general'>
                <div className='producto-icono' aria-hidden="true">
                  <ProductoIcon size={40} strokeWidth={1.8} />
                </div>
                <div className='s-general'>
                  <div className='s1'>
                    <div>
                      <p className='p1'>#{producto.producto_id}</p>
                      <p className='p2'>{producto.producto_nombre}</p>
                      <p className='p3'>{producto.categoria_nombre}</p>
                    </div>
                    <div className='buttons'>
                      <button
                        type="button"
                        className="panel-icon-button"
                        title="Modificar"
                        onClick={() =>handleEditProducto(producto)}
                        disabled={onEdit}>
                        <Pencil size={15} />
                      </button>
                      <button
                        type="button"
                        className="panel-icon-button danger"
                        title="Eliminar"
                        onClick={() => eliminarProducto(producto.producto_id)}
                        disabled={onEdit}>
                        <Trash2 size={15} />
                      </button>
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
                  <button
                    type="button"
                    className="ver-lotes"
                    onClick={() => toggleLotesProducto(producto.producto_id)}
                  >
                    {expandido ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                    {expandido ? 'Ocultar lotes' : 'Ver lotes'}
                  </button>
                  <SmoothHeight>
                    {expandido && (
                      <div className="lotes-detalle">
                        {cargandoLotes && !lotesPorProducto[producto.producto_id] ? (
                          <p className="lotes-vacio">Cargando...</p>
                        ) : lotesPorProducto[producto.producto_id]?.length > 0 ? (
                          lotesPorProducto[producto.producto_id].map((lote) => (
                            <div key={lote.id} className="lote-item">
                              <span className="lote-proveedor">{lote.proveedor_nombre}</span>
                              <span>{lote.cantidad_restante}/{lote.cantidad_inicial} u.</span>
                              <span>${lote.precio_costo} c/u</span>
                              <span>{lote.fecha_vencimiento ? `Vence: ${new Date(lote.fecha_vencimiento).toLocaleDateString()}` : 'Sin vencimiento'}</span>
                            </div>
                          ))
                        ) : (
                          <p className="lotes-vacio">Este producto no tiene lotes cargados.</p>
                        )}
                      </div>
                    )}
                  </SmoothHeight>
                </div>
              </div>
            </li>
            )})
          ) : (
            <p className="panel-empty">No hay productos disponibles.</p>
          )}
        </ul>
      </div>
        {/* Sección derecha: alta de producto / carga de stock */}
        <div className='almacen-form-section'>
            <div className="segmented-bar almacen-tabs">
              <button
                type="button"
                className={tab === 'producto' ? 'active' : ''}
                onClick={() => setTab('producto')}
              >
                Producto
              </button>
              <button
                type="button"
                className={tab === 'lote' ? 'active' : ''}
                onClick={() => setTab('lote')}
                disabled={onEdit}
              >
                Cargar Stock
              </button>
            </div>

            <SmoothHeight>
            {tab === 'producto' ? (
            <>
            {onEdit ? (<h3 className="panel-heading">Editando Producto #{productoId}</h3>) : (<h3 className="panel-heading">Agregar Producto</h3>)}
            <form onSubmit={onEdit ? modificarProducto : agregarProducto}>
              <label className="panel-label">Nombre</label>
              <input
                id="nombre"
                type="text"
                name="nombre"
                className="panel-input"
                placeholder='Nombre del producto'
                value={formData.nombre}
                onChange={handleChange}
              />

              <label className="panel-label">Descripcion</label>
              <input
                id="descripcion"
                type="text"
                name="descripcion"
                className="panel-input"
                placeholder='Descripción del producto'
                value={formData.descripcion}
                onChange={handleChange}
              />

              <label className="panel-label">Categoria</label>
              <SelectField
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
              </SelectField>

              <label className="panel-label">Precio</label>
              <input
                id="precio"
                type="number"
                name="precio"
                className="panel-input"
                value={formData.precio}
                onChange={handleChange}
              />

              <label className="panel-label">Logo</label>
              <div className="icon-picker" role="radiogroup" aria-label="Logo del producto">
                {PRODUCT_ICONS.map(({ key, label, Icon }) => (
                  <button
                    key={key}
                    type="button"
                    role="radio"
                    aria-checked={formData.imagen === key}
                    title={label}
                    className={`icon-picker-option${formData.imagen === key ? ' selected' : ''}`}
                    onClick={() => setFormData((prev) => ({ ...prev, imagen: key }))}
                  >
                    <Icon size={20} strokeWidth={1.8} />
                  </button>
                ))}
              </div>

              <SmoothHeight>
                {limiteAlcanzado && (
                  <p className="limite-productos">
                    Alcanzaste el máximo de {MAX_PRODUCTOS} productos. Eliminá alguno para poder cargar otro.
                  </p>
                )}
              </SmoothHeight>

              {onEdit ? (
                <div className="segmented-bar buttons-cont">
                  <button
                    type="button"
                    disabled={!validarFormProducto}
                    onClick={modificarProducto}
                  > Modificar
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setFormData(datosInicialesProducto);
                      setOnEdit(false);
                    }}
                  >
                    Cancelar
                  </button>
                </div>
              ) : (
                <button type="submit" className="panel-button panel-button-primary almacen-submit" disabled={!validarFormProducto || limiteAlcanzado}>
                  Agregar Producto
                </button>
              )}
            </form>
            </>
            ) : (
            <>
            <h3 className="panel-heading">Cargar Stock</h3>
            <form onSubmit={cargarLote}>
              <label className="panel-label">Producto</label>
              <SelectField
                id="lote-producto"
                name="producto_id"
                value={loteData.producto_id || ""}
                onChange={handleLoteChange}
              >
                <option value="" disabled>
                  Producto
                </option>
                {todosLosProductos.map((prod) => (
                  <option key={prod.producto_id} value={prod.producto_id}>
                    {prod.producto_nombre}
                  </option>
                ))}
              </SelectField>

              <label className="panel-label">Proveedor</label>
              <SelectField
                id="lote-proveedor"
                name="proveedor_id"
                value={loteData.proveedor_id || ""}
                onChange={handleLoteChange}
              >
                <option value="" disabled>
                  Proveedor
                </option>
                {listaProveedores.map((prov) => (
                  <option key={prov.id} value={prov.id}>
                    {prov.nombre}
                  </option>
                ))}
              </SelectField>

              <label className="panel-label">Costo de compra (por unidad)</label>
              <input
                id="lote-precio-costo"
                type="number"
                name="precio_costo"
                className="panel-input"
                value={loteData.precio_costo}
                onChange={handleLoteChange}
              />

              <label className="panel-label">Cantidad</label>
              <input
                id="lote-cantidad"
                type="number"
                name="cantidad"
                className="panel-input"
                value={loteData.cantidad}
                onChange={handleLoteChange}
              />

              <div className="panel-label-row">
                <label className="panel-label" htmlFor="lote-vencimiento-check">Vencimiento</label>
                <input
                  id="lote-vencimiento-check"
                  type="checkbox"
                  className="panel-checkbox"
                  checked={tieneVencimiento}
                  onChange={(e) => {
                    const checked = e.target.checked
                    setTieneVencimiento(checked)
                    if (!checked) setLoteData((prev) => ({ ...prev, fecha_vencimiento: "" }))
                  }}
                />
              </div>
              <SmoothHeight>
                {tieneVencimiento && (
                  <div className="calendar-wrap">
                    <Calendar
                      value={loteData.fecha_vencimiento || null}
                      onChange={(iso) => setLoteData((prev) => ({ ...prev, fecha_vencimiento: iso }))}
                    />
                  </div>
                )}
              </SmoothHeight>

              <button type="submit" className="panel-button panel-button-primary almacen-submit" disabled={!validarFormLote}>
                Cargar Lote
              </button>
            </form>
            </>
            )}
            </SmoothHeight>
            <SmoothHeight>
            {Array.isArray(error) && error.length > 0 ? (
                <div className='panel-error-list almacen-errors'>
                    {error.map((err, index) => (
                    <p key={index}>{err.msg}</p>
                    ))}
                </div>
                ) : null
              }
            </SmoothHeight>
        </div>
      </div>
    </div>
  )
};

export default Almacen;
