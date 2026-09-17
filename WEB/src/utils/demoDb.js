// "Base de datos" ficticia en localStorage para las cuentas no-admin (ver
// utils/rol.js y utils/apiInterceptor.js): en vez de escribir de verdad en
// la API, sus altas/ediciones/bajas quedan acá, en el navegador de quien
// esté probando la app. Los ids de lo creado localmente son siempre
// negativos, para no poder chocar nunca con un id real (que la API siempre
// devuelve positivo) - así alcanza con mirar el signo para saber si un id es
// local o real.
const CLAVE = 'bitward:demoDb'

function coleccionVacia() {
  return { creados: [], editados: {}, eliminados: [], contador: 0 }
}

function leerTodo() {
  try {
    const crudo = localStorage.getItem(CLAVE)
    return crudo ? JSON.parse(crudo) : {}
  } catch {
    return {}
  }
}

function guardarTodo(datos) {
  localStorage.setItem(CLAVE, JSON.stringify(datos))
}

function obtenerColeccion(nombre) {
  return leerTodo()[nombre] ?? coleccionVacia()
}

function guardarColeccion(nombre, coleccion) {
  const datos = leerTodo()
  datos[nombre] = coleccion
  guardarTodo(datos)
}

export function crear(nombre, campos) {
  const coleccion = obtenerColeccion(nombre)
  coleccion.contador -= 1
  const item = { ...campos, id: coleccion.contador }
  coleccion.creados.push(item)
  guardarColeccion(nombre, coleccion)
  return item
}

export function editar(nombre, id, cambios) {
  const coleccion = obtenerColeccion(nombre)
  if (id < 0) {
    const item = coleccion.creados.find((it) => it.id === id)
    if (item) Object.assign(item, cambios)
  } else {
    coleccion.editados[id] = { ...coleccion.editados[id], ...cambios }
  }
  guardarColeccion(nombre, coleccion)
}

export function eliminar(nombre, id) {
  const coleccion = obtenerColeccion(nombre)
  if (id < 0) {
    coleccion.creados = coleccion.creados.filter((it) => it.id !== id)
  } else if (!coleccion.eliminados.includes(id)) {
    coleccion.eliminados.push(id)
  }
  guardarColeccion(nombre, coleccion)
}

export function obtenerCreados(nombre) {
  return obtenerColeccion(nombre).creados
}

export function obtenerEditados(nombre, id) {
  return obtenerColeccion(nombre).editados[id]
}

export function estaEliminado(nombre, id) {
  return obtenerColeccion(nombre).eliminados.includes(id)
}

// Para el botón "Reiniciar demo" (ver dashboardLayout.jsx): borra todo lo
// simulado y deja la sesión como si nunca hubiese tocado nada.
export function vaciar() {
  localStorage.removeItem(CLAVE)
}
