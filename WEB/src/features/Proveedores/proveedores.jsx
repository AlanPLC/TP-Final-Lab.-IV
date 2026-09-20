import '../../styles/dashboardPanels.css';
import './styles/proveedores.css';
import useProveedores from '../../hooks/Proveedores/useProveedores.jsx';
import {useState, useEffect} from 'react';
import { Pencil, Trash2, Package, Loader2, Search } from 'lucide-react';
import SmoothHeight from '../../components/ui/SmoothHeight.jsx';
import ProveedorProductosModal from './ProveedorProductosModal.jsx';

// Mismo tope que valida el backend (ver API/src/controllers/proveedoresController.js).
const MAX_PROVEEDORES = 5;

const Proveedores = () => {
    const { getProveedor, postProveedor, deleteProveedor, updateProveedor, setError, error } = useProveedores();
    // todosLosProveedores: lo que devuelve el backend, sin filtrar - listaProveedores
    // es la vista filtrada por el buscador (ver useEffect más abajo).
    const [todosLosProveedores, setTodosLosProveedores] = useState([])
    const [listaProveedores, setListaProveedores] = useState([])
    const [terminoBusqueda, setTerminoBusqueda] = useState('')
    // Arranca en true: al montar, todavía no se hizo ningún fetch.
    const [cargandoProveedores, setCargandoProveedores] = useState(true)
    const [nombre, setNombre] = useState('')
    const [descripcion, setDescripcion] = useState('')
    const [onEdit, setOnEdit] = useState(false)
    const [proveedorID, setProveedorID] = useState(null)
    const [reload, setReload] = useState(false)
    // Proveedor cuyo modal de productos está abierto (null = ninguno).
    const [modalProductosProveedor, setModalProductosProveedor] = useState(null)
    // Loader en el botón + formulario deshabilitado mientras se espera la
    // respuesta de agregar/editar un proveedor.
    const [enviandoProveedor, setEnviandoProveedor] = useState(false)
    // Solo importa en mobile/tablet (ver proveedores.css): ahí el listado y
    // el formulario no se muestran juntos, uno u otro a pantalla completa -
    // "lista" por default para aterrizar viendo el listado.
    const [vistaMobile, setVistaMobile] = useState('lista')

    const mostrarProveedores = async() =>{
        setCargandoProveedores(true)
        try {
            const response = await getProveedor()
            console.log('Data recibida:', response);

            const agrupados = response.data.proveedor.reduce((acc, prov) => {
                const existingProv = acc.find(item => item.proveedor_id === prov.proveedor_id);

                if (existingProv) {
                    // Si ya existe, añadir los detalles del producto
                    existingProv.productos.push({
                        producto_id: prov.producto_id,
                        producto_nombre: prov.producto_nombre,
                        producto_costo_unitario: prov.producto_costo_unitario,
                        producto_imagen_url: prov.producto_imagen_url,
                        producto_categoria_nombre: prov.producto_categoria_nombre,
                    });
                } else {
                    // Si no existe, crear una nueva entrada
                    acc.push({
                        proveedor_id: prov.proveedor_id,
                        nombre: prov.proveedor_nombre,
                        descripcion: prov.proveedor_descripcion,
                        productos: [{
                            producto_id: prov.producto_id,
                            producto_nombre: prov.producto_nombre,
                            producto_costo_unitario: prov.producto_costo_unitario,
                            producto_imagen_url: prov.producto_imagen_url,
                            producto_categoria_nombre: prov.producto_categoria_nombre,
                        }],
                    });
                }
                return acc;
            }, []);
            setTodosLosProveedores(agrupados)
        } catch (error) {
            console.error(error);
        } finally {
            setCargandoProveedores(false)
        }
    }

    const handleEdit = (prov)=>{
        setNombre(prov.nombre)
        setDescripcion(prov.descripcion)
        setProveedorID(prov.proveedor_id)
        setOnEdit(true)
        setVistaMobile('form')
    }

    const eliminarProveedor = async(id) =>{
        if(confirm(`¿Quieres eliminar el proveedor Nº${id}?`)){
            const result = await deleteProveedor(id)
            if(result.success){
                setReload(!reload)
                console.log("Proveedor eliminado con éxito.", result.data)
            } else{
                console.error("Error al eliminar el proveedor.", result.message)
            }
        }

    }

    // Fetch a Proveedores pasandole el nuevo proveedor como objeto.
    const agregarProv = async(e)=>{
        e.preventDefault();
        const nuevoProveedor = {
            nombre: nombre,
            descripcion: descripcion,
        }
        setEnviandoProveedor(true)
        const result = await postProveedor(nuevoProveedor)
        setEnviandoProveedor(false)
        if(result.success){
            setReload(!reload)
            console.log("Errores:", error)
            console.log("Proveedor creado con éxito.", result.data)
            setNombre('')
            setDescripcion('')
            setError(null)
            setVistaMobile('lista')
        } else{
            console.error("Error al crear el proveedor.", result.message)
        }
    }

    // Fetch tipo PUT proveedores modificando con el nuevo objeto creado.
    const actualizarProv = async()=>{
        const nuevoProveedor = {
            id: proveedorID,
            nombre: nombre,
            descripcion: descripcion,
        }
        setEnviandoProveedor(true)
        const result = await updateProveedor(nuevoProveedor)
        setEnviandoProveedor(false)
        if(result.success){
            setReload(!reload)
            console.log("Proveedor actualizado con éxito.", result.data)
            setNombre('')
            setDescripcion('')
            setOnEdit(false)
            setProveedorID(null)
            setError(null)
            setVistaMobile('lista')
        } else{
            console.error("Error al actualizar el proveedor.", result.message)
            setNombre('')
            setDescripcion('')
            setOnEdit(false)
            setProveedorID(null)
        }
    }

    useEffect(() => {
        mostrarProveedores();
    }, [reload]);

    useEffect(() => {
        console.log("Lista actualizada: ", todosLosProveedores);
    }, [todosLosProveedores]);

    // Buscador por nombre - se recalcula cada vez que cambia el término o
    // llega una lista nueva de proveedores.
    useEffect(() => {
        if (!terminoBusqueda.trim()) {
            setListaProveedores(todosLosProveedores)
        } else {
            setListaProveedores(
                todosLosProveedores.filter((prov) => prov.nombre.toLowerCase().includes(terminoBusqueda.trim().toLowerCase()))
            )
        }
    }, [todosLosProveedores, terminoBusqueda]);

    const limiteAlcanzado = !onEdit && todosLosProveedores.length >= MAX_PROVEEDORES;

    return (
        <div className='proveedor-main-container'>
            <div className={`panel-card proveedores-panel proveedores-mostrar-${vistaMobile}`}>
            <div className='prov-lista-section'>
                <div className="prov-lista-head">
                    <h1 className="panel-heading">Proveedores</h1>
                    <div className="prov-search">
                        <Search size={16} />
                        <input
                            type="text"
                            className="panel-search"
                            placeholder="Buscar proveedor..."
                            value={terminoBusqueda}
                            onChange={(e) => setTerminoBusqueda(e.target.value)}
                        />
                    </div>
                </div>
                {/* Mobile/tablet: este es el que scrollea (ver
                    proveedores.css) - el encabezado de arriba (título +
                    buscador) queda fijo, solo la lista se desplaza dentro
                    de su propio espacio. */}
                <div className="prov-lista-scroll">
                {cargandoProveedores ? (
                <div className="panel-loading-container">
                    <p className="panel-loading">
                        <Loader2 size={16} className="panel-spinner" />
                        Cargando proveedores...
                    </p>
                </div>
                ) : listaProveedores.length === 0 ? (
                <p className="panel-empty">
                    {terminoBusqueda.trim() ? 'No se encontraron proveedores con ese nombre.' : 'Todavía no hay proveedores cargados.'}
                </p>
                ) : (
                <ul className='prov-lista'>
                    {listaProveedores.map((prov) => (
                        <li className='prov-li-main' key={prov.proveedor_id} >
                            <div className='proveedor'>
                                <div>
                                    <p className='p3'>{prov.nombre}</p>
                                </div>
                                <div className="buttons">
                                    <button
                                        type="button"
                                        className="panel-icon-button"
                                        title="Editar"
                                        onClick={()=>handleEdit(prov)}
                                        disabled={onEdit || enviandoProveedor}>
                                        <Pencil size={15} />
                                    </button>
                                    <button
                                        type="button"
                                        className="panel-icon-button danger"
                                        title="Eliminar"
                                        onClick={()=>eliminarProveedor(prov.proveedor_id)}
                                        disabled={onEdit || enviandoProveedor}>
                                        <Trash2 size={15} />
                                    </button>
                                </div>
                            </div>
                            <p className="prov-descripcion">{prov.descripcion}</p>
                            <button
                                type="button"
                                className="prov-productos-button"
                                onClick={() => setModalProductosProveedor(prov)}
                                disabled={enviandoProveedor}
                            >
                                <Package size={14} />
                                Productos
                            </button>
                        </li>
                    ))}
                </ul>
                )}
                </div>
            </div>
            <div className='prov-edit-section'>
                {!onEdit ? (<h3 className="panel-heading">Agregar Proveedor</h3>) :
                    (<h3 className="panel-heading">Editar Proveedor</h3>)}
                <form className='entryes' onSubmit={agregarProv}>
                    <fieldset className="panel-fieldset" disabled={enviandoProveedor}>
                    <label className="panel-label" htmlFor="nombre">Nombre del Proveedor</label>
                    <input
                        id="nombre"
                        type="text"
                        className="panel-input"
                        placeholder='Ingrese el nombre del Proveedor'
                        value={nombre}
                        onChange={(e)=>setNombre(e.target.value)}/>
                    <label className="panel-label" htmlFor="descripcion">Descripción del Proveedor</label>
                    <textarea
                    id="descripcion"
                    name="descripcion"
                    className="panel-textarea"
                    rows={4}
                    placeholder='Ingrese la descripción del proveedor...'
                    value={descripcion}
                    onChange={(e)=>setDescripcion(e.target.value)}/>
                    <SmoothHeight>
                    {limiteAlcanzado && (
                        <p className="limite-proveedores">
                            Alcanzaste el máximo de {MAX_PROVEEDORES} proveedores. Eliminá alguno para poder cargar otro.
                        </p>
                    )}
                    </SmoothHeight>
                    {onEdit ?
                    (<div className="segmented-bar edit-buttons">
                        <button type="button" onClick={()=> actualizarProv()} disabled={!nombre?.trim() || !descripcion?.trim()}>
                            {enviandoProveedor ? <Loader2 size={15} className="panel-spinner" /> : 'Editar'}
                        </button>
                        <button type="button"
                        onClick={()=> {
                            setNombre('')
                            setDescripcion('')
                            setOnEdit(false)
                            setProveedorID(null)
                            setVistaMobile('lista')
                        }}>Cancelar</button>
                    </div>) :
                    (<button type='submit' className="panel-button panel-button-primary prov-submit" disabled={!nombre.trim() || !descripcion.trim() || limiteAlcanzado}>
                        {enviandoProveedor ? <Loader2 size={16} className="panel-spinner" /> : 'Agregar Proveedor'}
                    </button>)}
                    </fieldset>
                </form>

                <SmoothHeight>
                {Array.isArray(error) && error.length > 0 && (
                <div className="panel-error-list prov-errors">
                    {error.map((err, index) => (
                    <p key={index}>{err.msg}</p>
                    ))}
                </div>
                )}
                </SmoothHeight>
            </div>
            {/* Mobile/tablet: listado y formulario no se muestran juntos (ver
                proveedores.css) - este toggle decide cuál de los dos ocupa la
                pantalla, pegado siempre abajo de todo. En desktop queda
                oculto, ahí se ven los dos a la vez. */}
            <div className="proveedores-mobile-tabs">
                <button
                    type="button"
                    className={vistaMobile === 'lista' ? 'active' : ''}
                    onClick={() => setVistaMobile('lista')}
                >
                    Listado
                </button>
                <button
                    type="button"
                    className={vistaMobile === 'form' ? 'active' : ''}
                    onClick={() => setVistaMobile('form')}
                >
                    Formulario
                </button>
            </div>
            </div>
            {modalProductosProveedor && (
                <ProveedorProductosModal
                    proveedor={modalProductosProveedor}
                    onClose={() => setModalProductosProveedor(null)}
                />
            )}
        </div>
    )
};

export default Proveedores;
