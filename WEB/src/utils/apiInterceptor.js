import { expirarSesion } from './sesion.js'

// No hay un wrapper propio de fetch en la app (cada hook hace fetch directo
// con su propio Authorization header, ver hooks/*) - en vez de tocar los
// ~17 call sites para sumar esta lógica, se parchea fetch UNA sola vez acá
// (importado en main.jsx antes de renderizar) y afecta a todos por igual.
const fetchOriginal = window.fetch.bind(window)

window.fetch = async (...args) => {
  const response = await fetchOriginal(...args)

  // El backend renueva el JWT en cada request autenticado (ver
  // requireAuth.js) y lo manda por este header - la sesión sigue viva
  // mientras se sigan pidiendo cosas a la API, y solo expira de verdad si
  // pasa una hora entera sin ninguna.
  const tokenRenovado = response.headers.get('X-Renewed-Token')
  if (tokenRenovado) {
    localStorage.setItem('token', tokenRenovado)
  }

  // Un 401 solo cuenta como "sesión expirada" si la petición llevaba
  // Authorization - si no, es un fetch público (login/register) y un 401
  // ahí sería por otra cosa (o ni pasa, ver authController.js).
  if (response.status === 401 && teniaAuthorization(args[1])) {
    expirarSesion()
  }

  return response
}

function teniaAuthorization(init) {
  const headers = init?.headers
  if (!headers) return false
  if (headers instanceof Headers) return headers.has('Authorization')
  if (Array.isArray(headers)) return headers.some(([clave]) => clave.toLowerCase() === 'authorization')
  return Object.keys(headers).some((clave) => clave.toLowerCase() === 'authorization')
}
