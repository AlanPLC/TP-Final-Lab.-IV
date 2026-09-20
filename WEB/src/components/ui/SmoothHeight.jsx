import { useEffect, useRef, useState } from 'react'
import './styles/ui.css'

// Anima el alto de un contenedor ante CUALQUIER cambio de contenido (una
// sección condicional, una lista que cambia de tamaño, un tab que cambia de
// formulario) en vez de que salte de golpe - patrón "SmoothHeight" de
// Destino Turístico. Mide con ResizeObserver (no un truco de grid-rows de
// 0fr/1fr) porque así también anima cuando el contenido CAMBIA sin dejar de
// estar montado (ej: pasar de la lista de 2 lotes a la de 1), no solo
// cuando aparece/desaparece.
// eslint-disable-next-line react/prop-types
function SmoothHeight({ children }) {
  const innerRef = useRef(null)
  const [height, setHeight] = useState(0)
  const hasContent = children != null && children !== false

  useEffect(() => {
    const el = innerRef.current
    if (!el) return
    const measure = () => setHeight(el.scrollHeight)
    measure()
    const observer = new ResizeObserver(measure)
    observer.observe(el)
    return () => observer.disconnect()
  }, [children])

  return (
    <div className="smooth-height" style={{ height, minHeight: height }}>
      {/* display:flow-root (no overflow-hidden acá) para que el margin-top
          de un hijo no se "escape" del cálculo de scrollHeight - si
          colapsara hacia afuera, la altura medida quedaría corta y
          recortaría la última fila. */}
      <div ref={innerRef} className={`smooth-height-inner${hasContent ? ' has-content' : ''}`}>
        {children}
      </div>
    </div>
  )
}

export default SmoothHeight
