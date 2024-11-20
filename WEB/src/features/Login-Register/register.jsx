import './styles/register.css'
import { useState, useEffect } from "react";
import { useNavigate } from 'react-router-dom';
import useRegister from '../../hooks/Login-Register/useRegister.jsx';

function Register() {
    const { register, loading, error } = useRegister()
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

    // Disparador de Register, cuando se registra redirige al Lobby
    const handleSubmit = async(e) => {
        e.preventDefault()
        const result = await register(user, password)
        if(result.success){
          console.log("Registro exitoso.")
          navigate("/")
        }
    }

  return (
    <div className='register-main-container'>
      <div className="register-form-container">
        <h1>Regístrate</h1>
        <form className="register-form" onSubmit={handleSubmit}>
          <div className='user'>
              <label htmlFor="user">Nombre de Usuario</label>
              <input 
                  className='register-input'
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
                  className='register-input'
                  type="password" 
                  name='password'
                  id='password' 
                  placeholder='Ingrese su contraseña'
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required/>
          </div>
          <button type="submit" disabled={loading} className='register-button'>
            {loading ? 'Registrandote...' : 'Registrarme'}
          </button>
        </form>
        {Array.isArray(error) && error.length > 0 && (
              <div>
                {error.map((err, index) => (
                  <p className="error" key={index} style={{ color: 'red' }}>{err.msg}</p>
                ))}
              </div>
        )}
        <p>¿Ya tienes una cuenta? <a href="/login" className='redireccion'>Inicia sesión aquí...</a></p>
      </div>
    </div>
  )
}

export default Register