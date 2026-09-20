import './styles/authPanel.css'
import '../../styles/dashboardPanels.css'
import '../Lobby/styles/lobby.css'
import { useState, useEffect } from "react";
import { useNavigate, Link } from 'react-router-dom';
import useRegister from '../../hooks/Login-Register/useRegister.jsx';
import { UserPlus, Eye, EyeOff, ArrowLeft, Loader2 } from 'lucide-react';

// Panel de Register: vive embebido en la sidebar del Lobby (ver lobby.jsx),
// misma paleta azul que Login (ya no se diferencian por color, viven en el
// mismo lugar en momentos distintos).
function Register() {
    const { register, loading, error } = useRegister()
    const [user, setUser] = useState('')
    const [password, setPassword] = useState('')
    const [showPassword, setShowPassword] = useState(false)

    const navigate = useNavigate();

    // Si el usuario ya inició sesión, no tiene sentido quedarse en el panel
    // de register: se va directo al Dashboard.
    useEffect(() => {
      const token = localStorage.getItem('token')
      if(token) {
        navigate("/dashboard")
      }
    }, [navigate])

    // Al registrarse con éxito manda al panel de Login (no al de bienvenida),
    // para que inicie sesión con la cuenta recién creada.
    const handleSubmit = async(e) => {
        e.preventDefault()
        const result = await register(user, password)
        if(result.success){
          navigate("/login", { state: { registered: true } })
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
            <UserPlus size={24} strokeWidth={2.2} />
          </div>
          <h2 className="auth-title">Regístrate</h2>
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
          <button type="submit" disabled={true} className='auth-submit' title="Registro deshabilitado">
            {loading ? (
              <>
                <Loader2 size={18} className="panel-spinner" />
                Registrándote...
              </>
            ) : 'Registrarme'}
          </button>
          {Array.isArray(error) && error.length > 0 && (
              <div>
                {error.map((err, index) => (
                  <p className="auth-error" key={index}>{err.msg}</p>
                ))}
              </div>
          )}
        </form>

        <p className="auth-switch">¿Ya tienes una cuenta? <Link to="/login" className='auth-link'>Inicia sesión aquí...</Link></p>

        <div className="auth-demo-note">
          <p>El registro de cuentas nuevas está deshabilitado</p>
          <p>Usá la cuenta de prueba desde <Link to="/login" className='auth-link'>Inicia Sesión</Link></p>
        </div>
      </div>
    </div>
  )
}

export default Register
