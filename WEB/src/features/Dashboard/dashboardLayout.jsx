import './styles/dashboard.css'
import { NavLink, useNavigate } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { jwtDecode } from 'jwt-decode'
import { Store, LayoutDashboard, Truck, ShoppingCart, History, Warehouse, User, LogOut, Home, Info, RotateCcw } from 'lucide-react'
import FadeOutlet from '../../components/FadeOutlet.jsx'
import Modal from '../../components/ui/Modal.jsx'
import { esAdmin } from '../../utils/rol.js'
import * as demoDb from '../../utils/demoDb.js'

// Shell persistente de toda la app logueada: sidebar (secciones + usuario +
// cerrar sesión) a la izquierda, y el contenido de la sección actual a la
// derecha (Outlet). Reemplaza a la navbar de arriba que había antes.
function DashboardLayout() {
  const [usuario, setUsuario] = useState(null)
  const [mostrarConfirmacionReset, setMostrarConfirmacionReset] = useState(false)
  const navigate = useNavigate()

  useEffect(() => {
    const token = localStorage.getItem('token')
    if (!token) return
    try {
      setUsuario(jwtDecode(token))
    } catch (err) {
      console.error('Error al decodificar el token:', err)
    }
  }, [])

  const logout = () => {
    localStorage.removeItem('token')
    navigate('/')
  }

  // Cuentas no-admin (la demo pública) simulan sus cambios en localStorage
  // en vez de escribir de verdad en la API (ver utils/apiInterceptor.js) -
  // este botón les permite volver a empezar de cero cuando quieran.
  const reiniciarDemo = () => {
    demoDb.vaciar()
    window.location.reload()
  }

  return (
    <div className="dashboard-container">
      <aside className="dashboard-sidebar">
        <div className="dashboard-sidebar-top">
          <div className="dashboard-brand">
            <Store size={32} strokeWidth={2.2} />
            <span>Minimarket Bitward</span>
          </div>

          <nav className="dashboard-nav">
            <NavLink to="/dashboard" end className="dashboard-nav-link">
              <LayoutDashboard size={18} />
              Inicio
            </NavLink>
            {/* No hay rol "administrador": cualquier cuenta tiene acceso
                completo, así que esta sección se muestra siempre. */}
            <NavLink to="/dashboard/inventario" className="dashboard-nav-link">
              <Warehouse size={18} />
              Gestionar Inventario
            </NavLink>
            {/* Antes "Productos": ya funciona como el punto de venta (elegís
                productos y generás el ticket), el nombre lo reflejaba poco. */}
            <NavLink to="/dashboard/productos" className="dashboard-nav-link">
              <ShoppingCart size={18} />
              Realizar Venta
            </NavLink>
            <NavLink to="/dashboard/proveedores" className="dashboard-nav-link">
              <Truck size={18} />
              Proveedores
            </NavLink>
            {/* Antes "Ventas": es el listado histórico de ventas ya realizadas. */}
            <NavLink to="/dashboard/ventas" className="dashboard-nav-link">
              <History size={18} />
              Historial de Ventas
            </NavLink>

            {/* Vuelve a la zona pública (Lobby): al cruzar de /dashboard a "/"
                RootTransition anima el mismo slide de pantalla completa que
                se usa al iniciar sesión (ver RootTransition.jsx), sin nada
                extra que hacer acá. */}
            <NavLink to="/" className="dashboard-nav-link dashboard-nav-link-intro">
              <Home size={18} />
              Introducción
            </NavLink>
          </nav>
        </div>

        <div className="dashboard-sidebar-bottom">
          {!esAdmin() && (
            <div className="dashboard-demo-aviso">
              <p><Info size={14} /> Modo demo: tus cambios no se guardan en el servidor.</p>
              <button type="button" onClick={() => setMostrarConfirmacionReset(true)}>
                <RotateCcw size={13} />
                Reiniciar demo
              </button>
            </div>
          )}
          {/* El separador va acá (arriba de usuario/cerrar sesión) y no
              arriba de todo el bloque - así, en cuentas no-admin, queda
              debajo del aviso de demo en vez de entre la nav y el aviso. */}
          <div className="dashboard-sidebar-account">
            <div className="dashboard-user">
              <div className="dashboard-user-avatar">
                <User size={18} />
              </div>
              <span className="dashboard-user-name">{usuario?.user ?? '...'}</span>
            </div>
            <button type="button" className="dashboard-logout" onClick={logout}>
              <LogOut size={18} />
              Cerrar Sesión
            </button>
          </div>
          <p className="dashboard-version">Versión 1.1.0</p>
        </div>
      </aside>

      <main className="dashboard-content">
        <FadeOutlet />
      </main>

      {mostrarConfirmacionReset && (
        <Modal title="Reiniciar demo" onClose={() => setMostrarConfirmacionReset(false)}>
          <p className="confirmar-reset-texto">
            ¿Reiniciar los datos que cargaste en esta demo? Se van a borrar todos los productos, proveedores, lotes y ventas simulados en este navegador.
          </p>
          <div className="confirmar-reset-acciones">
            <button type="button" className="panel-button panel-button-secondary" onClick={() => setMostrarConfirmacionReset(false)}>
              Cancelar
            </button>
            <button type="button" className="panel-button panel-button-primary" onClick={reiniciarDemo}>
              Reiniciar
            </button>
          </div>
        </Modal>
      )}
    </div>
  )
}

export default DashboardLayout
