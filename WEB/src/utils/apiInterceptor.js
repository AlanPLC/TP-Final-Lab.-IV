import { expirarSesion } from './sesion.js'
import { esAdmin, usuarioActual } from './rol.js'
import * as demoDb from './demoDb.js'
import { API_BASE_URL } from '../config/api.js'

// No hay un wrapper propio de fetch en la app (cada hook hace fetch directo
// con su propio Authorization header, ver hooks/*) - en vez de tocar los
// ~17 call sites para sumar esta lógica, se parchea fetch UNA sola vez acá
// (importado en main.jsx antes de renderizar) y afecta a todos por igual.
const fetchOriginal = window.fetch.bind(window)

const BASE = API_BASE_URL

window.fetch = async (...args) => {
  const { pathname, method } = partesRequest(args)

  // Cuentas no-admin (hoy, la única cuenta demo pública): sus altas,
  // ediciones y bajas de productos/categorías/proveedores/lotes/ventas se
  // simulan enteramente en localStorage (ver demoDb.js) - nunca llegan a la
  // API real. Las cuentas admin siguen andando exactamente como antes.
  if (!esAdmin()) {
    const ruta = rutas.find((r) => r.method === method && r.patron.test(pathname))
    if (ruta) {
      return ruta.manejar(pathname.match(ruta.patron), args)
    }
  }

  const response = await fetchOriginal(...args)

  // El backend renueva el JWT en cada request autenticado (ver
  // requireAuth.js) y lo manda por este header - la sesión sigue viva
  // mientras se sigan pidiendo cosas a la API, y solo expira de verdad si
  // pasa una hora entera sin ninguna.
  const tokenRenovado = response.headers.get('X-Renewed-Token')
  if (tokenRenovado) {
    localStorage.setItem('token', tokenRenovado)
  }

  // Un 401 solo cuenta como "sesión expirada" si la petición llevaba
  // Authorization - si no, es un fetch público (login/register) y un 401
  // ahí sería por otra cosa (o ni pasa, ver authController.js).
  if (response.status === 401 && teniaAuthorization(args[1])) {
    expirarSesion()
  }

  return response
}

function teniaAuthorization(init) {
  const headers = init?.headers
  if (!headers) return false
  if (headers instanceof Headers) return headers.has('Authorization')
  if (Array.isArray(headers)) return headers.some(([clave]) => clave.toLowerCase() === 'authorization')
  return Object.keys(headers).some((clave) => clave.toLowerCase() === 'authorization')
}

function partesRequest(args) {
  const [recurso, init] = args
  const url = typeof recurso === 'string' ? recurso : recurso.url
  const method = (init?.method || (typeof recurso === 'object' && recurso.method) || 'GET').toUpperCase()
  let pathname
  try {
    pathname = new URL(url, window.location.href).pathname.replace(/\/+$/, '') || '/'
  } catch {
    pathname = url
  }
  return { pathname, method }
}

function leerBody(args) {
  const body = args[1]?.body
  if (!body) return {}
  try {
    return JSON.parse(body)
  } catch {
    return {}
  }
}

function respuestaJson(status, data) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'content-type': 'application/json' },
  })
}

function authHeaders() {
  return { Authorization: 'Bearer ' + localStorage.getItem('token') }
}

// --- Lecturas reales de referencia (para fusionar con lo simulado) ---

async function obtenerProductosReales() {
  const real = await fetchOriginal(`${BASE}/administrador`, { headers: authHeaders() })
  const data = await real.json()
  return data.productosConDetalles ?? []
}

async function obtenerCategoriasReales() {
  const real = await fetchOriginal(`${BASE}/categorias`, { headers: authHeaders() })
  const data = await real.json()
  return data.categorias ?? []
}

async function obtenerOnlyProveedoresReales() {
  const real = await fetchOriginal(`${BASE}/onlyproveedores`, { headers: authHeaders() })
  const data = await real.json()
  return data.proveedores ?? []
}

