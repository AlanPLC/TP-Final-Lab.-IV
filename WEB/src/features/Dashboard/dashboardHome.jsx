import { useEffect, useState } from 'react'
import { jwtDecode } from 'jwt-decode'

// Bienvenida que se ve al entrar a /dashboard (justo después de loguearse,
// con el slide de pantalla completa - ver App.jsx/RootTransition).
function DashboardHome() {
  const [usuario, setUsuario] = useState(null)

  useEffect(() => {
    const token = localStorage.getItem('token')
    if (!token) return
    try {
      setUsuario(jwtDecode(token))
    } catch (err) {
      console.error('Error al decodificar el token:', err)
    }
  }, [])

  return (
    <div className="dashboard-home">
      <h1>¡Bienvenido{usuario?.user ? `, ${usuario.user}` : ''}!</h1>
      <p>Elegí una sección del menú de la izquierda para empezar a trabajar.</p>
    </div>
  )
}

export default DashboardHome
