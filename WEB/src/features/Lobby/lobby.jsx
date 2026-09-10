import './styles/lobby.css'
import { Link } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { LogIn, Store, ArrowRight } from 'lucide-react'

const COLABORADORES = [
  'Alarcón Mauro',
  'Carrizo Alan',
  'Cuello Joaquín',
  'Brizuela Francisco',
]

function Lobby() {
  // Si ya hay sesión iniciada, el botón de abajo lleva directo a la app
  // en vez de mandar de nuevo al login.
  const [autenticado, setAutenticado] = useState(false)

  useEffect(() => {
    setAutenticado(Boolean(localStorage.getItem('token')))
  }, [])

  return (
    <div className="lobby-container">
      <div className="lobby-bg" aria-hidden="true" />

      {/* Marca a la izquierda, flotando sobre el gif (no dentro de la sidebar) */}
      <div className="lobby-brand">
        <Store size={28} strokeWidth={2.2} />
        <h1>MINIMARKET BITWARD</h1>
      </div>

      <aside className="lobby-sidebar">
        <div className="lobby-sidebar-top">
          <h2 className="lobby-subtitle">Introducción</h2>
          <p className="desc">
            Proyecto universitario sobre aplicación de enfoque vendedor de un
            minimarket, con el objetivo de administrar productos para su venta
            con generación de ticket de la misma mostrando todos sus detalles.
          </p>
        </div>

        <div className="lobby-sidebar-mid">
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

        <div className="lobby-sidebar-bottom">
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
      </aside>
    </div>
  )
}

export default Lobby
