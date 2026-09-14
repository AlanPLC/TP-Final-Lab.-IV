import { useEffect, useRef, useState, Children, isValidElement } from 'react'
import { ChevronDown } from 'lucide-react'
import './styles/ui.css'

// Select estilizado tipo Destino Turístico: un <select> nativo no se puede
// customizar (el dropdown lo dibuja el SO), así que esto lo reemplaza con
// un botón + listbox propios, pero manteniendo la MISMA API de llamada que
// un <select onChange> con hijos <option> - así los call-sites no cambian.
// eslint-disable-next-line react/prop-types
function SelectField({ id, name, value, onChange, disabled, children }) {
  const [open, setOpen] = useState(false)
  const rootRef = useRef(null)

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

  useEffect(() => {
    if (!open) return
    const onPointerDown = (e) => {
      if (rootRef.current && !rootRef.current.contains(e.target)) setOpen(false)
    }
    const onKeyDown = (e) => {
      if (e.key === 'Escape') setOpen(false)
    }
    document.addEventListener('mousedown', onPointerDown)
    document.addEventListener('keydown', onKeyDown)
    return () => {
      document.removeEventListener('mousedown', onPointerDown)
      document.removeEventListener('keydown', onKeyDown)
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
        className={`select-trigger${open ? ' open' : ''}`}
        onClick={() => !disabled && setOpen((v) => !v)}
        disabled={disabled}
        aria-haspopup="listbox"
        aria-expanded={open}
      >
        <span className={selected ? 'select-value' : 'select-placeholder'}>
          {selected ? selected.label : placeholder?.label}
        </span>
        <ChevronDown size={16} />
      </button>
      {open && (
        <ul className="select-listbox" role="listbox">
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
        </ul>
      )}
    </div>
  )
}

export default SelectField
