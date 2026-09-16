import { useCallback, useEffect, useRef, useState } from 'react'
import { jwtDecode } from 'jwt-decode'
import { Loader2, TrendingUp, Wallet, Trophy, PackageX, CalendarClock } from 'lucide-react'
import useEstadisticas from '../../hooks/Dashboard/useEstadisticas.jsx'
import BarChart from '../../components/ui/BarChart.jsx'
import '../../styles/dashboardPanels.css'
import './styles/dashboardHome.css'

// Mismo criterio de moneda que el resto de la app (ver el ticket PDF en
// Productos.jsx): sin separador de miles, 2 decimales fijos.
function formatearMoneda(valor) {
  return `$${Number(valor ?? 0).toFixed(2)}`
}
function formatearUnidades(valor) {
  return `${valor} u.`
}
function formatearFecha(iso) {
  return new Date(`${iso}T00:00:00`).toLocaleDateString()
}

// Un color base distinto por barra en "Productos más vendidos" (Ventas usa
// el celeste de acento por defecto de BarChart para todas) - cada uno se
// degrada solo de oscuro a claro (ver gradient en BarChart.jsx). Se repite
// en rueda si hay más productos que colores.
const PALETA_PRODUCTOS = ['#4f8cff', '#2a9d5c', '#f0ad4e', '#9b59b6', '#e0607e', '#17a2b8']

// Toggle de un Set inmutable (lo usan tanto el gráfico de ventas como el de
// productos más vendidos, cada uno con su propio estado).
function alternar(set, key) {
  const next = new Set(set)
  if (next.has(key)) next.delete(key)
  else next.add(key)
  return next
}

// Ancho real de contenido de un elemento, sin importar cómo esté
// constreñido AHORA MISMO por el flex que lo achica o lo estira: medirlo
// in-place (scrollWidth) no sirve porque el resultado depende del estado
// actual - ya apilado y estirado a 100% (ver .stat-chart-layout-apilado),
// una <table> de layout automático deja de reportar su mínimo real (usa el
// espacio de sobra) y queda "atascado" confirmando el apilado en vez de
// permitir volver a lado a lado. Clonarlo fuera del flujo, con ancho libre,
// da su ancho natural de verdad en cualquier estado.
function medirAnchoReal(el) {
  const clone = el.cloneNode(true)
  clone.style.position = 'absolute'
  clone.style.visibility = 'hidden'
  clone.style.width = 'max-content'
  clone.style.flex = 'none'
  clone.style.minWidth = '0'
  document.body.appendChild(clone)
  const ancho = clone.getBoundingClientRect().width
  document.body.removeChild(clone)
  return ancho
}

// Decide si la tabla y el gráfico de una tarjeta entran uno al lado del otro
// o hay que apilarlos en columna: mide cuánto ancho pide cada uno "suelto"
// (ver medirAnchoReal - en una <table> de layout automático o en las
// columnas de ancho fijo del gráfico, ese es su mínimo real, no el 50%/50%
// que le imponemos) y lo compara contra la MITAD del ancho disponible, no
// contra el total. No alcanza con que la SUMA de los dos entre: en pantallas
// chicas la tabla puede pedir, sola, más de la mitad y aun así "entrar" al
// achicar al gráfico bien angosto en vez de respetar su 50% - lo que se ve
// es la tabla pasándose de su mitad y el gráfico exprimido, en vez de los
// dos apilados. Si CUALQUIERA de los dos no entra en su propia mitad, se
// apilan los dos (columna, 100% cada uno) - hasta que vuelva a haber lugar
// (agrandar la ventana, destildar ítems en Ventas, etc.). Se probó resolver
// esto solo con CSS (flex-wrap + min-width:max-content), pero
// min(max-content, 100%) - la única forma de no romper la tarjeta si ni
// apilado entra - no lo resuelve bien este navegador (la propiedad queda en
// "auto", como si no existiera).
function useLadoALado() {
  const contenedorRef = useRef(null)
  const primeroRef = useRef(null)
  const segundoRef = useRef(null)
  const observerRef = useRef(null)
  const [apilado, setApilado] = useState(false)

  const medir = useCallback(() => {
    const contenedor = contenedorRef.current
    const primero = primeroRef.current
    const segundo = segundoRef.current
    if (!contenedor || !primero || !segundo) return
    const gap = parseFloat(getComputedStyle(contenedor).columnGap) || 0
    const mitadDisponible = (contenedor.clientWidth - gap) / 2
    const necesitaApilar = medirAnchoReal(primero) > mitadDisponible || medirAnchoReal(segundo) > mitadDisponible
    setApilado(necesitaApilar)
  }, [])

  // reobservar/medir/las tres ref callbacks quedan con identidad ESTABLE
  // (useCallback) entre renders - si fueran funciones nuevas en cada render,
  // React desengancharía y reengancharía los refs (y por lo tanto el
  // ResizeObserver) en CADA render, incluido el que dispara el propio
  // setApilado, dejándolo en un estado inconsistente que ya no vuelve a
  // reaccionar a resFrom real (quedaba "pegado" en apilado aunque volviera
  // a haber lugar de sobra).
  const reobservar = useCallback(() => {
    if (observerRef.current) {
      observerRef.current.disconnect()
      observerRef.current = null
    }
    const contenedor = contenedorRef.current
    const primero = primeroRef.current
    const segundo = segundoRef.current
    if (!contenedor || !primero || !segundo) return
    const observer = new ResizeObserver(medir)
    observer.observe(contenedor)
    observer.observe(primero)
    observer.observe(segundo)
    observerRef.current = observer
    medir()
  }, [medir])

  const contenedorCb = useCallback((nodo) => { contenedorRef.current = nodo; reobservar() }, [reobservar])
  const primerHijoCb = useCallback((nodo) => { primeroRef.current = nodo; reobservar() }, [reobservar])
  const segundoHijoCb = useCallback((nodo) => { segundoRef.current = nodo; reobservar() }, [reobservar])

  return {
    apilado,
    contenedorRef: contenedorCb,
    primerHijoRef: primerHijoCb,
    segundoHijoRef: segundoHijoCb,
  }
}

