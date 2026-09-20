import { jwtDecode } from 'jwt-decode'

function tokenDecodificado() {
  const token = localStorage.getItem('token')
  if (!token) return null
  try {
    return jwtDecode(token)
  } catch {
    return null
  }
}

// Distingue qué cuentas escriben de verdad en la DB (admin) de las que
// simulan sus cambios en localStorage (cualquier otra, hoy la única cuenta
// demo pública) - ver apiInterceptor.js. No es un permiso de UI: todas las
// cuentas siguen viendo y navegando lo mismo.
export function esAdmin() {
  return tokenDecodificado()?.rol === 'admin'
}

export function usuarioActual() {
  return tokenDecodificado()?.user ?? ''
}
