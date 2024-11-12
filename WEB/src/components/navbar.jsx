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
                <li><Link className="items" to="/">
                    <p>Productos</p>
                </Link></li>
                <li><Link className="items" to="/">
                    <p>Proveedores</p>
                </Link></li>
                <li><Link className="items" to="/">
                    <p>Ventas</p>
                </Link></li>
                <li><Link className="items" to="/">
                    <p>Administrar</p>
                </Link></li>


            </ul>
            {autenticado && (
                <button className="logout-button"onClick={logout}>Cerrar Sesión</button>
            )}

            {!autenticado && location.pathname !== "/login" && (
                <div className='cont-login'>
                    <img src='/user.png' alt="Logo" className='user-logo'/>
                    <Link className="login" to="/login">
                        <p>Iniciar Sesión</p>
                    </Link>
                </div>
            )}
        </nav>
    </div>
  );
};

export default Navbar;