function DashboardHome() {
  const [usuario, setUsuario] = useState(null)
  const { getEstadisticas } = useEstadisticas()
  const [stats, setStats] = useState(null)
  const [cargando, setCargando] = useState(true)
  const [ventasOcultas, setVentasOcultas] = useState(new Set())
  const ventasLayout = useLadoALado()
  const productosLayout = useLadoALado()

  useEffect(() => {
    const token = localStorage.getItem('token')
    if (!token) return
    try {
      setUsuario(jwtDecode(token))
    } catch (err) {
      console.error('Error al decodificar el token:', err)
    }
  }, [])

  useEffect(() => {
    const cargar = async () => {
      setCargando(true)
      const result = await getEstadisticas()
      if (result.success) setStats(result.data)
      setCargando(false)
    }
    cargar()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Ventas totales + ticket promedio, unificados en un solo set de ítems
  // desmarcables (ver alternar/ventasOcultas arriba).
  const ventasItems = stats ? [
    { key: 'hoy', label: 'Hoy', value: Number(stats.ventas.hoy) },
    { key: 'semana', label: 'Esta semana', value: Number(stats.ventas.semana) },
    { key: 'mes', label: 'Este mes', value: Number(stats.ventas.mes) },
    { key: 'ticket', label: 'Ticket promedio', value: Number(stats.ticketPromedio) },
  ] : []

  const productosItems = stats ? stats.topProductos.map((prod, index) => ({
    key: `prod-${index}`,
    label: prod.producto_nombre,
    value: Number(prod.cantidad_vendida),
    categoria: prod.categoria_nombre,
    ingreso: Number(prod.ingreso),
    color: PALETA_PRODUCTOS[index % PALETA_PRODUCTOS.length],
  })) : []

  return (
    <div className="dashboard-home">
      <div className="stat-card stat-welcome">
        <h1>¡Bienvenido{usuario?.user ? `, ${usuario.user}` : ''}!</h1>
        <p>Un resumen rápido de cómo viene el negocio.</p>
      </div>

      {cargando ? (
        <div className="panel-loading-container">
          <p className="panel-loading">
            <Loader2 size={16} className="panel-spinner" />
            Cargando estadísticas...
          </p>
        </div>
      ) : !stats ? (
        <p className="panel-empty">No se pudieron cargar las estadísticas.</p>
      ) : (
        <div className="stats-grid">
          <div className="stats-row stats-row-top">
            <div className="stat-card">
              <h3 className="stat-card-title"><TrendingUp size={18} /> Ventas</h3>
              <div
                ref={ventasLayout.contenedorRef}
                className={`stat-chart-layout${ventasLayout.apilado ? ' stat-chart-layout-apilado' : ''}`}
              >
                <table ref={ventasLayout.primerHijoRef} className="stat-table stat-table-toggle">
                  <tbody>
                    {ventasItems.map((item) => (
                      <tr key={item.key}>
                        <td>
                          <input
                            type="checkbox"
                            className="panel-checkbox"
                            checked={!ventasOcultas.has(item.key)}
                            onChange={() => setVentasOcultas((prev) => alternar(prev, item.key))}
                          />
                        </td>
                        <td>{item.label}</td>
                        <td>{formatearMoneda(item.value)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                <BarChart
                  ref={ventasLayout.segundoHijoRef}
                  items={ventasItems}
                  ocultos={ventasOcultas}
                  formatValue={formatearMoneda}
                  gradient
                />
              </div>
            </div>

            <div className="stat-card">
              <h3 className="stat-card-title"><Trophy size={18} /> Productos más vendidos</h3>
              {productosItems.length > 0 ? (
                <div
                  ref={productosLayout.contenedorRef}
                  className={`stat-chart-layout${productosLayout.apilado ? ' stat-chart-layout-apilado' : ''}`}
                >
                  <div ref={productosLayout.primerHijoRef} className="stat-table-scroll">
                    <table className="stat-table stat-table-cols">
                      <thead>
                        <tr>
                          <th>Producto</th>
                          <th>Categoría</th>
                          <th>Cant.</th>
                          <th>Ingreso</th>
                        </tr>
                      </thead>
                      <tbody>
                        {productosItems.map((item) => (
                          <tr key={item.key}>
                            <td>{item.label}</td>
                            <td>{item.categoria ?? '—'}</td>
                            <td>{item.value}</td>
                            <td>{formatearMoneda(item.ingreso)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  <BarChart ref={productosLayout.segundoHijoRef} items={productosItems} formatValue={formatearUnidades} gradient orientation="horizontal" />
                </div>
              ) : (
                <p className="panel-empty">Todavía no hay ventas registradas.</p>
              )}
            </div>
          </div>

          <div className="stats-row stats-row-final">
            <div className="stat-card stat-card-sections">
              <div className="stat-section">
                <h3 className="stat-card-title"><Wallet size={18} /> Ganancias</h3>
                <table className="stat-table">
                  <tbody>
                    <tr><td>Bruta</td><td>{formatearMoneda(stats.ganancias.bruta)}</td></tr>
                    <tr><td>Neta</td><td>{formatearMoneda(stats.ganancias.neta)}</td></tr>
                  </tbody>
                </table>
              </div>

              <div className="stat-section">
                <h3 className="stat-card-title"><PackageX size={18} /> Productos con poco stock</h3>
                {stats.stockBajo.length > 0 ? (
                  <div className="stat-table-scroll">
                    <table className="stat-table stat-table-cols">
                      <thead>
                        <tr>
                          <th>Producto</th>
                          <th>Categoría</th>
                          <th>Disponible</th>
                        </tr>
                      </thead>
                      <tbody>
                        {stats.stockBajo.map((prod) => (
                          <tr key={prod.producto_id}>
                            <td>{prod.producto_nombre}</td>
                            <td>{prod.categoria_nombre ?? '—'}</td>
                            <td className={prod.cantidad_disponible <= 0 ? 'stat-valor-critico' : 'stat-valor-alerta'}>
                              {prod.cantidad_disponible}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <p className="panel-empty">Todo el stock está en buen nivel.</p>
                )}
              </div>

              <div className="stat-section">
                <h3 className="stat-card-title"><CalendarClock size={18} /> Productos por vencer / vencidos</h3>
                {stats.vencimientos.length > 0 ? (
                  <div className="stat-table-scroll">
                    <table className="stat-table stat-table-cols">
                      <thead>
                        <tr>
                          <th>Producto</th>
                          <th>Proveedor</th>
                          <th>Cant.</th>
                          <th>Vencimiento</th>
                          <th>Estado</th>
                        </tr>
                      </thead>
                      <tbody>
                        {stats.vencimientos.map((lote) => (
                          <tr key={lote.lote_id}>
                            <td>{lote.producto_nombre}</td>
                            <td>{lote.proveedor_nombre}</td>
                            <td>{lote.cantidad_restante}</td>
                            <td>{formatearFecha(lote.fecha_vencimiento)}</td>
                            <td>
                              <span className={`stat-badge${lote.estado === 'vencido' ? ' stat-badge-critico' : ''}`}>
                                {lote.estado === 'vencido' ? 'Vencido' : 'Por vencer'}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <p className="panel-empty">No hay lotes vencidos ni por vencer.</p>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default DashboardHome
