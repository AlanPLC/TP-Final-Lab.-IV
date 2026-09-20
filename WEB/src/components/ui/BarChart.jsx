/* eslint-disable react/prop-types -- items/formatValue son props simples sin PropTypes, mismo criterio que el resto de components/ui */
import { forwardRef, useEffect, useLayoutEffect, useRef, useState } from 'react'
import './styles/ui.css'

const COLOR_POR_DEFECTO = '#4f8cff'
const OCULTOS_VACIO = new Set()
const DURACION_FADE_MS = 250

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

// Anima que una barra aparezca/desaparezca al tildar/destildar en Ventas, en
// vez de que el gráfico salte de golpe. El orden de `items` nunca cambia
// (siempre las mismas, en el mismo orden) - lo único que anima es la
// transición visible <-> oculto de cada una:
// - Al destildar: la barra sigue ocupando su lugar mientras hace fade-out;
//   el resto recién se reacomoda cuando termina (ahí se la saca del
//   render), no antes.
// - Al tildar: se reinserta ya "reacomodando" (invisible, sin transición) y
//   en el frame siguiente pasa a visible para disparar el fade-in - mismo
//   truco que Modal.jsx/SmoothHeight (montar oculto, mostrar un frame
//   después para que el navegador tenga un estado inicial del que partir).
function useFasesAnimadas(items, ocultos) {
  const [fases, setFases] = useState(() => {
    const inicial = new Map()
    items.forEach((item) => inicial.set(item.key, ocultos.has(item.key) ? 'oculto' : 'visible'))
    return inicial
  })
  const timersRef = useRef(new Map())

  useEffect(() => {
    setFases((anterior) => {
      const siguiente = new Map(anterior)
      items.forEach((item) => {
        const debeOcultarse = ocultos.has(item.key)
        const faseActual = anterior.get(item.key) ?? 'oculto'
        if (!debeOcultarse && faseActual === 'oculto') {
          siguiente.set(item.key, 'entrando')
        } else if (!debeOcultarse && faseActual === 'saliendo') {
          // se volvió a tildar antes de que termine el fade-out: cancela la
          // salida y sigue de donde esté la opacidad hacia visible.
          clearTimeout(timersRef.current.get(item.key))
          timersRef.current.delete(item.key)
          siguiente.set(item.key, 'visible')
        } else if (debeOcultarse && faseActual !== 'oculto' && faseActual !== 'saliendo') {
          siguiente.set(item.key, 'saliendo')
        } else if (!anterior.has(item.key)) {
          siguiente.set(item.key, debeOcultarse ? 'oculto' : 'visible')
        }
      })
      return siguiente
    })
  }, [items, ocultos])

  // "entrando" -> "visible" un frame después (dispara el fade-in por CSS).
  useEffect(() => {
    const entrando = [...fases].filter(([, fase]) => fase === 'entrando').map(([key]) => key)
    if (entrando.length === 0) return undefined
    const id = requestAnimationFrame(() => {
      setFases((actual) => {
        const copia = new Map(actual)
        entrando.forEach((key) => { if (copia.get(key) === 'entrando') copia.set(key, 'visible') })
        return copia
      })
    })
    return () => cancelAnimationFrame(id)
  }, [fases])

  // "saliendo" -> "oculto" (recién ahí se saca del layout) cuando termina el
  // fade-out - un timer por ítem, para no reprogramarlo en cada render.
  useEffect(() => {
    fases.forEach((fase, key) => {
      if (fase !== 'saliendo' || timersRef.current.has(key)) return
      const t = setTimeout(() => {
        timersRef.current.delete(key)
        setFases((actual) => {
          if (actual.get(key) !== 'saliendo') return actual
          const copia = new Map(actual)
          copia.set(key, 'oculto')
          return copia
        })
      }, DURACION_FADE_MS)
      timersRef.current.set(key, t)
    })
  }, [fases])

  useEffect(() => {
    const timers = timersRef.current
    return () => timers.forEach(clearTimeout)
  }, [])

  return fases
}

