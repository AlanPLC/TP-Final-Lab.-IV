/* eslint-disable react/prop-types -- items/formatValue son props simples sin PropTypes, mismo criterio que el resto de components/ui */
import { forwardRef } from 'react'
import './styles/ui.css'

const COLOR_POR_DEFECTO = '#4f8cff'

function hexARgb(hex) {
  const limpio = hex.replace('#', '')
  const num = parseInt(limpio, 16)
  return { r: (num >> 16) & 0xff, g: (num >> 8) & 0xff, b: num & 0xff }
}

// RGB (0-255) -> HSL (h en grados 0-360, s/l en % 0-100) - hace falta pasar
// por acá para poder tocar SOLO la saturación sin cambiar el matiz.
function rgbAHsl(r, g, b) {
  r /= 255; g /= 255; b /= 255
  const max = Math.max(r, g, b)
  const min = Math.min(r, g, b)
  const l = (max + min) / 2
  if (max === min) return { h: 0, s: 0, l: l * 100 }
  const d = max - min
  const s = l > 0.5 ? d / (2 - max - min) : d / (max + min)
  let h
  if (max === r) h = (g - b) / d + (g < b ? 6 : 0)
  else if (max === g) h = (b - r) / d + 2
  else h = (r - g) / d + 4
  return { h: (h / 6) * 360, s: s * 100, l: l * 100 }
}

function hslARgb(h, s, l) {
  h /= 360; s /= 100; l /= 100
  if (s === 0) {
    const v = Math.round(l * 255)
    return `rgb(${v}, ${v}, ${v})`
  }
  const hue2rgb = (p, q, t) => {
    if (t < 0) t += 1
    if (t > 1) t -= 1
    if (t < 1 / 6) return p + (q - p) * 6 * t
    if (t < 1 / 2) return q
    if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6
    return p
  }
  const q = l < 0.5 ? l * (1 + s) : l + s - l * s
  const p = 2 * l - q
  const r = hue2rgb(p, q, h + 1 / 3)
  const g = hue2rgb(p, q, h)
  const b = hue2rgb(p, q, h - 1 / 3)
  return `rgb(${Math.round(r * 255)}, ${Math.round(g * 255)}, ${Math.round(b * 255)})`
}

// Mismo matiz, jugando con luminosidad Y saturación juntas - el extremo
// "oscuro" (abajo en la barra/al arranque) baja la luminosidad y afloja un
// poco la saturación, como una sombra del color; el extremo "saturado" (la
// punta) sube la saturación al tope para que se vea vívido. Antes solo se
// tocaba la saturación (dejando la misma luminosidad todo el trayecto), lo
// que daba un gris parejo abajo en vez de un tono oscuro de verdad.
function ajustarColor(hex, satFactor, lightFactor) {
  const { r, g, b } = hexARgb(hex)
  const { h, s, l } = rgbAHsl(r, g, b)
  const nuevaS = Math.max(0, Math.min(100, s * satFactor))
  const nuevaL = Math.max(0, Math.min(100, l * lightFactor))
  return hslARgb(h, nuevaS, nuevaL)
}

// Gráfico de barras propio (sin librería - mismo criterio que Calendar/
// SelectField/Tooltip) para las tarjetas de Inicio con ítems desmarcables:
// el padre filtra `items` a los visibles y este componente solo dibuja lo
// que recibe, escalado contra el máximo de ESE subconjunto (así, al
// desmarcar el ítem más alto, las barras que quedan se reacomodan para
// aprovechar todo el alto en vez de quedar chiquitas contra una escala vieja).
// Con `gradient`, cada barra va de una versión oscura de su color (en el
// extremo donde arranca la barra) a una versión bien saturada/vívida (en la
// punta) - el color base es el celeste de acento de la app salvo que el
// item traiga el suyo propio (ver Productos más vendidos).
// `orientation="horizontal"` dibuja filas (label - barra - valor)
// en vez de columnas, para listados donde el ancho disponible sobra pero el
// alto no (ver Productos más vendidos). El ref apunta al div raíz - lo usa
// el padre (ver useLadoALado en dashboardHome.jsx) para medir su ancho real
// y decidir si entra al lado de la tabla o hay que apilarlos.
const BarChart = forwardRef(function BarChart({ items, formatValue, gradient, orientation = 'vertical' }, ref) {
  const horizontal = orientation === 'horizontal'

  if (items.length === 0) {
    // Mismo alto que el gráfico con barras (11rem, fijado en .bar-chart) -
    // solo cambia el centrado (vertical acá, en vez de flex-end) para que
    // el contenedor no se achique al desmarcar todo.
    return (
      <div ref={ref} className={`bar-chart bar-chart-vacio${horizontal ? ' bar-chart-horizontal' : ''}`}>
        <p className="bar-chart-empty">Sin Datos</p>
      </div>
    )
  }

  const max = Math.max(1, ...items.map((item) => item.value))

  if (horizontal) {
    return (
      <div ref={ref} className="bar-chart bar-chart-horizontal">
        {items.map((item) => {
          const base = item.color || COLOR_POR_DEFECTO
          const estiloColor = gradient
            ? { background: `linear-gradient(to right, ${ajustarColor(base, 0.9, 0.55)}, ${ajustarColor(base, 1.6, 1.05)})` }
            : { backgroundColor: base }
          return (
            <div key={item.key} className="bar-chart-hrow" title={`${item.label}: ${formatValue ? formatValue(item.value) : item.value}`}>
              <span className="bar-chart-hlabel">{item.label}</span>
              <div className="bar-chart-htrack">
                <div className="bar-chart-hbar" style={{ width: `${(item.value / max) * 100}%`, ...estiloColor }} />
              </div>
              <span className="bar-chart-hvalue">{formatValue ? formatValue(item.value) : item.value}</span>
            </div>
          )
        })}
      </div>
    )
  }

  return (
    <div ref={ref} className="bar-chart">
      {items.map((item) => {
        const base = item.color || COLOR_POR_DEFECTO
        const estiloColor = gradient
          ? { background: `linear-gradient(to top, ${ajustarColor(base, 0.9, 0.55)}, ${ajustarColor(base, 1.6, 1.05)})` }
          : { backgroundColor: base }
        return (
          <div key={item.key} className="bar-chart-col" title={`${item.label}: ${formatValue ? formatValue(item.value) : item.value}`}>
            <div className="bar-chart-track">
              <div className="bar-chart-bar" style={{ height: `${(item.value / max) * 100}%`, ...estiloColor }} />
            </div>
            <span className="bar-chart-label">{item.label}</span>
          </div>
        )
      })}
    </div>
  )
})

export default BarChart
