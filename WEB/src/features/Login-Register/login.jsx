import './styles/login.css'
import useLogin from '../../hooks/Login-Register/useLogin'
import { useState, useEffect } from "react";
import { useNavigate } from 'react-router-dom';

function Login() {
    const { login, loading, error } = useLogin()
    const [user, setUser] = useState('')
    const [password, setPassword] = useState('')

    const navigate = useNavigate();

    // Si el usuario ya inició sesión redirige al lobby
    useEffect(() => {
      const token = localStorage.getItem('token')
      if(token) {
        navigate("/")
      }
    }, [navigate])

    // Disparador de Login, cuando inicia sesión redirige al Lobby
    const handleSubmit = async(e) => {
        e.preventDefault()
        const result = await login(user, password)
        if(result.success){
          console.log("Inicio de sesión exitoso.")
          navigate("/")
        }
    }
  return (
    <div className="login-main-container">
      <div className="login-form-container">
        <h1>Inicia Sesión</h1>
        <form className="login-form" onSubmit={handleSubmit}>
          <div className='user'>
              <label htmlFor="user">Nombre de Usuario</label>
              <input 
                  className='login-input'
                  type="text" 
                  name='user'
                  id='user' 
                  placeholder='Ingrese su nombre de usuario'
                  value={user}
                  onChange={(e) => setUser(e.target.value)}
                  required/>
          </div>
          <div className='pass'>
              <label htmlFor="password">Contraseña</label>
              <input 
                  className='login-input'
                  type="password" 
                  name='password'
                  id='password' 
                  placeholder='Ingrese su contraseña'
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required/>
          </div>
          <button type="submit" disabled={loading} className='form-button'>
            {loading ? 'Iniciando sesión...' : 'Iniciar sesión'}
          </button>
        </form>
        {Array.isArray(error) && error.length > 0 && (
              <div>
                {error.map((err, index) => (
                  <p className="error" key={index} style={{ color: 'red' }}>{err.msg}</p>
                ))}
              </div>
            )}
        <p>¿No tienes cuenta? <a href="/register" className='redireccion'>Regístrate</a></p>
      </div>
    </div>
  )
}

export default Login