import './styles/lobby.css'
import { useOutlet, useLocation } from 'react-router-dom'
import { useRef, useState } from 'react'
import { Store } from 'lucide-react'
import { AnimatePresence, motion } from 'framer-motion'

// Orden lineal de las pantallas dentro de la sidebar, usado solo para saber
// hacia qué lado animar el slide (adelante = entra por la derecha / sale por
// la izquierda; atrás = al revés). No representa jerarquía real entre rutas.
const ORDER = { '/': 0, '/login': 1, '/register': 2 }

const slideVariants = {
  enter: (direction) => ({ x: direction >= 0 ? '100%' : '-100%', opacity: 0 }),
  center: { x: 0, opacity: 1 },
  exit: (direction) => ({ x: direction >= 0 ? '-100%' : '100%', opacity: 0 }),
}

// <Outlet/> normal sigue la ruta EN VIVO: si se lo usa directo adentro del
// motion.div que AnimatePresence mantiene montado para animar la salida, ese
// panel "saliente" cambia de golpe a mostrar el contenido nuevo (porque el
// Outlet se re-renderiza con el match actual), y lo que termina deslizando
// hacia afuera es una copia del panel ENTRANTE, no el anterior. Congelando
// el elemento del outlet una sola vez por instancia (con useState) el panel
// que sale se queda con SU contenido original durante toda la animación.
function FrozenOutlet() {
  const outlet = useOutlet()
  const [frozen] = useState(outlet)
  return frozen
}

function Lobby() {
  const location = useLocation()
  const currentOrder = ORDER[location.pathname] ?? 0
  // Se actualiza durante el render (patrón estándar de Framer Motion con
  // react-router): para cuando el efecto normal correría, la animación de
  // salida ya arrancó con la dirección vieja.
  const prevOrderRef = useRef(currentOrder)
  const direction = currentOrder === prevOrderRef.current ? 0 : currentOrder > prevOrderRef.current ? 1 : -1
  prevOrderRef.current = currentOrder

  return (
    <div className="lobby-container">
      <div className="lobby-bg" aria-hidden="true" />

      {/* Marca a la izquierda, flotando sobre el gif (no dentro de la sidebar) */}
      <div className="lobby-brand">
        <Store size={28} strokeWidth={2.2} />
        <h1>MINIMARKET BITWARD</h1>
      </div>

      <aside className="lobby-sidebar">
        <div className="lobby-sidebar-viewport">
          <AnimatePresence custom={direction} initial={false}>
            <motion.div
              key={location.pathname}
              custom={direction}
              variants={slideVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{
                x: { type: 'tween', duration: 0.35, ease: 'easeInOut' },
                opacity: { duration: 0.25 },
              }}
              className="lobby-panel"
            >
              {/* Welcome, Login o Register según la ruta actual (ver App.jsx) */}
              <FrozenOutlet />
            </motion.div>
          </AnimatePresence>
        </div>
      </aside>
    </div>
  )
}

export default Lobby
