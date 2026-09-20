// Clave donde se deja el mensaje para Toast.jsx - sessionStorage (no un
// estado en memoria) porque expirarSesion() hace un window.location.href,
// que reinicia todo el runtime de JS: el mensaje tiene que sobrevivir a esa
// recarga para que el toast se vea recién en /login.
export const CLAVE_TOAST_SESION = 'bitward:toast'

// Dispara el flujo de "sesión expirada": saca el token, deja el aviso
// pendiente para el toast y manda al login. Lo llaman tanto el interceptor
// de fetch (ver apiInterceptor.js, ante un 401 real de la API) como
// ProtectedRoute (ante un token vencido detectado localmente sin llegar a
// pedir nada) - un solo lugar para no repetir la lógica en los dos.
export function expirarSesion(mensaje = 'Tu sesión expiró. Iniciá sesión nuevamente.') {
  localStorage.removeItem('token')
  sessionStorage.setItem(CLAVE_TOAST_SESION, mensaje)
  if (!window.location.pathname.startsWith('/login')) {
    window.location.href = '/login'
  }
}
