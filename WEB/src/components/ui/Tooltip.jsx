import { useRef, useState, cloneElement } from 'react'
import { createPortal } from 'react-dom'
import './styles/ui.css'

// Tooltip propio: aparece al instante (nada de esperar el delay del title
// nativo) y, a diferencia de un simple ::after con position:absolute, vive
// en un portal a document.body con position:fixed + coordenadas calculadas
// en JS (mismo criterio que SelectField/Modal) - así no lo recorta el
// overflow:hidden de .panel-card cuando el contenedor (ej. el icon-picker,
// pegado al borde derecho de la ficha) es más angosto que el texto del
// tooltip.
// eslint-disable-next-line react/prop-types
function Tooltip({ text, children }) {
  const [coords, setCoords] = useState(null)
  const elRef = useRef(null)

  const mostrar = () => {
    const rect = elRef.current?.getBoundingClientRect()
    if (!rect) return
    setCoords({ top: rect.top - 6, left: rect.left + rect.width / 2 })
  }
  const ocultar = () => setCoords(null)

  return (
    <>
      {cloneElement(children, {
        ref: elRef,
        onMouseEnter: mostrar,
        onMouseLeave: ocultar,
        onFocus: mostrar,
        onBlur: ocultar,
      })}
      {coords && createPortal(
        <span
          className="tooltip-bubble"
          role="tooltip"
          style={{ top: coords.top, left: coords.left }}
        >
          {text}
        </span>,
        document.body
      )}
    </>
  )
}

export default Tooltip
