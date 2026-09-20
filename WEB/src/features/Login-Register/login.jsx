import './styles/authPanel.css'
import '../../styles/dashboardPanels.css'
import '../Lobby/styles/lobby.css'
import useLogin from '../../hooks/Login-Register/useLogin'
import { useState, useEffect } from "react";
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { LogIn, Eye, EyeOff, CheckCircle2, ArrowLeft, Loader2 } from 'lucide-react';

// Panel de Login: vive embebido en la sidebar del Lobby (ver lobby.jsx),
// no es una página propia. Reemplaza al panel de bienvenida o al de
// Register con una animación de slide cuando cambia la ruta.
function Login() {
    const { login, loading, error } = useLogin()
    // El registro de cuentas nuevas está deshabilitado (ver register.jsx) -
    // como única cuenta disponible es esta demo, el login arranca con sus
    // credenciales ya cargadas y los campos bloqueados: el usuario solo
    // tiene que tocar "Iniciar sesión" para entrar, sin tener que copiarlas
    // a mano desde la nota de más abajo.
    const [user, setUser] = useState('Test')
    const [password, setPassword] = useState('Test1234')
    const [showPassword, setShowPassword] = useState(false)

    const navigate = useNavigate();
    const location = useLocation();
    // Viene desde el panel de Register recién completado con éxito.
    const recienRegistrado = Boolean(location.state?.registered)

    // Si el usuario ya inició sesión, no tiene sentido quedarse en el panel
    // de login: se va directo al Dashboard.
    useEffect(() => {
      const token = localStorage.getItem('token')
      if(token) {
        navigate("/dashboard")
      }
    }, [navigate])

    // Login exitoso: slide de pantalla completa hacia el Dashboard (ver
    // RootTransition.jsx), no vuelve al panel de bienvenida.
    const handleSubmit = async(e) => {
        e.preventDefault()
        const result = await login(user, password)
        if(result.success){
          navigate("/dashboard")
        }
    }

  return (
    <div className="auth-screen">
      {/* Mismo estilo que el botón "Iniciar Sesión" de la Introducción
          (.lobby-cta), en el mismo espacio vertical pero invertido: allá
          va abajo, acá va arriba, con el mismo margen (viene del padding
          simétrico de .lobby-panel). */}
      <button
        type="button"
        className="lobby-cta"
        onClick={() => navigate('/')}
      >
        <ArrowLeft size={18} />
        Introducción
      </button>

      <div className="auth-panel">
        <div className="auth-panel-top">
          <div className="auth-icon-badge">
            <LogIn size={24} strokeWidth={2.2} />
          </div>
          <h2 className="auth-title">Inicia Sesión</h2>

          {recienRegistrado && (
            <div className="auth-success-banner">
              <CheckCircle2 size={18} />
              <span>¡Registro exitoso! Ahora iniciá sesión con tu cuenta.</span>
            </div>
          )}
        </div>

        <form className="auth-form" onSubmit={handleSubmit}>
          <div className='auth-field'>
              <label htmlFor="user">Nombre de Usuario</label>
              <input
                  className='auth-input'
                  type="text"
                  name='user'
                  id='user'
                  placeholder='Ingrese su nombre de usuario'
                  value={user}
                  onChange={(e) => setUser(e.target.value)}
                  disabled
                  required/>
          </div>
          <div className='auth-field'>
              <label htmlFor="password">Contraseña</label>
              <div className="auth-password-field">
                <input
                    className='auth-input'
                    type={showPassword ? 'text' : 'password'}
                    name='password'
                    id='password'
                    placeholder='Ingrese su contraseña'
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    disabled
                    required/>
                <button
                    type="button"
                    className="auth-toggle-visibility"
                    onClick={() => setShowPassword((v) => !v)}
                    aria-label={showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
          </div>
          <button type="submit" disabled={loading} className='auth-submit'>
            {loading ? (
              <>
                <Loader2 size={18} className="panel-spinner" />
                Iniciando sesión...
              </>
            ) : 'Iniciar sesión'}
          </button>
          {Array.isArray(error) && error.length > 0 && (
              <div>
                {error.map((err, index) => (
                  <p className="auth-error" key={index}>{err.msg}</p>
                ))}
              </div>
            )}
        </form>

        <p className="auth-switch">¿No tienes cuenta? <Link to="/register" className='auth-link'>Regístrate</Link></p>
      </div>
    </div>
  )
}

export default Login
