/* eslint-disable react/prop-types -- venta viene tal cual del listado agrupado en ventas.jsx, sin PropTypes en el resto del feature */
import Modal from '../../components/ui/Modal.jsx'
import { Calendar, Clock, User } from 'lucide-react'
import './styles/ventaDetalleModal.css'

function VentaDetalleModal({ venta, onClose }) {
  const fecha = new Date(venta.fecha)
  const numeroVenta = String(venta.venta_id).padStart(6, '0')

  return (
    <Modal title={`Venta Nº${numeroVenta}`} onClose={onClose}>
      <div className="venta-modal-info">
        <span className="venta-modal-dato">
          <Calendar size={14} />
          {fecha.toLocaleDateString()}
        </span>
        <span className="venta-modal-dato">
          <Clock size={14} />
          {fecha.toLocaleTimeString()}
        </span>
        <span className="venta-modal-dato">
          <User size={14} />
          {venta.usuario}
        </span>
      </div>

      <ul className="venta-modal-productos">
        {venta.productos.map((producto, index) => (
          <li key={index} className="venta-modal-producto">
            <span className="venta-modal-producto-nombre">{producto.producto_nombre}</span>
            <span className="venta-modal-producto-cantidad">Cant.: {producto.cantidad_producto}</span>
            <span className="venta-modal-producto-unitario">${producto.precio_unitario} c/u</span>
            <span className="venta-modal-producto-total">${producto.precio_total_producto}</span>
          </li>
        ))}
      </ul>

      <div className="venta-modal-total">
        <span>Total</span>
        <span>${venta.precio_total}</span>
      </div>
    </Modal>
  )
}

export default VentaDetalleModal
