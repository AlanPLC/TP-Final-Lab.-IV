import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import RootTransition from "./components/RootTransition.jsx"
import Lobby from "./features/Lobby/lobby.jsx"
import WelcomePanel from "./features/Lobby/welcomePanel.jsx"
import Login from "./features/Login-Register/login.jsx"
import Register from "./features/Login-Register/register.jsx"
import DashboardLayout from "./features/Dashboard/dashboardLayout.jsx"
import DashboardHome from "./features/Dashboard/dashboardHome.jsx"
import Productos from './features/Productos/productos.jsx';
import Ventas from './features/Ventas/ventas.jsx'
import Proveedores from './features/Proveedores/proveedores.jsx';
import Almacen from './features/Almacen/almacen.jsx'
import './styles/App.css'
// Componente para proteger rutas sin estar logueado.
import ProtectedRoute from './components/protecRoute.jsx';

function App() {

  return (
    <>
      <Router>
        <Routes>
          {/* RootTransition anima con un slide de pantalla completa el
              cruce entre la zona pública (Lobby: bienvenida/login/register)
              y la zona logueada (Dashboard) - ver RootTransition.jsx. */}
          <Route element={<RootTransition />}>

            {/* Lobby es un layout persistente (gif + sidebar): el panel que
                se ve dentro de la sidebar cambia según la sub-ruta, animado
                con su propio slide interno (ver lobby.jsx). Login/Register
                viven embebidos ahí, no son páginas propias. */}
            <Route path="/" element={<Lobby />}>
              <Route index element={<WelcomePanel />}/>
              <Route path="login" element={<Login/>}/>
              <Route path="register" element={<Register/>}/>
            </Route>

            {/* Dashboard es el layout persistente de toda la app logueada:
                sidebar (secciones + usuario + cerrar sesión) a la izquierda,
                reemplaza a la vieja navbar de arriba. */}
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute>
                  <DashboardLayout />
                </ProtectedRoute>
              }
            >
              <Route index element={<DashboardHome />}/>
              <Route path="productos" element={<Productos />}/>
              <Route path="ventas" element={<Ventas />}/>
              <Route path="proveedores" element={<Proveedores />}/>
              <Route path="inventario" element={<Almacen />}/>
            </Route>

          </Route>
        </Routes>
      </Router>
    </>
  )
}

export default App
