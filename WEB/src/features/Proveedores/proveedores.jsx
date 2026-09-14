import '../../styles/dashboardPanels.css';
import './styles/proveedores.css';
import useProveedores from '../../hooks/Proveedores/useProveedores.jsx';
import {useState, useEffect} from 'react';
import { Pencil, Trash2 } from 'lucide-react';
import SmoothHeight from '../../components/ui/SmoothHeight.jsx';

// Mismo tope que valida el backend (ver API/src/controllers/proveedoresController.js).
const MAX_PROVEEDORES = 5;

const Proveedores = () => {
    const { getProveedor, postProveedor, deleteProveedor, updateProveedor, setError, error } = useProveedores();
    const [listaProveedores, setListaProveedores] = useState([])
    const [nombre, setNombre] = useState('')
    const [descripcion, setDescripcion] = useState('')
    const [onEdit, setOnEdit] = useState(false)
    const [proveedorID, setProveedorID] = useState(null)
    const [reload, setReload] = useState(false)

    const mostrarProveedores = async() =>{
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
                        }],
                    });
                }
                return acc;
            }, []);
            setListaProveedores(agrupados)
        } catch (error) {
            console.error(error);
        }
    }

    const handleEdit = (prov)=>{
        setNombre(prov.nombre)
        setDescripcion(prov.descripcion)
        setProveedorID(prov.proveedor_id)
        setOnEdit(true)
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
        const result = await postProveedor(nuevoProveedor)
        if(result.success){
            setReload(!reload)
            console.log("Errores:", error)
            console.log("Proveedor creado con éxito.", result.data)
            setError(null)
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
        const result = await updateProveedor(nuevoProveedor)
        if(result.success){
            setReload(!reload)
            console.log("Proveedor actualizado con éxito.", result.data)
            setNombre('')
            setDescripcion('')
            setOnEdit(false)
            setProveedorID(null)
            setError(null)
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
        console.log("Lista actualizada: ", listaProveedores);
    }, [listaProveedores]);

    const limiteAlcanzado = !onEdit && listaProveedores.length >= MAX_PROVEEDORES;

    return (
        <div className='proveedor-main-container'>
            <div className="panel-card proveedores-panel">
            <div className='prov-lista-section'>
                <h1 className="panel-heading">Proveedores</h1>
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
                                        disabled={onEdit}>
                                        <Pencil size={15} />
                                    </button>
                                    <button
                                        type="button"
                                        className="panel-icon-button danger"
                                        title="Eliminar"
                                        onClick={()=>eliminarProveedor(prov.proveedor_id)}
                                        disabled={onEdit}>
                                        <Trash2 size={15} />
                                    </button>
                                </div>
                            </div>
                            <p className="prov-descripcion">{prov.descripcion}</p>
                            <div>
                            <h4>Productos</h4>
                                {prov.productos[0].producto_nombre !== null ? (
                                    <ul className='prov-lista-productos'>
                                    {prov.productos.map((producto, index) => (
                                        <li key={index} className='prov-producto'>
                                            <span>{producto.producto_nombre}</span>
                                        </li>
                                    ))}
                                    </ul>
                                ) : (
                                    <p className='non-products'>No tiene productos cargados.</p>
                                )}
                            </div>
                        </li>
                    ))}
                </ul>
            </div>
            <div className='prov-edit-section'>
                {!onEdit ? (<h3 className="panel-heading">Agregar Proveedor</h3>) :
                    (<h3 className="panel-heading">Editar Proveedor</h3>)}
                <form className='entryes' onSubmit={agregarProv}>
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
                        <button type="button" onClick={()=> actualizarProv()} disabled={!nombre?.trim() || !descripcion?.trim()}>Editar</button>
                        <button type="button"
                        onClick={()=> {
                            setNombre('')
                            setDescripcion('')
                            setOnEdit(false)
                            setProveedorID(null)
                        }}>Cancelar</button>
                    </div>) :
                    (<button type='submit' className="panel-button panel-button-primary prov-submit" disabled={!nombre.trim() || !descripcion.trim() || limiteAlcanzado}>Agregar Proveedor</button>)}
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
            </div>
        </div>
    )
};

export default Proveedores;
