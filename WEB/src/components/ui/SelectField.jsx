import { useEffect, useRef, useState, Children, isValidElement } from 'react'
import { createPortal } from 'react-dom'
import { ChevronDown } from 'lucide-react'
import './styles/ui.css'

// Select estilizado tipo Destino Turístico: un <select> nativo no se puede
// customizar (el dropdown lo dibuja el SO), así que esto lo reemplaza con
// un botón + listbox propios, pero manteniendo la MISMA API de llamada que
// un <select onChange> con hijos <option> - así los call-sites no cambian.
// eslint-disable-next-line react/prop-types
function SelectField({ id, name, value, onChange, disabled, children }) {
  const [open, setOpen] = useState(false)
  // Posición del listbox en coordenadas de viewport (ver por qué en el
  // comentario de más abajo, donde se abre con createPortal).
  const [coords, setCoords] = useState(null)
  const rootRef = useRef(null)
  const triggerRef = useRef(null)
  const listboxRef = useRef(null)

  const allOptions = Children.toArray(children)
    .filter(isValidElement)
    .map((child) => ({
      value: child.props.value,
      label: child.props.children,
      disabled: !!child.props.disabled,
    }))

  // La opción deshabilitada (el placeholder, ej. <option value="" disabled>Categoría</option>)
  // no es elegible en la lista - solo presta su texto como placeholder cuando no hay valor.
  const placeholder = allOptions.find((o) => o.disabled)
  const options = allOptions.filter((o) => !o.disabled)
  const selected = options.find((o) => String(o.value) === String(value))

  const medirYAbrir = () => {
    const rect = triggerRef.current?.getBoundingClientRect()
    if (!rect) return
    setCoords({ top: rect.bottom + 4, left: rect.left, width: rect.width })
    setOpen(true)
  }

  useEffect(() => {
    if (!open) return
    const onPointerDown = (e) => {
      const dentroDelTrigger = rootRef.current?.contains(e.target)
      const dentroDelListbox = listboxRef.current?.contains(e.target)
      if (!dentroDelTrigger && !dentroDelListbox) setOpen(false)
    }
    const onKeyDown = (e) => {
      if (e.key === 'Escape') setOpen(false)
    }
    // El listbox vive en un portal (ver más abajo) para escapar del
    // overflow:hidden del panel que lo contiene (si no, quedaba recortado
    // cerca del borde inferior en vez de flotar por encima del resto del
    // contenido). Sin posición "pegada" al trigger vía CSS, hay que cerrar
    // el listbox si la página scrollea por debajo - simple y sin los dolores
    // de cabeza de recalcular la posición en cada scroll. El scroll DENTRO
    // del propio listbox (para ver más opciones) no debe cerrarlo.
    const onScroll = (e) => {
      if (listboxRef.current?.contains(e.target)) return
      setOpen(false)
    }
    // El resize, a diferencia del scroll, no tiene un e.target utilizable
    // (es la window) - siempre cierra, sin chequear nada.
    const onResize = () => setOpen(false)
    document.addEventListener('mousedown', onPointerDown)
    document.addEventListener('keydown', onKeyDown)
    window.addEventListener('scroll', onScroll, true)
    window.addEventListener('resize', onResize)
    return () => {
      document.removeEventListener('mousedown', onPointerDown)
      document.removeEventListener('keydown', onKeyDown)
      window.removeEventListener('scroll', onScroll, true)
      window.removeEventListener('resize', onResize)
    }
  }, [open])

  const pick = (opt) => {
    onChange?.({ target: { name, value: opt.value } })
    setOpen(false)
  }

  return (
    <div className="select-field" ref={rootRef}>
      <button
        type="button"
        id={id}
        ref={triggerRef}
        className={`select-trigger${open ? ' open' : ''}`}
        onClick={() => !disabled && (open ? setOpen(false) : medirYAbrir())}
        disabled={disabled}
        aria-haspopup="listbox"
        aria-expanded={open}
      >
        <span className={selected ? 'select-value' : 'select-placeholder'}>
          {selected ? selected.label : placeholder?.label}
        </span>
        <ChevronDown size={16} />
      </button>
      {open && coords && createPortal(
        <ul
          ref={listboxRef}
          className="select-listbox"
          role="listbox"
          style={{ top: coords.top, left: coords.left, width: coords.width }}
        >
          {options.length > 0 ? options.map((opt) => (
            <li
              key={opt.value}
              role="option"
              aria-selected={String(opt.value) === String(value)}
              className={`select-option${String(opt.value) === String(value) ? ' selected' : ''}`}
              onClick={() => pick(opt)}
            >
              {opt.label}
            </li>
          )) : (
            <li className="select-option-empty">Sin opciones</li>
          )}
        </ul>,
        document.body
      )}
    </div>
  )
}

export default SelectField
