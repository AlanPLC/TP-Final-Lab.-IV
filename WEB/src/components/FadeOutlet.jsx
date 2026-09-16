import { useLocation, useOutlet } from 'react-router-dom'
import './styles/fadeOutlet.css'

// Fade de entrada al navegar entre secciones del sidebar (Inicio, Gestionar
// Inventario, Realizar Venta, etc.). key={pathname} hace que React monte un
// div nuevo en cada navegación, y una animación CSS (@keyframes, no una
// transition con toggle de clase en dos pasos vía useState+rAF) arranca
// sola apenas ese div entra al DOM - no hace falta orquestar nada desde acá.
// La primera versión usaba transition + requestAnimationFrame (mismo truco
// que Modal.jsx), pero eso necesita que el navegador pinte el estado
// "apagado" en un frame separado del estado "prendido" para que la
// transition tenga de dónde partir - en una recarga completa eso pasaba
// solo (hay de por medio toda la carga/parseo de la página), pero en una
// navegación interna común los dos cambios podían terminar en el mismo
// frame y el fade no se veía. @keyframes no tiene ese problema: siempre
// anima desde su "from", sin depender de en qué frame se pinte.
function FadeOutlet() {
  const location = useLocation()
  const outlet = useOutlet()

  return (
    <div key={location.pathname} className="fade-outlet">
      {outlet}
    </div>
  )
}

export default FadeOutlet
