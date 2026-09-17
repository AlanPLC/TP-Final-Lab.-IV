import { useState, useEffect } from 'react';
import '../../styles/dashboardPanels.css'
import './styles/almacen.css'
import useAlmacen from '../../hooks/Almacen/useAlmacen.jsx';
import { PRODUCT_ICONS, getProductIcon, LOGO_CATEGORY_KEY, LOGO_CATEGORY_LABELS } from '../../constants/productIcons.js';
import { Pencil, Trash2, Layers, Search, Plus, X, Loader2 } from 'lucide-react';
import SmoothHeight from '../../components/ui/SmoothHeight.jsx';
import SelectField from '../../components/ui/SelectField.jsx';
import Calendar from '../../components/ui/Calendar.jsx';
import Tooltip from '../../components/ui/Tooltip.jsx';
import LotesModal from './LotesModal.jsx';

// Mismo tope que valida el backend (ver API/src/controllers/productosConDetallesController.js)
// - acá solo es para dar feedback temprano, la verdad la tiene el servidor.
const MAX_PRODUCTOS = 30;

// Fecha de hoy en horario local ("YYYY-MM-DD"), para no permitir cargar un
// vencimiento pasado - toISOString() usa UTC y podía dar la fecha de ayer o
// de mañana según la hora del día en huso horario negativo (ej. Argentina).
function hoyISO() {
  const hoy = new Date();
  const y = hoy.getFullYear();
  const m = String(hoy.getMonth() + 1).padStart(2, '0');
  const d = String(hoy.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

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
  // Lo que se tipea es el costo TOTAL del lote (lo que de verdad se paga al
  // comprar stock), no el costo por unidad - el costo unitario que se manda
  // al backend (y que se usa después para el margen de cada venta, ver
  // ventasController.js) se calcula dividiendo por la cantidad al enviar
  // (ver cargarLote).
  costoLote: "",
  cantidad: "",
  fecha_vencimiento: "",
};

function Almacen() {
  const {getAlmacen, getCategorias, postCategoria, getProveedores, postAlmacen, putAlmacen, deleteAlmacen, getLotes, postLote, setError, error} = useAlmacen()

  // "producto": crear/editar la ficha del producto (catálogo).
  // "lote": cargar mercadería (stock) de un producto ya existente.
  const [tab, setTab] = useState('producto')

  const [productoId, setProductoId] = useState(0)
  const [listaProductos, setListaProductos] = useState([])
  // Arranca en true: al montar, todavía no se hizo ningún fetch.
  const [cargandoProductos, setCargandoProductos] = useState(true)
  const [onEdit, setOnEdit] = useState(false)
  const [reload, setReload] = useState(false)
  const [listaCategorias, setListaCategorias] = useState([])
  const [mostrarNuevaCategoria, setMostrarNuevaCategoria] = useState(false)
  const [nuevaCategoriaNombre, setNuevaCategoriaNombre] = useState('')
  const [listaProveedores, setListaProveedores] = useState([])
  const [todosLosProductos, setTodosLosProductos] = useState([])
  const [terminoBusqueda, setTerminoBusqueda] = useState('')
  const [filtroCategoria, setFiltroCategoria] = useState('')

  const [formData, setFormData] = useState(datosInicialesProducto);
  const [loteData, setLoteData] = useState(datosInicialesLote);
  const [tieneVencimiento, setTieneVencimiento] = useState(false);

  // Producto cuyo modal de lotes está abierto (null = ninguno).
  const [modalLotesProducto, setModalLotesProducto] = useState(null)

  // Estado de carga de cada petición "pesada" (crea/edita producto, carga
  // lote): deshabilita el formulario entero (fieldset) y muestra un loader
  // en el botón mientras se espera la respuesta, para que dos clicks
  // seguidos no disparen la petición dos veces.
  const [enviandoProducto, setEnviandoProducto] = useState(false)
  const [enviandoLote, setEnviandoLote] = useState(false)

  // Costo unitario del lote más reciente del producto en edición, para
  // guiar qué precio de venta poner (ver handleEditProducto). null = no hay
  // lotes todavía, o se está creando un producto nuevo.
  const [costoUltimaCompra, setCostoUltimaCompra] = useState(null)

  const validarFormProducto =
    formData.nombre.trim() &&
    formData.descripcion.trim() &&
    // !== 0 (no > 0): una categoría creada en modo demo tiene id negativo
    // (ver utils/demoDb.js) - 0 sigue siendo "ninguna elegida todavía".
    formData.categoria !== 0 &&
    // El precio es opcional: se puede cargar el producto primero y ponerle
    // precio después de ver cuánto costó el primer lote.
    (formData.precio === "" || formData.precio > 0) &&
    formData.imagen.trim();

  // !== 0 (no > 0): en modo demo los productos/proveedores creados en esta
  // sesión tienen id negativo (ver utils/demoDb.js) - 0 sigue siendo "nada
  // elegido todavía" (valor inicial de loteData).
  const validarFormLote =
    loteData.producto_id !== 0 &&
    loteData.proveedor_id !== 0 &&
    loteData.costoLote > 0 &&
    loteData.cantidad > 0;

  const limiteAlcanzado = !onEdit && todosLosProductos.length >= MAX_PRODUCTOS;

  // Solo las categorías que de verdad tienen algún producto cargado - antes
  // el filtro mostraba TODAS las categorías del sistema (incluidas las que
  // no usa ningún producto todavía), lo que dejaba opciones que no filtraban
  // nada.
  const categoriasEnUso = Array.from(
    new Map(todosLosProductos.map((p) => [p.categoria_id, p.categoria_nombre])).entries()
  )
    .map(([id, nombre]) => ({ id, nombre }))
    .sort((a, b) => a.nombre.localeCompare(b.nombre));

  // Logo y categoría van de la mano: elegir un logo (salvo "Otro") define la
  // categoría también, buscando la categoría "de logo" con ese mismo nombre
  // (se siembran en API/db/schema.sql). "Otro" es la excepción: ahí no hay
  // una categoría automática, así que se muestra el select de categorías
  // propias en su lugar (ver categoriasPropias más abajo).
  const mostrarCategoriaPropia = formData.imagen === LOGO_CATEGORY_KEY;
  const categoriasPropias = listaCategorias.filter((c) => !LOGO_CATEGORY_LABELS.has(c.nombre));

    const handleChange = (e) => {
      const { name, value } = e.target;
      setFormData({
        ...formData,
        // Si se borra el campo no debe "rebotar" a 0 - value queda "" (vacío)
        // hasta que se tipee un número de nuevo.
        [name]: name === "precio" ? (value === "" ? "" : parseFloat(value) || 0) : value,
      });
    };

    const handleLoteChange = (e) => {
      const { name, value } = e.target;
      const esNumerico = name === "costoLote" || name === "cantidad";
      setLoteData((prev) => ({
        ...prev,
        // Igual que en handleChange: si se borra el campo, queda "" en vez
        // de rebotar a 0.
        [name]: esNumerico ? (value === "" ? "" : parseFloat(value) || 0) : value,
      }));
    };

    const mostrarProductos = async ()=>{
      setCargandoProductos(true)
      try {
        const response = await getAlmacen();
        console.log('Data recibida:', response);
        setListaProductos(response.data.productosConDetalles);
        setTodosLosProductos(response.data.productosConDetalles);
      } catch (error) {
        console.error(error);
      } finally {
        setCargandoProductos(false)
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

    // Alta rápida de categoría, en el mismo lugar donde hace falta (no había
    // ninguna pantalla para cargarlas, así que con 0 categorías era
    // imposible crear un producto).
    const crearCategoria = async (e) => {
      e.preventDefault()
      const nombre = nuevaCategoriaNombre.trim()
      if (!nombre) return
      const result = await postCategoria({ nombre })
      if (result.success) {
        setListaCategorias((prev) => [...prev, result.data])
        setFormData((prev) => ({ ...prev, categoria: result.data.id }))
        setNuevaCategoriaNombre('')
        setMostrarNuevaCategoria(false)
        setError(null)
      } else {
        console.error("Error al crear la categoría.", result.message)
      }
    }

    // Al elegir un logo (salvo "Otro"), resuelve la categoría "de logo" con
    // ese mismo nombre - ya sembrada en la base (ver schema.sql). El
    // fallback de crearla acá es solo por las dudas (entorno viejo sin
    // migrar, por ejemplo), en el uso normal ya existe.
    const elegirCategoriaDeLogo = async (icon) => {
      if (icon.key === LOGO_CATEGORY_KEY) {
        setFormData((prev) => ({ ...prev, imagen: icon.key, categoria: 0 }))
        return
      }
      const existente = listaCategorias.find((c) => c.nombre === icon.label)
      if (existente) {
        setFormData((prev) => ({ ...prev, imagen: icon.key, categoria: existente.id }))
        return
      }
      const result = await postCategoria({ nombre: icon.label })
      if (result.success) {
        setListaCategorias((prev) => [...prev, result.data])
        setFormData((prev) => ({ ...prev, imagen: icon.key, categoria: result.data.id }))
      } else {
        console.error("Error al resolver la categoría del logo.", result.message)
      }
    }

    useEffect(() => {
      mostrarProductos();
    }, [reload]);

    const agregarProducto = async (e) =>{
      e.preventDefault()

      const nuevoProducto = {
        nombre: formData.nombre,
        descripcion: formData.descripcion,
        categoria_id: formData.categoria,
        precio: formData.precio === "" ? null : formData.precio,
        imagen_url: formData.imagen
      }
      setEnviandoProducto(true)
      const result = await postAlmacen(nuevoProducto)
      setEnviandoProducto(false)
      if(result.success){
          setReload(!reload)
          console.log("Producto creado con éxito.", result.data)
          setFormData(datosInicialesProducto)
          setError(null)
      } else{
          console.error("Error al crear el producto.", result.message)
      }
    }

    const handleEditProducto = async (producto) => {
      setProductoId(producto.producto_id)
      setOnEdit(true)
      setTab('producto')
      setFormData({
        nombre: producto.producto_nombre,
        descripcion: producto.descripcion,
        categoria: producto.categoria_id,
        precio: producto.precio ?? "",
        imagen: producto.imagen_url,
      })

      // Costo de la compra más reciente, como referencia para poner precio.
      setCostoUltimaCompra(null)
      const result = await getLotes(producto.producto_id)
      if (result.success && result.data.length > 0) {
        const masReciente = result.data.reduce((latest, lote) =>
          new Date(lote.fecha_ingreso) > new Date(latest.fecha_ingreso) ? lote : latest
        )
        setCostoUltimaCompra(masReciente.precio_costo)
      }
    }

    const modificarProducto = async()=>{
      const nuevoProducto = {
        producto_id: productoId,
        nombre: formData.nombre,
        descripcion: formData.descripcion,
        categoria_id: formData.categoria,
        precio: formData.precio === "" ? null : formData.precio,
        imagen_url: formData.imagen
      }

      setEnviandoProducto(true)
      const result = await putAlmacen(nuevoProducto)
      setEnviandoProducto(false)
        if(result.success){
          setReload(!reload)
          console.log("Productos Modificado con éxito.", result.data)
          setFormData(datosInicialesProducto)
          setOnEdit(false)
          setCostoUltimaCompra(null)
          setError(null)
        } else{
          console.error("Error al Modificar los Productos.", result.message)
          setFormData(datosInicialesProducto)
          setOnEdit(false)
          setCostoUltimaCompra(null)
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
      // El backend (y el margen por venta, ver ventasController.js) trabaja
      // con costo POR UNIDAD - se calcula acá a partir del costo total del
      // lote que cargó el usuario, redondeado a centavos.
      const costoUnitario = Math.round((loteData.costoLote / loteData.cantidad) * 100) / 100
      const nuevoLote = {
        producto_id: loteData.producto_id,
        proveedor_id: loteData.proveedor_id,
        precio_costo: costoUnitario,
        cantidad: loteData.cantidad,
        fecha_vencimiento: loteData.fecha_vencimiento || null,
      }
      setEnviandoLote(true)
      const result = await postLote(nuevoLote)
      setEnviandoLote(false)
      if (result.success) {
        setReload(!reload)
        setLoteData(datosInicialesLote)
        setTieneVencimiento(false)
        setError(null)
      } else {
        console.error("Error al cargar el lote.", result.message)
      }
    }

    // Buscador + filtro por categoría, combinados: se recalcula la lista
    // visible cada vez que cambia el texto buscado, la categoría elegida, o
    // llega una lista nueva de productos.
    useEffect(() => {
      let filtrados = todosLosProductos
      if (filtroCategoria) {
        filtrados = filtrados.filter((prod) => String(prod.categoria_id) === String(filtroCategoria))
      }
      if (terminoBusqueda.trim()) {
        filtrados = filtrados.filter((prod) => prod.producto_nombre.toLowerCase().includes(terminoBusqueda.trim().toLowerCase()))
      }
      setListaProductos(filtrados)
    }, [todosLosProductos, terminoBusqueda, filtroCategoria]);
  return(
    <div className='almacen-container'>
      <div className="panel-card almacen-panel">
        {/* Sección izquierda: listado */}
        <div className='almacen-list-section'>
            <div className='almacen-list-head'>
              <h1 className="panel-heading">Listado del Almacén</h1>
              <div className="almacen-search-row">
                <div className="almacen-search">
                  <Search size={16} />
                  <input
                    type="text"
                    className="panel-search"
                    placeholder="Buscar producto..."
                    value={terminoBusqueda}
                    onChange={(e) => setTerminoBusqueda(e.target.value)}
                  />
                </div>
                <div className="almacen-filtro-categoria">
                  <SelectField
                    value={filtroCategoria}
                    onChange={(e) => setFiltroCategoria(e.target.value)}
                  >
                    <option value="">Todas las categorías</option>
                    {categoriasEnUso.map((cate) => (
                      <option key={cate.id} value={cate.id}>
                        {cate.nombre}
                      </option>
                    ))}
                  </SelectField>
                </div>
              </div>
            </div>
        <SmoothHeight>
        {cargandoProductos ? (
          <div className="panel-loading-container">
            <p className="panel-loading">
              <Loader2 size={16} className="panel-spinner" />
              Cargando productos...
            </p>
          </div>
        ) : (
        <ul className="almacen-list" key={filtroCategoria}>
        {listaProductos && listaProductos.length > 0 ? (
            listaProductos.map((producto, index)  => {
            const ProductoIcon = getProductIcon(producto.imagen_url)
            return (
            <li key={index} className="almacen-item">
              <div className='pre-general'>
                <div className='producto-icono' aria-hidden="true">
                  <ProductoIcon size={40} strokeWidth={1.8} />
                </div>
                <div className='s-general'>
                  <div className='s1'>
                    <div className='nombre-categoria'>
                      <p className='p2'>{producto.producto_nombre}</p>
                      <p className='p3'>{producto.categoria_nombre}</p>
                    </div>
                    <div className='buttons'>
                      <button
                        type="button"
                        className="panel-icon-button"
                        title="Modificar"
                        onClick={() =>handleEditProducto(producto)}
                        disabled={onEdit || enviandoProducto || enviandoLote}>
                        <Pencil size={15} />
                      </button>
                      <button
                        type="button"
                        className="panel-icon-button danger"
                        title="Eliminar"
                        onClick={() => eliminarProducto(producto.producto_id)}
                        disabled={onEdit || enviandoProducto || enviandoLote}>
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </div>
                  <div className='s2'>
                    <p>{producto.descripcion}</p>
                  </div>
                  <div className='s3'>
                    {producto.precio != null ? (
                      <p className='p3'>${producto.precio}</p>
                    ) : (
                      <p className='p3 sin-precio'>(Precio de venta no definido)</p>
                    )}
                    <p className='p1'>Cant.:</p>
                    <p className='p2'>{producto.cantidad_disponible}</p>
                    <button
                      type="button"
                      className="lotes-button"
                      onClick={() => setModalLotesProducto(producto)}
                      disabled={onEdit || enviandoProducto || enviandoLote}
                    >
                      <Layers size={14} />
                      Lotes
                    </button>
                  </div>
                </div>
              </div>
            </li>
            )})
          ) : (
            <p className="panel-empty">No hay productos disponibles.</p>
          )}
        </ul>
        )}
        </SmoothHeight>
      </div>
        {/* Sección derecha: alta de producto / carga de stock */}
        <div className='almacen-form-section'>
            <div className="segmented-bar almacen-tabs">
              <button
                type="button"
                className={tab === 'producto' ? 'active' : ''}
                onClick={() => setTab('producto')}
                disabled={enviandoProducto || enviandoLote}
              >
                Producto
              </button>
              <button
                type="button"
                className={tab === 'lote' ? 'active' : ''}
                onClick={() => setTab('lote')}
                disabled={onEdit || enviandoProducto || enviandoLote}
              >
                Cargar Stock
              </button>
            </div>

            <SmoothHeight>
            {tab === 'producto' ? (
            <>
            {onEdit ? (<h3 className="panel-heading">Editando Producto #{productoId}</h3>) : (<h3 className="panel-heading">Agregar Producto</h3>)}
            <form onSubmit={onEdit ? modificarProducto : agregarProducto}>
            <fieldset className="panel-fieldset" disabled={enviandoProducto}>
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

              {/* Logo y categoría unificados: elegir un logo define ambos a
                  la vez (van de la mano). "Otro" es la excepción - ahí
                  aparece el select con las categorías propias. */}
              <label className="panel-label">Categoría</label>
              <div className="icon-picker" role="radiogroup" aria-label="Categoría del producto">
                {PRODUCT_ICONS.map((icon) => (
                  <Tooltip key={icon.key} text={icon.label}>
                    <button
                      type="button"
                      role="radio"
                      aria-checked={formData.imagen === icon.key}
                      aria-label={icon.label}
                      className={`icon-picker-option${formData.imagen === icon.key ? ' selected' : ''}`}
                      onClick={() => elegirCategoriaDeLogo(icon)}
                    >
                      <icon.Icon size={20} strokeWidth={1.8} />
                    </button>
                  </Tooltip>
                ))}
              </div>

              <SmoothHeight>
                {mostrarCategoriaPropia && (
                  <div className="categoria-propia">
                    <div className="panel-label-row">
                      <label className="panel-label" htmlFor="categoria">Categoría propia</label>
                      <button
                        type="button"
                        className="categoria-nueva-toggle"
                        title={mostrarNuevaCategoria ? "Cancelar" : "Nueva categoría"}
                        onClick={() => {
                          setMostrarNuevaCategoria((v) => !v)
                          setNuevaCategoriaNombre('')
                        }}
                      >
                        {mostrarNuevaCategoria ? <X size={14} /> : <Plus size={14} />}
                      </button>
                    </div>
                    <SmoothHeight>
                      {mostrarNuevaCategoria && (
                        <div className="categoria-nueva-form">
                          <input
                            type="text"
                            className="panel-input"
                            placeholder="Nombre de la nueva categoría"
                            value={nuevaCategoriaNombre}
                            onChange={(e) => setNuevaCategoriaNombre(e.target.value)}
                          />
                          <button
                            type="button"
                            className="panel-button panel-button-primary"
                            disabled={!nuevaCategoriaNombre.trim()}
                            onClick={crearCategoria}
                          >
                            Agregar
                          </button>
                        </div>
                      )}
                    </SmoothHeight>
                    <SelectField
                      id="categoria"
                      name="categoria"
                      value={formData.categoria || ""}
                      onChange={handleChange}
                    >
                      <option value="" disabled>
                        Categoría
                      </option>
                      {categoriasPropias.map((cate) => (
                        <option key={cate.id} value={cate.id}>
                          {cate.nombre}
                        </option>
                      ))}
                    </SelectField>
                  </div>
                )}
              </SmoothHeight>

              {/* Al crear un producto todavía no se sabe cuánto va a costar
                  por unidad (eso se sabe recién con el primer lote), así que
                  el precio de venta solo se carga al editar. */}
              {onEdit && (
                <>
                  <label className="panel-label">Precio</label>
                  <SmoothHeight>
                    {costoUltimaCompra != null && (
                      <p className="precio-hint">Última compra: ${costoUltimaCompra} c/u</p>
                    )}
                  </SmoothHeight>
                  <div className="price-input-wrap">
                    <span className="price-prefix" aria-hidden="true">$</span>
                    <input
                      id="precio"
                      type="number"
                      name="precio"
                      className="panel-input price-input"
                      value={formData.precio}
                      onChange={handleChange}
                    />
                  </div>
                </>
              )}

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
                  >
                    {enviandoProducto ? <Loader2 size={15} className="panel-spinner" /> : 'Modificar'}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setFormData(datosInicialesProducto);
                      setOnEdit(false);
                      setCostoUltimaCompra(null);
                    }}
                  >
                    Cancelar
                  </button>
                </div>
              ) : (
                <button type="submit" className="panel-button panel-button-primary almacen-submit" disabled={!validarFormProducto || limiteAlcanzado}>
                  {enviandoProducto ? <Loader2 size={16} className="panel-spinner" /> : 'Agregar Producto'}
                </button>
              )}
            </fieldset>
            </form>
            </>
            ) : (
            <>
            <h3 className="panel-heading">Cargar Stock</h3>
            <form onSubmit={cargarLote}>
            <fieldset className="panel-fieldset" disabled={enviandoLote}>
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

              <label className="panel-label">Costo del lote <span className="panel-label-optional">(Costo total)</span></label>
              <div className="price-input-wrap">
                <span className="price-prefix" aria-hidden="true">$</span>
                <input
                  id="lote-costo"
                  type="number"
                  name="costoLote"
                  className="panel-input price-input"
                  value={loteData.costoLote}
                  onChange={handleLoteChange}
                />
              </div>

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
                      minDate={hoyISO()}
                    />
                  </div>
                )}
              </SmoothHeight>

              <button type="submit" className="panel-button panel-button-primary almacen-submit" disabled={!validarFormLote}>
                {enviandoLote ? <Loader2 size={16} className="panel-spinner" /> : 'Cargar Lote'}
              </button>
            </fieldset>
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
      {modalLotesProducto && (
        <LotesModal
          producto={modalLotesProducto}
          onClose={() => setModalLotesProducto(null)}
        />
      )}
    </div>
  )
};

export default Almacen;
