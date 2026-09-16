import { useEffect, useState } from 'react'
import { CLAVE_TOAST_SESION } from '../../utils/sesion.js'
import './styles/ui.css'

const DURACION_VISIBLE_MS = 5000
const DURACION_FADE_MS = 250

// Montado una sola vez en la raíz de la app (ver App.jsx) - al montar revisa
// si expirarSesion() dejó un aviso pendiente en sessionStorage. No puede ser
// un estado en memoria porque expirarSesion() hace un window.location.href
// (reinicia todo el runtime de JS): sessionStorage es lo único que
// sobrevive a esa recarga y llega hasta que este componente vuelve a montar
// en /login.
function Toast() {
  const [mensaje, setMensaje] = useState(null)
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const pendiente = sessionStorage.getItem(CLAVE_TOAST_SESION)
    if (!pendiente) return undefined
    sessionStorage.removeItem(CLAVE_TOAST_SESION)
    setMensaje(pendiente)

    const idAparecer = requestAnimationFrame(() => setVisible(true))
    const idOcultar = setTimeout(() => setVisible(false), DURACION_VISIBLE_MS)
    const idSacar = setTimeout(() => setMensaje(null), DURACION_VISIBLE_MS + DURACION_FADE_MS)
    return () => {
      cancelAnimationFrame(idAparecer)
      clearTimeout(idOcultar)
      clearTimeout(idSacar)
    }
  }, [])

  if (!mensaje) return null

  return (
    <div className={`toast-aviso${visible ? ' visible' : ''}`} role="status">
      {mensaje}
    </div>
  )
}

export default Toast
