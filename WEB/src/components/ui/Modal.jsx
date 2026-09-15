import { useEffect, useState } from 'react'
import { createPortal } from 'react-dom'
import { X } from 'lucide-react'
import SmoothHeight from './SmoothHeight.jsx'
import './styles/ui.css'

// Tiene que matchear el transition-duration de .modal-overlay/.modal-box en
// ui.css: al cerrar, el componente sigue montado hasta que termina la
// animación de salida (retrasamos el onClose real con este timeout) - a
// diferencia de SmoothHeight, acá no alcanza con animar por CSS porque el
// modal entero se desmonta al cerrar.
const DURACION_ANIMACION_MS = 180

// Modal genérico (overlay + caja centrada), portado a document.body por la
// misma razón que SelectField: escapar de cualquier overflow:hidden/z-index
// de los paneles por los que ande el botón que lo abre. El alto máximo
// (80vh, con scroll propio si el contenido no entra) vive en el CSS
// (.modal-box / .modal-body).
function Modal({ title, onClose, children }) {
  const [visible, setVisible] = useState(false)

  // Arranca oculto y pasa a "visible" en el siguiente frame, así el navegador
  // alcanza a pintar el estado inicial antes de animar hacia el final -
  // si se pusiera visible de una, no habría transición de la que partir.
  useEffect(() => {
    const id = requestAnimationFrame(() => setVisible(true))
    return () => cancelAnimationFrame(id)
  }, [])

  const cerrar = () => {
    setVisible(false)
    setTimeout(onClose, DURACION_ANIMACION_MS)
  }

  useEffect(() => {
    const onKeyDown = (e) => {
      if (e.key === 'Escape') cerrar()
    }
    document.addEventListener('keydown', onKeyDown)
    return () => document.removeEventListener('keydown', onKeyDown)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [onClose])

  return createPortal(
    <div
      className={`modal-overlay${visible ? ' visible' : ''}`}
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) cerrar()
      }}
    >
      <div className="modal-box">
        <div className="modal-header">
          <h2 className="modal-title">{title}</h2>
          <button type="button" className="modal-close" onClick={cerrar} aria-label="Cerrar">
            <X size={18} />
          </button>
        </div>
        <div className="modal-body">
          {/* El contenido (filtros, listas) cambia de tamaño en runtime (ej.
              un filtro que deja menos lotes) - SmoothHeight anima ese cambio
              en vez de que la caja salte de golpe a la nueva altura. */}
          <SmoothHeight>{children}</SmoothHeight>
        </div>
      </div>
    </div>,
    document.body
  )
}

export default Modal
