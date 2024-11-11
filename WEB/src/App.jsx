import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Lobby from "./features/Lobby/lobby.jsx"
import Login from "./features/Login-Register/login.jsx"
import Register from "./features/Login-Register/register.jsx"

// Componente para proteger rutas sin estar logueado.
// import ProtectedRoute from './components/protecRoute.jsx';
import './styles/App.css'

function App() {

  return (
    <>
      <Router>
        <Routes>
          <Route path="/" element={<Lobby />}/>
          <Route path="/login" element={<Login/>}/>
          <Route path="/register" element={<Register/>}/>

          {/* Ejemplo de como se debería utilizar protectedRoute */}
          {/* <Route path="/productos" element={
            <ProtectedRoute>
              <Productos />
            </ProtectedRoute>
          }/> */}
        </Routes>
      </Router>
    </>
  )
}

export default App