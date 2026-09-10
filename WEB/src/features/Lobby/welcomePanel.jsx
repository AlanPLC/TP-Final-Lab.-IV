import './styles/lobby.css'
import { Link } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { LogIn, ArrowRight } from 'lucide-react'

const COLABORADORES = [
  'Alarcón Mauro',
  'Carrizo Alan',
  'Cuello Joaquín',
  'Brizuela Francisco',
]

// Panel de bienvenida: es el contenido "por defecto" de la sidebar del
// Lobby (ruta "/"). Al navegar a /login o /register, Lobby anima el
// reemplazo de este contenido por el panel correspondiente (ver lobby.jsx).
function WelcomePanel() {
  const [autenticado, setAutenticado] = useState(false)

  useEffect(() => {
    setAutenticado(Boolean(localStorage.getItem('token')))
  }, [])

  return (
    <>
      <div className="lobby-panel-top">
        <h2 className="lobby-subtitle">Introducción</h2>
        <p className="desc">
          Proyecto universitario sobre aplicación de enfoque vendedor de un
          minimarket, con el objetivo de administrar productos para su venta
          con generación de ticket de la misma mostrando todos sus detalles.
        </p>
      </div>

      <div className="lobby-panel-mid">
        <h2 className="lobby-subtitle">Colaboradores</h2>
        <ul>
          {COLABORADORES.map((nombre) => (
            <li key={nombre} className="colaborador-item">
              <span className="colaborador-marker" aria-hidden="true" />
              <p className="nombres">{nombre}</p>
            </li>
          ))}
        </ul>
      </div>

      <div className="lobby-panel-bottom">
        <Link to={autenticado ? '/productos' : '/login'} className="lobby-cta">
          {autenticado ? (
            <>
              Ir a Productos
              <ArrowRight size={18} />
            </>
          ) : (
            <>
              <LogIn size={18} />
              Iniciar Sesión
            </>
          )}
        </Link>
      </div>
    </>
  )
}

export default WelcomePanel
