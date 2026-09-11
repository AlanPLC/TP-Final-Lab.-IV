import './styles/dashboard.css'
import { NavLink, Outlet, useNavigate } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { jwtDecode } from 'jwt-decode'
import { Store, LayoutDashboard, Truck, ShoppingCart, History, Warehouse, User, LogOut, Home } from 'lucide-react'

// Shell persistente de toda la app logueada: sidebar (secciones + usuario +
// cerrar sesión) a la izquierda, y el contenido de la sección actual a la
// derecha (Outlet). Reemplaza a la navbar de arriba que había antes.
function DashboardLayout() {
  const [usuario, setUsuario] = useState(null)
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
            {/* Antes "Administrar" -> /dashboard/administracion: es la misma
                pantalla (Almacen.jsx) que ya permite cargar/editar/eliminar
                productos, solo que con un nombre que no reflejaba lo que hace. */}
            {usuario?.rol === 'administrador' && (
              <NavLink to="/dashboard/inventario" className="dashboard-nav-link">
                <Warehouse size={18} />
                Gestionar Inventario
              </NavLink>
            )}

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
      </aside>

      <main className="dashboard-content">
        <Outlet />
      </main>
    </div>
  )
}

export default DashboardLayout