async function obtenerProveedoresConProductosReales() {
  const real = await fetchOriginal(`${BASE}/proveedores`, { headers: authHeaders() })
  const data = await real.json()
  return data.proveedor ?? []
}

// --- Fusión: datos reales compartidos + lo simulado de esta cuenta ---

async function categoriasFusionadas() {
  const reales = await obtenerCategoriasReales()
  return [...reales, ...demoDb.obtenerCreados('categorias')]
}

async function proveedoresFusionados() {
  const reales = (await obtenerOnlyProveedoresReales()).filter((p) => !demoDb.estaEliminado('proveedores', p.id))
  const conEdicion = reales.map((p) => ({ ...p, ...demoDb.obtenerEditados('proveedores', p.id) }))
  return [...conEdicion, ...demoDb.obtenerCreados('proveedores')]
}

// Suma vendida localmente de un producto, entre todas las ventas simuladas
// de esta cuenta - no se replica el descuento por lote (FEFO) del backend,
// alcanza con bajar el total disponible del producto.
function vendidoLocalmente(producto_id) {
  return demoDb
    .obtenerCreados('ventas')
    .flatMap((venta) => venta.productos)
    .filter((linea) => linea.producto_id === producto_id)
    .reduce((total, linea) => total + Number(linea.cantidad_producto), 0)
}

async function productosFusionados() {
  const reales = await obtenerProductosReales()
  const categorias = await categoriasFusionadas()

  const vivos = reales.filter((p) => !demoDb.estaEliminado('productos', p.producto_id))
  const conEdicion = vivos.map((p) => {
    const cambios = demoDb.obtenerEditados('productos', p.producto_id)
    if (!cambios) return p
    const categoria = categorias.find((c) => c.id === (cambios.categoria_id ?? p.categoria_id))
    return {
      ...p,
      producto_nombre: cambios.nombre ?? p.producto_nombre,
      descripcion: cambios.descripcion ?? p.descripcion,
      precio: cambios.precio ?? p.precio,
      imagen_url: cambios.imagen_url ?? p.imagen_url,
      categoria_id: cambios.categoria_id ?? p.categoria_id,
      categoria_nombre: categoria?.nombre ?? p.categoria_nombre,
    }
  })

  const locales = demoDb.obtenerCreados('productos').map((p) => {
    const categoria = categorias.find((c) => c.id === p.categoria_id)
    return {
      producto_id: p.id,
      producto_nombre: p.nombre,
      descripcion: p.descripcion,
      precio: p.precio,
      imagen_url: p.imagen_url,
      categoria_id: p.categoria_id,
      categoria_nombre: categoria?.nombre ?? null,
      cantidad_disponible: 0,
    }
  })

  // El stock cargado localmente (POST /lotes simulado) suma para CUALQUIER
  // producto, sea real o creado en esta misma sesión - antes solo se sumaba
  // a los productos locales, así que cargar un lote a un producto real no
  // se veía reflejado en absoluto.
  function cantidadLotesLocales(producto_id) {
    return demoDb
      .obtenerCreados('lotes')
      .filter((lote) => lote.producto_id === producto_id)
      .reduce((total, lote) => total + Number(lote.cantidad), 0)
  }

  return [...conEdicion, ...locales].map((p) => ({
    ...p,
    cantidad_disponible: Math.max(
      0,
      Number(p.cantidad_disponible) + cantidadLotesLocales(p.producto_id) - vendidoLocalmente(p.producto_id)
    ),
  }))
}

// --- Handlers de lectura (fusionan y devuelven una Response sintética) ---

async function manejarGetProductos() {
  return respuestaJson(200, { productosConDetalles: await productosFusionados() })
}

async function manejarGetCategorias() {
  return respuestaJson(200, { categorias: await categoriasFusionadas() })
}

