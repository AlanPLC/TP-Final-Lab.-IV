import './styles/navbar.css';
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useState, useEffect } from "react";
import { jwtDecode } from "jwt-decode";

const Navbar = () => {
    const [autenticado, setAutenticado] = useState(false)
    const [rol, setRol] = useState(null)
    const navigate = useNavigate()
    const location = useLocation()


    useEffect(()=>{
        const token = localStorage.getItem('token')
        if (token) {
            try {
                const decoded = jwtDecode(token);
                console.log(decoded)

                // Verificar si el token ha expirado
                const currentTime = Math.floor(Date.now() / 1000); // Convertir tiempo actual a segundos
                if (decoded.exp < currentTime) {
                    localStorage.removeItem('token');
                    setAutenticado(false);
                    setRol(null);

                    alert('Tu sesión ha expirado. Por favor, inicia sesión nuevamente.');
                    navigate('/login'); 
                } else {
                    setAutenticado(true);
                    setRol(decoded.rol);
                }
            } catch (err) {
                // Redirige si el token es inválido
                localStorage.removeItem('token');
                console.error("Error al decodificar el token:", err);
                setAutenticado(false);
                setRol(null);
                navigate('/login'); 
            }
        } else {
            setAutenticado(false);
            setRol(null);
        }
    },[location, navigate])

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
                <li><Link className="items" to="/ventas">
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