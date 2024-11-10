import './styles/login.css'
import useLogin from '../../hooks/Login-Register/useLogin'
import { useState } from "react";

function Login() {
    const { login, loading, error } = useLogin()
    const [user, setUser] = useState('')
    const [password, setPassword] = useState('')

    const handleSubmit = async(e) => {
        e.preventDefault()
        const result = await login(user, password)
        if(result.success){
            console.log("Inicio de sesión exitoso.")
        }
    }
  return (
    <div className="login-form-container">
      <h1>Inicia Sesión</h1>
      <form className="login-form" onSubmit={handleSubmit}>
        <div className='user'>
            <label htmlFor="user">Nombre de Usuario</label>
            <input 
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
                type="password" 
                name='password'
                id='password' 
                placeholder='Ingrese su contraseña'
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required/>
        </div>
        <button type="submit" disabled={loading}>
          {loading ? 'Iniciando sesión...' : 'Iniciar sesión'}
        </button>
      </form>
      {error && <p style={{ color: 'red' }}>{error}</p>}
      <p>¿No tienes cuenta? <a href="/register">Regístrate</a></p>
    </div>
  )
}

export default Login