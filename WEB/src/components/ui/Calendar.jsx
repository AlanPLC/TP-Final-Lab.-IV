import { useState } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import './styles/ui.css'

const DIAS = ['Lu', 'Ma', 'Mi', 'Ju', 'Vi', 'Sá', 'Do']
const MESES = [
  'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
  'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre',
]

function toISODate(date) {
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, '0')
  const d = String(date.getDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
}

// Calendario propio (en vez de <input type="date">, que el navegador dibuja
// con su UI nativa y no se puede llevar a la paleta/tipografía del resto de
// la app). Dos modos:
// - Fecha única (Almacen: vencimiento de un lote): value/onChange, fechas
//   "YYYY-MM-DD" en texto.
// - Rango (Historial de Ventas: filtro por fechas): se activa pasando
//   onRangeSelect en vez de onChange. rangeStart/rangeEnd son el rango
//   actual; el primer click define el inicio, el segundo el fin (si el
//   segundo click cae antes del inicio, se invierten solos). Un tercer click
//   arranca un rango nuevo.
// minDate/maxDate (mismo formato, ambos modos) deshabilitan los días fuera
// de ese rango - minDate lo usa el vencimiento (no puede ser una fecha
// pasada); maxDate lo usa el modo fecha única cuando hace falta acotar por
// arriba.
// eslint-disable-next-line react/prop-types
function Calendar({ value, onChange, minDate, maxDate, rangeStart, rangeEnd, onRangeSelect }) {
  const modoRango = !!onRangeSelect
  const selected = !modoRango && value ? new Date(`${value}T00:00:00`) : null
  const inicio = rangeStart ? new Date(`${rangeStart}T00:00:00`) : null
  const fin = rangeEnd ? new Date(`${rangeEnd}T00:00:00`) : null
  const minDateObj = minDate ? new Date(`${minDate}T00:00:00`) : null
  const maxDateObj = maxDate ? new Date(`${maxDate}T00:00:00`) : null
  const [viewDate, setViewDate] = useState(selected ?? inicio ?? minDateObj ?? new Date())

  const year = viewDate.getFullYear()
  const month = viewDate.getMonth()
  const firstOfMonth = new Date(year, month, 1)
  // getDay(): 0=domingo..6=sábado. Se corre para que la semana arranque en lunes.
  const startOffset = (firstOfMonth.getDay() + 6) % 7
  const daysInMonth = new Date(year, month + 1, 0).getDate()

  const celdas = []
  for (let i = 0; i < startOffset; i++) celdas.push(null)
  for (let d = 1; d <= daysInMonth; d++) celdas.push(d)

  const esSeleccionado = (d) =>
    !!selected &&
    selected.getFullYear() === year &&
    selected.getMonth() === month &&
    selected.getDate() === d

  const mismoDia = (fecha, d) =>
    !!fecha && fecha.getFullYear() === year && fecha.getMonth() === month && fecha.getDate() === d
  const esInicioDeRango = (d) => mismoDia(inicio, d)
  const esFinDeRango = (d) => mismoDia(fin, d)
  // Días estrictamente entre el inicio y el fin (los extremos ya tienen su
  // propio estilo, más marcado) - franja plana para que se vea como un
  // único rango continuo en vez de días sueltos.
  const esDentroDeRango = (d) => {
    if (!inicio || !fin) return false
    const fecha = new Date(year, month, d)
    return fecha > inicio && fecha < fin
  }

  const clickearDia = (d) => {
    const fecha = new Date(year, month, d)
    if (!modoRango) {
      onChange(toISODate(fecha))
      return
    }
    // Sin inicio, o ya había un rango completo (inicio y fin): arranca uno
    // nuevo. Con solo el inicio puesto: este click define el fin (invirtiendo
    // el orden si cae antes del inicio).
    if (!inicio || (inicio && fin)) {
      onRangeSelect(toISODate(fecha), null)
    } else if (fecha < inicio) {
      onRangeSelect(toISODate(fecha), rangeStart)
    } else {
      onRangeSelect(rangeStart, toISODate(fecha))
    }
  }

  const esHoy = (d) => {
    const hoy = new Date()
    return hoy.getFullYear() === year && hoy.getMonth() === month && hoy.getDate() === d
  }

  const esDeshabilitado = (d) =>
    (!!minDateObj && new Date(year, month, d) < minDateObj) ||
    (!!maxDateObj && new Date(year, month, d) > maxDateObj)

  // No tiene sentido dejar navegar a un mes que va a salir 100% deshabilitado.
  const mesAnteriorDeshabilitado =
    !!minDateObj && year === minDateObj.getFullYear() && month <= minDateObj.getMonth()
  const mesSiguienteDeshabilitado =
    !!maxDateObj && year === maxDateObj.getFullYear() && month >= maxDateObj.getMonth()

  return (
    <div className="calendar">
      <div className="calendar-header">
        <button
          type="button"
          onClick={() => setViewDate(new Date(year, month - 1, 1))}
          disabled={mesAnteriorDeshabilitado}
          aria-label="Mes anterior"
        >
          <ChevronLeft size={16} />
        </button>
        <span>{MESES[month]} {year}</span>
        <button
          type="button"
          onClick={() => setViewDate(new Date(year, month + 1, 1))}
          disabled={mesSiguienteDeshabilitado}
          aria-label="Mes siguiente"
        >
          <ChevronRight size={16} />
        </button>
      </div>
      <div className="calendar-weekdays">
        {DIAS.map((d) => <span key={d}>{d}</span>)}
      </div>
      <div className="calendar-grid">
        {celdas.map((d, index) => {
          const marcado = d && (modoRango ? esInicioDeRango(d) || esFinDeRango(d) : esSeleccionado(d))
          return (
          <button
            key={index}
            type="button"
            tabIndex={d ? 0 : -1}
            className={`calendar-day${d ? '' : ' empty'}${marcado ? ' selected' : ''}${d && modoRango && esDentroDeRango(d) ? ' in-range' : ''}${d && esHoy(d) ? ' today' : ''}`}
            disabled={!d || esDeshabilitado(d)}
            onClick={() => d && clickearDia(d)}
          >
            {d ?? ''}
          </button>
        )})}
      </div>
    </div>
  )
}

export default Calendar
