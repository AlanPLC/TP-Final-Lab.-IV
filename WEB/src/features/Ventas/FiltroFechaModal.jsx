/* eslint-disable react/prop-types -- ver el resto del feature, no usa PropTypes */
import { useState } from 'react'
import Modal from '../../components/ui/Modal.jsx'
import Calendar from '../../components/ui/Calendar.jsx'
import './styles/filtroFechaModal.css'

// Modal con un único calendario en modo rango (mismo componente que usa
// Almacen para el vencimiento de un lote, ver onRangeSelect en Calendar.jsx):
// un click elige el "desde", el siguiente el "hasta".
function FiltroFechaModal({ desde, hasta, onAplicar, onClose }) {
  const [rango, setRango] = useState({ desde: desde || '', hasta: hasta || '' })

  const aplicar = () => {
    onAplicar(rango)
    onClose()
  }
  const limpiar = () => {
    onAplicar({ desde: '', hasta: '' })
    onClose()
  }

  return (
    <Modal title="Elegir rango de fechas" onClose={onClose}>
      <div className="filtro-fecha-calendario">
        <Calendar
          rangeStart={rango.desde || null}
          rangeEnd={rango.hasta || null}
          onRangeSelect={(nuevoDesde, nuevoHasta) => setRango({ desde: nuevoDesde || '', hasta: nuevoHasta || '' })}
        />
      </div>
      <div className="filtro-fecha-acciones">
        <button type="button" className="panel-button panel-button-secondary" onClick={limpiar}>
          Limpiar
        </button>
        <button type="button" className="panel-button panel-button-primary" onClick={aplicar} disabled={!rango.desde && !rango.hasta}>
          Aplicar
        </button>
      </div>
    </Modal>
  )
}

export default FiltroFechaModal