async function manejarGetOnlyProveedores() {
  return respuestaJson(200, { proveedores: await proveedoresFusionados() })
}

async function manejarGetProveedoresConProductos() {
  const reales = (await obtenerProveedoresConProductosReales())
    .filter((fila) => !demoDb.estaEliminado('proveedores', fila.proveedor_id))
    .map((fila) => {
      const cambios = demoDb.obtenerEditados('proveedores', fila.proveedor_id)
      if (!cambios) return fila
      return {
        ...fila,
        proveedor_nombre: cambios.nombre ?? fila.proveedor_nombre,
        proveedor_descripcion: cambios.descripcion ?? fila.proveedor_descripcion,
      }
    })
  const locales = demoDb.obtenerCreados('proveedores').map((p) => ({
    proveedor_id: p.id,
    proveedor_nombre: p.nombre,
    proveedor_descripcion: p.descripcion,
    producto_id: null,
    producto_nombre: null,
    producto_costo_unitario: null,
    producto_imagen_url: null,
    producto_categoria_nombre: null,
  }))
  return respuestaJson(200, { proveedor: [...reales, ...locales] })
}

async function manejarGetLotesPorProducto(producto_id) {
  const real = await fetchOriginal(`${BASE}/lotes/producto/${producto_id}`, { headers: authHeaders() })
  const data = await real.json()
  const proveedores = await proveedoresFusionados()
  const locales = demoDb
    .obtenerCreados('lotes')
    .filter((lote) => lote.producto_id === producto_id)
    .map((lote) => ({
      id: lote.id,
      producto_id: lote.producto_id,
      proveedor_id: lote.proveedor_id,
      proveedor_nombre: proveedores.find((p) => p.id === lote.proveedor_id)?.nombre ?? '',
      precio_costo: lote.precio_costo,
      // No se replica el consumo fino por lote (FEFO) del backend acá: un
      // lote simulado siempre se muestra con todo su stock disponible - el
      // descuento por ventas simuladas ya se ve agregado, a nivel producto,
      // en cantidad_disponible (ver productosFusionados).
      cantidad_inicial: lote.cantidad,
      cantidad_restante: lote.cantidad,
      fecha_ingreso: new Date().toISOString(),
      fecha_vencimiento: lote.fecha_vencimiento,
    }))
  return respuestaJson(200, { lotes: [...(data.lotes ?? []), ...locales] })
}

async function manejarGetVentas() {
  const real = await fetchOriginal(`${BASE}/ventas`, { headers: authHeaders() })
  const data = await real.json()
  const productos = await productosFusionados()
  const usuario = usuarioActual()

  const locales = demoDb.obtenerCreados('ventas').flatMap((venta) =>
    venta.productos.map((linea) => {
      const producto = productos.find((p) => p.producto_id === linea.producto_id)
      return {
        venta_id: venta.id,
        fecha: venta.fecha,
        usuario,
        producto_id: linea.producto_id,
        cantidad_producto: linea.cantidad_producto,
        producto_nombre: producto?.producto_nombre ?? '',
        producto_precio: producto?.precio ?? 0,
      }
    })
  )
  return respuestaJson(200, { ventas: [...(data.ventas ?? []), ...locales] })
}

// --- Handlers de escritura (nunca llegan a pegarle a la API real) ---

function manejarPostProducto(args) {
  const producto = demoDb.crear('productos', leerBody(args))
  return respuestaJson(201, { message: 'Producto creado exitosamente.', id: producto.id })
}

function manejarPutProducto(id, args) {
  demoDb.editar('productos', id, leerBody(args))
  return respuestaJson(200, { message: 'Producto actualizado exitosamente.' })
}

function manejarDeleteProducto(id) {
  demoDb.eliminar('productos', id)
  return respuestaJson(200, { message: 'Producto eliminado exitosamente.' })
}

function manejarPostCategoria(args) {
  const categoria = demoDb.crear('categorias', leerBody(args))
  return respuestaJson(201, { message: 'Categoría creada exitosamente.', categoria })
}