// FLIP (First-Last-Invert-Play): cuando una barra aparece/desaparece, las
// demás columnas se corren para acomodarse - eso lo hace el flexbox solo,
// pero de un salto (nada animable en un cambio de layout puro). Acá, cada
// vez que la lista de columnas renderizadas cambia, se compara la posición
// ANTERIOR de cada una (guardada en refs) contra la nueva: si se movió, se
// le aplica al toque (sin transición) un transform que la deja VISUALMENTE
// en su posición vieja, y un frame después se saca ese transform con la
// transición puesta - el navegador anima el corrimiento en vez de saltarlo.
function useReorganizarSuave(keysVisibles) {
  const nodosRef = useRef(new Map())
  const posicionesRef = useRef(new Map())

  useLayoutEffect(() => {
    const nodos = nodosRef.current
    const posicionesAnteriores = posicionesRef.current
    const posicionesNuevas = new Map()
    const aAnimar = []

    // Si una pasada anterior dejó un transform sin limpiar (el rAF de más
    // abajo no llegó a correr - p.ej. la pestaña pasó a segundo plano en el
    // medio), medir ahora daría la posición ANIMADA, no la real de layout,
    // y el próximo corrimiento arrancaría de un lugar equivocado (y así se
    // va arrastrando el error). Limpiarlo antes de medir asegura que
    // siempre se parte de la posición real.
    keysVisibles.forEach((key) => {
      const nodo = nodos.get(key)
      if (nodo && nodo.style.transform) {
        nodo.style.transition = 'none'
        nodo.style.transform = ''
      }
    })

    keysVisibles.forEach((key) => {
      const nodo = nodos.get(key)
      if (!nodo) return
      const left = nodo.getBoundingClientRect().left
      posicionesNuevas.set(key, left)
      const anterior = posicionesAnteriores.get(key)
      if (anterior !== undefined && anterior !== left) {
        nodo.style.transition = 'none'
        nodo.style.transform = `translateX(${anterior - left}px)`
        aAnimar.push(nodo)
      }
    })
    posicionesRef.current = posicionesNuevas
    if (aAnimar.length === 0) return undefined

    // Fuerza a que el navegador registre el transform de arriba ANTES de
    // sacarlo en el frame siguiente - si no, agrupa los dos cambios de
    // estilo en uno solo y no queda nada de qué animar.
    aAnimar.forEach((nodo) => nodo.getBoundingClientRect())
    const id = requestAnimationFrame(() => {
      aAnimar.forEach((nodo) => {
        nodo.style.transition = ''
        nodo.style.transform = ''
      })
    })
    return () => cancelAnimationFrame(id)
  })

  return (key) => (nodo) => {
    if (nodo) nodosRef.current.set(key, nodo)
    else nodosRef.current.delete(key)
  }
}

// Gráfico de barras propio (sin librería - mismo criterio que Calendar/
// SelectField/Tooltip) para las tarjetas de Inicio. `items` es SIEMPRE la
// lista completa y estable (mismo orden); `ocultos` (opcional, Set de keys)
// marca cuáles no van - los que no están ocultos se escalan contra SU
// máximo (así, al ocultar el ítem más alto, las barras que quedan se
// reacomodan para aprovechar todo el alto en vez de quedar chiquitas contra
// una escala vieja), y useFasesAnimadas se encarga de la transición
// aparecer/desaparecer (ver arriba). Con `gradient`, cada barra va de una
// versión oscura de su color (en el extremo donde arranca la barra) a una
// versión bien saturada/vívida (en la punta) - el color base es el celeste
// de acento de la app salvo que el item traiga el suyo propio (ver
// Productos más vendidos). `orientation="horizontal"` dibuja filas (label -
// barra - valor) en vez de columnas, para listados donde el ancho
// disponible sobra pero el alto no (ver Productos más vendidos, que no usa
// `ocultos` - ahí siempre están todos). El ref apunta al div raíz - lo usa
// el padre (ver useLadoALado en dashboardHome.jsx) para medir su ancho real
// y decidir si entra al lado de la tabla o hay que apilarlos.
const BarChart = forwardRef(function BarChart({ items, ocultos = OCULTOS_VACIO, formatValue, gradient, orientation = 'vertical' }, ref) {
  const horizontal = orientation === 'horizontal'
  const fases = useFasesAnimadas(items, ocultos)
  const renderItems = items
    .map((item) => ({ item, fase: fases.get(item.key) ?? (ocultos.has(item.key) ? 'oculto' : 'visible') }))
    .filter(({ fase }) => fase !== 'oculto')
  // Siempre se llama, en el mismo orden, sin importar si después se corta en
  // el "Sin Datos" de abajo o en horizontal (que no lo usa) - las reglas de
  // hooks no toleran un hook detrás de un return condicional.
  const registrarNodoCol = useReorganizarSuave(horizontal ? [] : renderItems.map(({ item }) => item.key))

  if (renderItems.length === 0) {
    // Mismo alto que el gráfico con barras (11rem, fijado en .bar-chart) -
    // solo cambia el centrado (vertical acá, en vez de flex-end) para que
    // el contenedor no se achique al desmarcar todo.
    return (
      <div ref={ref} className={`bar-chart bar-chart-vacio${horizontal ? ' bar-chart-horizontal' : ''}`}>
        <p className="bar-chart-empty">Sin Datos</p>
      </div>
    )
  }

  const visibles = items.filter((item) => !ocultos.has(item.key))
  const max = Math.max(1, ...visibles.map((item) => item.value))

  if (horizontal) {
    return (
      <div ref={ref} className="bar-chart bar-chart-horizontal">
        {renderItems.map(({ item }) => {
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
      {renderItems.map(({ item, fase }) => {
        const base = item.color || COLOR_POR_DEFECTO
        const estiloColor = gradient
          ? { background: `linear-gradient(to top, ${ajustarColor(base, 0.9, 0.55)}, ${ajustarColor(base, 1.6, 1.05)})` }
          : { backgroundColor: base }
        const claseFase = fase === 'entrando' ? ' bar-chart-col-entrando' : fase === 'saliendo' ? ' bar-chart-col-saliendo' : ''
        return (
          <div
            key={item.key}
            ref={registrarNodoCol(item.key)}
            className={`bar-chart-col${claseFase}`}
            title={`${item.label}: ${formatValue ? formatValue(item.value) : item.value}`}
          >
            <div className="bar-chart-track">
              <div className="bar-chart-bar" style={{ height: `${Math.min(100, (item.value / max) * 100)}%`, ...estiloColor }} />
            </div>
            <span className="bar-chart-label">{item.label}</span>
          </div>
        )
      })}
    </div>
  )
})

export default BarChart
