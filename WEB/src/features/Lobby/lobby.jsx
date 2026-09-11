import './styles/lobby.css'
import { useLocation, useOutlet } from 'react-router-dom'
import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import { Store } from 'lucide-react'

// Orden lineal de las pantallas dentro de la sidebar, usado solo para saber
// hacia qué lado animar el slide (adelante = entra por la derecha / sale por
// la izquierda; atrás = al revés). No representa jerarquía real entre rutas.
const ORDER = { '/': 0, '/login': 1, '/register': 2 }

// Misma duración que .lobby-panel en lobby.css.
const EXIT_MS = 350

function Lobby() {
  const location = useLocation()
  const outlet = useOutlet()

  // Cuando se navega DIRECTO de "/" a "/dashboard" (el botón "Ir al
  // Dashboard" de la Introducción, visible si ya estás logueado), Lobby
  // sigue montado un instante más para su propia animación de salida (la
  // controla RootTransition, un nivel por encima) - y en ese instante
  // location.pathname YA es "/dashboard", que no es ninguna de las rutas
  // propias de Lobby. Por eso todo lo de acá abajo ignora esa ruta y sigue
  // tratando a Lobby como si estuviera en la última pantalla propia
  // (welcome/login/register) que de verdad tenía - se va a desmontar solo
  // igual, cuando RootTransition termine su propio slide.
  const effectivePath = location.pathname in ORDER ? location.pathname : null
  const lastValidPathRef = useRef(effectivePath ?? '/')
  if (effectivePath) {
    lastValidPathRef.current = effectivePath
  }
  const path = effectivePath ?? lastValidPathRef.current
  const currentOrder = ORDER[path] ?? 0

  // Última versión válida de outlet (welcome/login/register), para cuando
  // effectivePath es null (ver comentario arriba: seguimos "congelados" en la
  // última pantalla propia mientras RootTransition anima la salida). Vive en
  // un ref, no en estado: useOutlet() devuelve una referencia nueva en CADA
  // render aunque la ruta no haya cambiado, así que espejarla con setState
  // reencendía este efecto sin parar (loop infinito de renders que competía
  // por CPU con la propia animación y la rompía).
  const lastValidOutletRef = useRef(outlet)
  const prevPathRef = useRef(path)

  // Misma máquina de estados explícita que RootTransition.jsx (ver ahí el
  // detalle de por qué, en vez de AnimatePresence, y de por qué los dos
  // paneles arrancan "congelados" hasta el useLayoutEffect de abajo).
  const [outgoing, setOutgoing] = useState(null) // { outlet } | null
  const [direction, setDirection] = useState(0)
  const [armed, setArmed] = useState(true)
  const timeoutRef = useRef(null)
  const viewportRef = useRef(null)

  useEffect(() => {
    if (path === prevPathRef.current) {
      if (effectivePath) lastValidOutletRef.current = outlet
      return
    }

    setOutgoing({ outlet: lastValidOutletRef.current })
    setDirection(currentOrder > (ORDER[prevPathRef.current] ?? 0) ? 1 : -1)
    setArmed(false)
    prevPathRef.current = path
    if (effectivePath) lastValidOutletRef.current = outlet

    clearTimeout(timeoutRef.current)
    timeoutRef.current = setTimeout(() => setOutgoing(null), EXIT_MS)
  }, [path, effectivePath, outlet, currentOrder])

  useEffect(() => () => clearTimeout(timeoutRef.current), [])

  // Reflow síncrono antes de armar la transición (ver RootTransition.jsx).
  useLayoutEffect(() => {
    if (!armed && viewportRef.current) {
      void viewportRef.current.offsetHeight
      setArmed(true)
    }
  }, [armed])

  const outClass = direction >= 0 ? 'lobby-panel-out-left' : 'lobby-panel-out-right'
  const inClass = direction >= 0 ? 'lobby-panel-in-from-right' : 'lobby-panel-in-from-left'

  return (
    <div className="lobby-container">
      <div className="lobby-bg" aria-hidden="true" />

      {/* Marca a la izquierda, flotando sobre el gif (no dentro de la sidebar) */}
      <div className="lobby-brand">
        <Store size={28} strokeWidth={2.2} />
        <h1>MINIMARKET BITWARD</h1>
      </div>

      <aside className="lobby-sidebar">
        <div className="lobby-sidebar-viewport" ref={viewportRef}>
          {outgoing && (
            <div className={`lobby-panel${armed ? ` ${outClass}` : ''}`}>
              {outgoing.outlet}
            </div>
          )}
          {/* Welcome, Login o Register según la ruta actual (ver App.jsx) */}
          <div className={`lobby-panel${!armed ? ` ${inClass}` : ''}`}>
            {effectivePath ? outlet : lastValidOutletRef.current}
          </div>
        </div>
      </aside>
    </div>
  )
}

export default Lobby