function manejarPostProveedor(args) {
  demoDb.crear('proveedores', leerBody(args))
  return respuestaJson(201, { message: 'Proveedor creado.' })
}

function manejarPutProveedor(id, args) {
  demoDb.editar('proveedores', id, leerBody(args))
  return respuestaJson(200, { message: 'Proveedor actualizado.' })
}

function manejarDeleteProveedor(id) {
  demoDb.eliminar('proveedores', id)
  return respuestaJson(200, { message: 'Proveedor eliminado.' })
}

function manejarPostLote(args) {
  const lote = demoDb.crear('lotes', leerBody(args))
  return respuestaJson(201, { message: 'Lote cargado exitosamente.', id: lote.id })
}

async function manejarPostVenta(args) {
  const lineas = leerBody(args).productos ?? []
  const productos = await productosFusionados()

  for (const linea of lineas) {
    const producto = productos.find((p) => p.producto_id === linea.producto_id)
    if (!producto) {
      return respuestaJson(400, { errors: [{ msg: `El producto Nº${linea.producto_id} no existe.` }] })
    }
    if (Number(linea.cantidad_producto) > Number(producto.cantidad_disponible)) {
      return respuestaJson(400, { errors: [{ msg: `Stock insuficiente para el producto Nº${linea.producto_id}.` }] })
    }
  }

  const venta = demoDb.crear('ventas', { fecha: new Date().toISOString(), productos: lineas })
  return respuestaJson(201, { message: 'Venta creada exitosamente.', id: venta.id })
}

// Tabla de rutas simuladas: solo se consulta para cuentas no-admin. Los GET
// fusionan lo real con lo simulado; los POST/PUT/DELETE nunca tocan la red,
// solo actualizan demoDb.js y devuelven una respuesta con la misma forma
// exacta que ya devuelve cada endpoint real (ver los controllers en
// API/src/controllers/).
const rutas = [
  { method: 'GET', patron: /^\/administrador$/, manejar: () => manejarGetProductos() },
  { method: 'POST', patron: /^\/administrador$/, manejar: (_m, args) => manejarPostProducto(args) },
  { method: 'PUT', patron: /^\/administrador\/(-?\d+)$/, manejar: (m, args) => manejarPutProducto(Number(m[1]), args) },
  { method: 'DELETE', patron: /^\/administrador\/(-?\d+)$/, manejar: (m) => manejarDeleteProducto(Number(m[1])) },

  { method: 'GET', patron: /^\/categorias$/, manejar: () => manejarGetCategorias() },
  { method: 'POST', patron: /^\/categorias$/, manejar: (_m, args) => manejarPostCategoria(args) },

  { method: 'GET', patron: /^\/onlyproveedores$/, manejar: () => manejarGetOnlyProveedores() },
  { method: 'GET', patron: /^\/proveedores$/, manejar: () => manejarGetProveedoresConProductos() },
  { method: 'POST', patron: /^\/proveedores$/, manejar: (_m, args) => manejarPostProveedor(args) },
  { method: 'PUT', patron: /^\/proveedores\/(-?\d+)$/, manejar: (m, args) => manejarPutProveedor(Number(m[1]), args) },
  { method: 'DELETE', patron: /^\/proveedores\/(-?\d+)$/, manejar: (m) => manejarDeleteProveedor(Number(m[1])) },

  { method: 'GET', patron: /^\/lotes\/producto\/(-?\d+)$/, manejar: (m) => manejarGetLotesPorProducto(Number(m[1])) },
  { method: 'POST', patron: /^\/lotes$/, manejar: (_m, args) => manejarPostLote(args) },

  { method: 'GET', patron: /^\/ventas$/, manejar: () => manejarGetVentas() },
  { method: 'POST', patron: /^\/ventas$/, manejar: (_m, args) => manejarPostVenta(args) },
]
