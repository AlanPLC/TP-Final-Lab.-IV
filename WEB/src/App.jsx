import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from "./components/navbar.jsx"
import Lobby from "./features/Lobby/lobby.jsx"
import WelcomePanel from "./features/Lobby/welcomePanel.jsx"
import Login from "./features/Login-Register/login.jsx"
import Register from "./features/Login-Register/register.jsx"
import Productos from './features/Productos/productos.jsx';
import Ventas from './features/Ventas/ventas.jsx'
import Proveedores from './features/Proveedores/proveedores.jsx';
import Almacen from './features/Almacen/almacen.jsx'
import AdminRoute from './components/adminProtect.jsx';
import './styles/App.css'
// Componente para proteger rutas sin estar logueado.
import ProtectedRoute from './components/protecRoute.jsx';

function App() {

  return (
    <>
      <Router>
        <Navbar />
        <Routes>
          {/* Lobby es un layout persistente (gif + sidebar): el panel que se
              ve dentro de la sidebar cambia según la sub-ruta, animado con
              un slide (ver lobby.jsx). Login/Register ya no son páginas
              propias, viven embebidos ahí. */}
          <Route path="/" element={<Lobby />}>
            <Route index element={<WelcomePanel />}/>
            <Route path="login" element={<Login/>}/>
            <Route path="register" element={<Register/>}/>
          </Route>

          {/*como debería utilizarse protectedRoute */}
          <Route path="/productos" element={
            <ProtectedRoute>
              <Productos />
            </ProtectedRoute>
          }/>

          <Route path="/ventas" element={
            <ProtectedRoute>
              <Ventas />
            </ProtectedRoute>
          }/>

          <Route path="/proveedores" element={
            <ProtectedRoute>
              <Proveedores />
            </ProtectedRoute>
          }/>

          <Route
            path="/administracion"
            element={
              <AdminRoute>
                <Almacen />
              </AdminRoute>
            }
          />
        </Routes>
      </Router>
    </>
  )
}

export default App