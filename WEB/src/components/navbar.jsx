import './styles/navbar.css';
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useState, useEffect } from "react";
import { jwtDecode } from "jwt-decode";

const Navbar = () => {
    const [autenticado, setAutenticado] = useState(false)
    const [rol, setRol] = useState(null)
    const navigate = useNavigate()
    const location = useLocation()

    // Se ejecuta una vez que se renderiza el componente Navbar 
    // y actualiza el estado de rol y autenticado según el token
    useEffect(()=>{
        const token = localStorage.getItem('token')
        if(token){
            const decoded = jwtDecode(token);
            setAutenticado(true)
            console.log(decoded)
            setRol(decoded.rol)
        } else {
            setAutenticado(false)
            setRol(null)
        }
    },[location])

    // Funcion para cerrar sesión, elimina el token de localStorage
    const logout = () => {
        localStorage.removeItem('token')
        setAutenticado(false)
        navigate('/')
    }

    // Componente Navbar
  return(
    <div className='navbar-container'> 
        <nav>
            <ul>
                <li><Link className="items" to="/">
                    <p >Inicio</p>
                </Link></li>
                <li><Link className="items" to="/productos">
                    <p>Productos</p>
                </Link></li>
                <li><Link className="items" to="/">
                    <p>Proveedores</p>
                </Link></li>
                <li><Link className="items" to="/">
                    <p>Ventas</p>
                </Link></li>
                {rol === 'administrador' && (
                    <li><Link className="items" to="/">
                        <p>Administrar</p>
                    </Link></li>
                )}

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