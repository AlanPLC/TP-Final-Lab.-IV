/* eslint-disable react/prop-types -- proveedor viene tal cual del listado de useProveedores, sin PropTypes en el resto del feature */
import Modal from '../../components/ui/Modal.jsx'
import { getProductIcon } from '../../constants/productIcons.js'
import './styles/proveedorProductosModal.css'

function ProveedorProductosModal({ proveedor, onClose }) {
  // El LEFT JOIN del backend deja un único producto con id null cuando el
  // proveedor todavía no tiene ninguno cargado (ver getProveedoresConProductos).
  const tieneProductos = proveedor.productos.length > 0 && proveedor.productos[0].producto_id != null

  return (
    <Modal title={`Productos de ${proveedor.nombre}`} onClose={onClose}>
      {tieneProductos ? (
        <div className="proveedor-modal-lista">
          {proveedor.productos.map((producto) => {
            const ProductoIcon = getProductIcon(producto.producto_imagen_url)
            return (
              <div key={producto.producto_id} className="proveedor-modal-producto">
                <div className="producto-icono" aria-hidden="true">
                  <ProductoIcon size={26} strokeWidth={1.8} />
                </div>
                <div className="proveedor-modal-producto-info">
                  <p className="proveedor-modal-producto-nombre">{producto.producto_nombre}</p>
                  {producto.producto_categoria_nombre && (
                    <span className="proveedor-modal-producto-categoria">{producto.producto_categoria_nombre}</span>
                  )}
                </div>
                {producto.producto_costo_unitario != null ? (
                  <span className="proveedor-modal-producto-precio">${producto.producto_costo_unitario} c/u</span>
                ) : (
                  <span className="proveedor-modal-producto-sin-precio">(Sin costo registrado)</span>
                )}
              </div>
            )
          })}
        </div>
      ) : (
        <p className="panel-empty">Este proveedor todavía no tiene productos cargados.</p>
      )}
    </Modal>
  )
}

export default ProveedorProductosModal
