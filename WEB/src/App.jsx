import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Lobby from "./features/Lobby/lobby.jsx"
import Login from "./features/Login-Register/login.jsx"
import './styles/App.css'

function App() {

  return (
    <>
      <Router>
        <Routes>
          <Route path="/" element={<Lobby />}/>
          <Route path="/login" element={<Login/>}/>
        </Routes>
      </Router>
    </>
  )
}

export default App