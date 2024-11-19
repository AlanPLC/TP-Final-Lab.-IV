import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Navbar from "./components/navbar.jsx"
import Lobby from "./features/Lobby/lobby.jsx"
import Login from "./features/Login-Register/login.jsx"
import Register from "./features/Login-Register/register.jsx"
import Productos from './features/Productos/productos.jsx';
import Ventas from './features/Ventas/ventas.jsx'

import './styles/App.css'
// Componente para proteger rutas sin estar logueado.
import ProtectedRoute from './components/protecRoute.jsx';

function App() {

  return (
    <>
      <Router>
        <Navbar />
        <Routes>
          <Route path="/" element={<Lobby />}/>
          <Route path="/login" element={<Login/>}/>
          <Route path="/register" element={<Register/>}/>

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
        </Routes>
      </Router>
    </>
  )
}

export default App