import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.jsx'
// Antes de renderizar nada: parchea window.fetch para renovar el token de
// sesión en cada respuesta y detectar un 401 real como sesión expirada (ver
// utils/apiInterceptor.js) - un solo lugar en vez de tocar cada hook.
import './utils/apiInterceptor.js'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
