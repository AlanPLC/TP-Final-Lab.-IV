import { useEffect, useRef, useState } from 'react'
import './styles/ui.css'

// Igual que SmoothHeight pero animando ANCHO en vez de alto - pensado para
// controles cuyo texto cambia de longitud (ej. el toggle de orden de
// LotesModal: "Más viejo primero" / "Más nuevo primero") y que si no,
// empujarían de golpe a los elementos de al lado en vez de correrlos.
// eslint-disable-next-line react/prop-types
function SmoothWidth({ children }) {
  const innerRef = useRef(null)
  const [width, setWidth] = useState(0)

  useEffect(() => {
    const el = innerRef.current
    if (!el) return
    const measure = () => setWidth(el.scrollWidth)
    measure()
    const observer = new ResizeObserver(measure)
    observer.observe(el)
    return () => observer.disconnect()
  }, [children])

  return (
    <span className="smooth-width" style={{ width }}>
      <span ref={innerRef} className="smooth-width-inner">
        {children}
      </span>
    </span>
  )
}

export default SmoothWidth
