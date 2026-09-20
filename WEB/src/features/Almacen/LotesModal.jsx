/* eslint-disable react/prop-types -- producto viene tal cual del listado de useAlmacen, sin PropTypes en el resto del feature */
import { useState, useEffect } from 'react'
import Modal from '../../components/ui/Modal.jsx'
import SmoothWidth from '../../components/ui/SmoothWidth.jsx'
import useAlmacen from '../../hooks/Almacen/useAlmacen.jsx'
import { getProductIcon } from '../../constants/productIcons.js'
import { ArrowUpDown } from 'lucide-react'
import './styles/lotesModal.css'

// "activo": todavía queda stock de ese lote. "agotado": ya se vendió todo.
const FILTROS_ESTADO = [
  { key: 'todos', label: 'Todos' },
  { key: 'activo', label: 'Con stock' },
  { key: 'agotado', label: 'Sin stock' },
]

function LotesModal({ producto, onClose }) {
  const { getLotes } = useAlmacen()
  const [lotes, setLotes] = useState([])
  const [cargando, setCargando] = useState(true)
  const [filtroEstado, setFiltroEstado] = useState('todos')
  // true = más viejo primero (por fecha de ingreso) - el pedido explícito;
  // el botón de al lado lo invierte a más nuevo primero.
  const [masViejoPrimero, setMasViejoPrimero] = useState(true)

  useEffect(() => {
    let vigente = true
    setCargando(true)
    getLotes(producto.producto_id).then((result) => {
      if (!vigente) return
      if (result.success) setLotes(result.data)
      setCargando(false)
    })
    return () => {
      vigente = false
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [producto.producto_id])

  const ProductoIcon = getProductIcon(producto.imagen_url)

  const lotesFiltrados = lotes
    .filter((lote) => {
      if (filtroEstado === 'activo') return lote.cantidad_restante > 0
      if (filtroEstado === 'agotado') return lote.cantidad_restante <= 0
      return true
    })
    .slice()
    .sort((a, b) => {
      const diff = new Date(a.fecha_ingreso) - new Date(b.fecha_ingreso)
      return masViejoPrimero ? diff : -diff
    })

  return (
    <Modal title="Lotes del producto" onClose={onClose}>
      <div className="lotes-modal-producto">
        <div className="producto-icono" aria-hidden="true">
          <ProductoIcon size={32} strokeWidth={1.8} />
        </div>
        <div className="lotes-modal-producto-info">
          <p className="lotes-modal-nombre">{producto.producto_nombre}</p>
          <div className="lotes-modal-meta">
            <span className="lotes-modal-categoria">{producto.categoria_nombre}</span>
            {producto.precio != null ? (
              <span className="lotes-modal-precio">${producto.precio}</span>
            ) : (
              <span className="lotes-modal-sin-precio">(Precio de venta no definido)</span>
            )}
          </div>
        </div>
      </div>

      <div className="lotes-modal-filtros">
        <div className="segmented-bar lotes-filtro-estado">
          {FILTROS_ESTADO.map((f) => (
            <button
              key={f.key}
              type="button"
              className={filtroEstado === f.key ? 'active' : ''}
              onClick={() => setFiltroEstado(f.key)}
            >
              {f.label}
            </button>
          ))}
        </div>
        <button
          type="button"
          className="lotes-orden-toggle"
          onClick={() => setMasViejoPrimero((v) => !v)}
        >
          <ArrowUpDown size={14} />
          <SmoothWidth>{masViejoPrimero ? 'Más viejo primero' : 'Más nuevo primero'}</SmoothWidth>
        </button>
      </div>

      {cargando ? (
        <p className="panel-empty">Cargando...</p>
      ) : lotesFiltrados.length > 0 ? (
        <div className="lotes-modal-lista">
          {lotesFiltrados.map((lote) => {
            const agotado = lote.cantidad_restante <= 0
            return (
              <div key={lote.id} className="lote-card">
                <div className="lote-card-top">
                  <span className="lote-card-proveedor">{lote.proveedor_nombre}</span>
                  <span className={`lote-card-estado${agotado ? ' agotado' : ''}`}>
                    {agotado ? 'Agotado' : 'Con stock'}
                  </span>
                </div>
                <div className="lote-card-grid">
                  <div>
                    <span className="lote-card-label">Cantidad</span>
                    <span className="lote-card-valor">{lote.cantidad_restante} / {lote.cantidad_inicial}</span>
                  </div>
                  <div>
                    <span className="lote-card-label">Costo unitario</span>
                    <span className="lote-card-valor">${lote.precio_costo}</span>
                  </div>
                  <div>
                    <span className="lote-card-label">Ingreso</span>
                    <span className="lote-card-valor">{new Date(lote.fecha_ingreso).toLocaleDateString()}</span>
                  </div>
                  <div>
                    <span className="lote-card-label">Vencimiento</span>
                    <span className="lote-card-valor">
                      {lote.fecha_vencimiento ? new Date(lote.fecha_vencimiento).toLocaleDateString() : 'Sin vencimiento'}
                    </span>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      ) : (
        <p className="panel-empty">
          {filtroEstado === 'todos'
            ? 'Este producto no tiene lotes cargados.'
            : 'No hay lotes que coincidan con el filtro elegido.'}
        </p>
      )}
    </Modal>
  )
}

export default LotesModal
