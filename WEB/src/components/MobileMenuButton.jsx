/* eslint-disable react/prop-types -- visible/onOpen vienen directo de dashboardLayout.jsx, sin PropTypes en el resto del feature */
import { useRef, useState } from 'react'
import { Menu } from 'lucide-react'
import './styles/mobileMenuButton.css'

// Tiene que coincidir con el tamaño real del botón en mobileMenuButton.css.
const SIZE = 56
const MARGIN = 12

// Botón flotante para volver al menú del Dashboard en mobile/tablet (ver
// dashboardLayout.jsx) - se puede arrastrar a cualquier parte de la pantalla,
// para que el usuario lo deje donde no le tape lo que está mirando. Solo
// existe mientras se está viendo el contenido (no tiene sentido para volver
// al menú si ya estás en el menú).
function MobileMenuButton({ visible, onOpen }) {
  const [pos, setPos] = useState(() => ({
    x: Math.max(MARGIN, window.innerWidth - SIZE - MARGIN),
    // Un poco más arriba del borde inferior, para no quedar pegado a la
    // esquina (más cómodo para el pulgar en un teléfono de gama grande).
    y: Math.max(MARGIN, window.innerHeight - SIZE - MARGIN - 90),
  }))
  const dragRef = useRef(null)

  const clamp = (x, y) => ({
    x: Math.min(Math.max(x, MARGIN), window.innerWidth - SIZE - MARGIN),
    y: Math.min(Math.max(y, MARGIN), window.innerHeight - SIZE - MARGIN),
  })

  // Un pointerdown+up sin desplazamiento cuenta como click (abre el menú);
  // si hubo arrastre de por medio, ese mismo gesto solo reposiciona el
  // botón y NO abre el menú - si no, cada vez que lo movieras también lo
  // estarías "clickeando" sin querer.
  const handlePointerDown = (e) => {
    // El estado de arrastre se guarda pase lo que pase con la captura - la
    // captura es solo una mejora (seguir recibiendo eventos si el dedo/mouse
    // se sale del botón mientras arrastra), no algo de lo que dependa poder
    // arrastrar en absoluto.
    try {
      e.currentTarget.setPointerCapture(e.pointerId)
    } catch {
      // Nada que hacer - seguimos igual sin la captura.
    }
    dragRef.current = { startX: e.clientX, startY: e.clientY, originX: pos.x, originY: pos.y, moved: false }
  }

  const handlePointerMove = (e) => {
    const drag = dragRef.current
    if (!drag) return
    const dx = e.clientX - drag.startX
    const dy = e.clientY - drag.startY
    if (Math.abs(dx) > 4 || Math.abs(dy) > 4) drag.moved = true
    setPos(clamp(drag.originX + dx, drag.originY + dy))
  }

  const handlePointerUp = (e) => {
    const drag = dragRef.current
    dragRef.current = null
    try {
      if (e.currentTarget.hasPointerCapture?.(e.pointerId)) {
        e.currentTarget.releasePointerCapture(e.pointerId)
      }
    } catch {
      // Nada que hacer.
    }
    if (drag && !drag.moved) {
      onOpen()
    }
  }

  if (!visible) return null

  return (
    <button
      type="button"
      className="dashboard-mobile-menu-btn"
      style={{ left: pos.x, top: pos.y }}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      aria-label="Abrir menú"
    >
      <Menu size={22} />
    </button>
  )
}

export default MobileMenuButton
