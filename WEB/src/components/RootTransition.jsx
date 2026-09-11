import './styles/rootTransition.css'
import { useLocation, useOutlet } from 'react-router-dom'
import { useEffect, useLayoutEffect, useRef, useState } from 'react'

// Zona "lobby" (bienvenida, login, register - gif de fondo) vs zona
// "dashboard" (app logueada - sidebar propia). El slide de pantalla completa
// pasa SOLO al cruzar de una zona a la otra (ej: al loguearte); navegar
// dentro de una misma zona (welcome->login, o productos->ventas) no lo
// dispara, eso lo maneja cada layout con su propia animación interna (ver
// lobby.jsx).
function zoneOf(pathname) {
  return pathname.startsWith('/dashboard') ? 'dashboard' : 'lobby'
}

// Duración de la salida, en ms - tiene que coincidir con el transition-duration
// de .root-transition-pane en rootTransition.css.
const EXIT_MS = 400

// Máquina de estados explícita en vez de AnimatePresence (ver más abajo el
// motivo), con DOS paneles en pantalla mientras dura el cruce de zona -
// "outgoing" (lo que se va) y "current" (lo que entra)- animando los dos a
// la vez: así no queda un hueco en blanco entre que uno termina de salir y
// el otro arranca a entrar.
//
// Los dos paneles arrancan "congelados" en su posición de reposo (el que se
// va: en el centro, como estaba; el que entra: ya afuera de la pantalla) y
// recién en un mismo commit posterior (forzado con un reflow síncrono, ver
// "armed" más abajo) se les cambia la clase para que arranquen a animar los
// dos a la vez - si el saliente naciera YA con la clase de "afuera" puesta,
// el navegador nunca vería su posición de reposo antes y desaparecería de
// golpe en vez de animar.
//
// Fuera de una transición, solo existe UN outlet de React Router montado (el
// panel "current", que renderiza `outlet` en vivo), que se actualiza solo con
// cada navegación interna (eso es lo que permite que Dashboard navegue entre
// secciones con normalidad). Nunca hay dos outlets compitiendo por la MISMA
// posición al mismo tiempo, que es lo que daba los bugs raros con
// AnimatePresence acá (contenido que se congelaba mal, o animaciones que
// quedaban trabadas a mitad de camino de forma intermitente).
function RootTransition() {
  const location = useLocation()
  const outlet = useOutlet()
  const zone = zoneOf(location.pathname)

  // Última zona/outlet ya commiteados, en un ref (no en estado): useOutlet()
  // devuelve una referencia nueva en CADA render aunque la ruta no haya
  // cambiado, así que espejarla con setState reencendía este efecto sin
  // parar - un loop infinito de renders que competía por CPU con la propia
  // animación (y con el mismo loop en lobby.jsx) y la rompía a mitad de
  // camino. El outlet en vivo siempre es válido acá (a diferencia de
  // lobby.jsx, este nivel siempre matchea alguna ruta), así que ni falta
  // guardarlo: el panel "current" se renderiza directo con `outlet`.
  const prevZoneRef = useRef(zone)
  // Último outlet visto, para poder congelarlo como "outgoing" apenas cambie
  // la zona (si lo leyéramos recién en el efecto de abajo ya sería el nuevo).
  const prevOutletRef = useRef(outlet)
  const [outgoing, setOutgoing] = useState(null) // { outlet } | null
  const [direction, setDirection] = useState(1)
  const [armed, setArmed] = useState(true) // false = recién arrancando, ver arriba
  const timeoutRef = useRef(null)
  const viewportRef = useRef(null)

  useEffect(() => {
    if (zone === prevZoneRef.current) {
      prevOutletRef.current = outlet
      return
    }

    // Cruce de zona real: lo que se estaba mostrando pasa a "outgoing" y lo
    // nuevo entra por el otro lado - los dos arrancan "congelados" (ver
    // comentario de arriba) hasta el useLayoutEffect de abajo.
    setOutgoing({ outlet: prevOutletRef.current })
    setDirection(zone === 'dashboard' ? 1 : -1)
    setArmed(false)
    prevZoneRef.current = zone
    prevOutletRef.current = outlet

    clearTimeout(timeoutRef.current)
    timeoutRef.current = setTimeout(() => setOutgoing(null), EXIT_MS)
  }, [zone, outlet])

  useEffect(() => () => clearTimeout(timeoutRef.current), [])

  // Reflow síncrono antes de armar la transición: confirma que el navegador
  // ya calculó los estilos "congelados" (saliente en el centro, entrante
  // afuera) ANTES de cambiarles la clase - si no, no hay nada que animar.
  useLayoutEffect(() => {
    if (!armed && viewportRef.current) {
      void viewportRef.current.offsetHeight
      setArmed(true)
    }
  }, [armed])

  const outClass = direction >= 0 ? 'rt-out-left' : 'rt-out-right'
  const inClass = direction >= 0 ? 'rt-in-from-right' : 'rt-in-from-left'

  return (
    <div className="root-transition-viewport" ref={viewportRef}>
      {outgoing && (
        <div className={`root-transition-pane${armed ? ` ${outClass}` : ''}`}>
          {outgoing.outlet}
        </div>
      )}
      {/* Lobby (con Welcome/Login/Register adentro) o DashboardLayout (con
          sus secciones adentro), según la zona actual (ver App.jsx) */}
      <div className={`root-transition-pane${!armed ? ` ${inClass}` : ''}`}>
        {outlet}
      </div>
    </div>
  )
}

export default RootTransition
