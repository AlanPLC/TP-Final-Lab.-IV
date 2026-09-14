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
// la app). value/onChange trabajan con fechas "YYYY-MM-DD" en texto.
// eslint-disable-next-line react/prop-types
function Calendar({ value, onChange }) {
  const selected = value ? new Date(`${value}T00:00:00`) : null
  const [viewDate, setViewDate] = useState(selected ?? new Date())

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

  const esHoy = (d) => {
    const hoy = new Date()
    return hoy.getFullYear() === year && hoy.getMonth() === month && hoy.getDate() === d
  }

  return (
    <div className="calendar">
      <div className="calendar-header">
        <button type="button" onClick={() => setViewDate(new Date(year, month - 1, 1))} aria-label="Mes anterior">
          <ChevronLeft size={16} />
        </button>
        <span>{MESES[month]} {year}</span>
        <button type="button" onClick={() => setViewDate(new Date(year, month + 1, 1))} aria-label="Mes siguiente">
          <ChevronRight size={16} />
        </button>
      </div>
      <div className="calendar-weekdays">
        {DIAS.map((d) => <span key={d}>{d}</span>)}
      </div>
      <div className="calendar-grid">
        {celdas.map((d, index) => (
          <button
            key={index}
            type="button"
            tabIndex={d ? 0 : -1}
            className={`calendar-day${d ? '' : ' empty'}${d && esSeleccionado(d) ? ' selected' : ''}${d && esHoy(d) ? ' today' : ''}`}
            disabled={!d}
            onClick={() => d && onChange(toISODate(new Date(year, month, d)))}
          >
            {d ?? ''}
          </button>
        ))}
      </div>
    </div>
  )
}

export default Calendar
