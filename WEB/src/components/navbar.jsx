import './styles/navbar.css';
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useState, useEffect } from "react";

const Navbar = () => {
    const [autenticado, setAutenticado] = useState(false)
    const navigate = useNavigate()
    const location = useLocation()

    useEffect(()=>{
        const token = localStorage.getItem('token')
        if(token){
            setAutenticado(true)
        } else {
            setAutenticado(false)
        }
    },[location])

    const logout = () => {
        localStorage.removeItem('token')
        setAutenticado(false)
        navigate('/')
    }

  return(
    <div className='navbar-container'> 
        <nav>
            <ul>
                <li><Link className="items" to="/">
                    <p >Inicio</p>
                </Link></li>

                {!autenticado && location.pathname !== "/login" && (
                    <li><Link className="items" to="/login">
                        <p >Iniciar Sesión</p>
                    </Link></li>
                )}

            </ul>
            {autenticado && (
                <button className="logout-button"onClick={logout}>Cerrar Sesión</button>
            )}
        </nav>
    </div>
  );
};

export default Navbar;