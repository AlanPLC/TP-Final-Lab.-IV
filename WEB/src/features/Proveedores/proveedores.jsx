import './styles/proveedores.css';
import useProveedores from '../../hooks/Proveedores/useProveedores.jsx';
import {useState, useEffect} from 'react';
const Proveedores = () => {
    const { getProveedor, postProveedor, deleteProveedor, updateProveedor, error, loading } = useProveedores();
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
            console.log("Proveedor creado con éxito.", result.data)
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

    return (
        <div className='proveedor-main-container'>
            <div className='prov-lista-container'>
                <h1 className='prov-titulo'>Proveedores</h1>
                <ul className='prov-lista'>
                    {listaProveedores.map((prov) => (
                        <li className='prov-li-main' key={prov.proveedor_id} >
                            <div className='proveedor'>
                                <p className='p1'>#{prov.proveedor_id}</p>
                                <p className='p3'>{prov.nombre}</p>
                                <div>
                                    <img 
                                        className="edit-pic" 
                                        src="/edit.png" 
                                        alt="editar" 
                                        onClick={()=>handleEdit(prov)}
                                        style={{
                                            opacity: onEdit ? 0.5 : 1,
                                            cursor: onEdit ? "not-allowed" : "pointer",
                                            }}/>
                                    <img 
                                        className="delete-pic" 
                                        src="/delete.png" 
                                        alt="borrar" 
                                        onClick={()=>eliminarProveedor(prov.proveedor_id)}
                                        style={{
                                            opacity: onEdit ? 0.5 : 1,
                                            cursor: onEdit ? "not-allowed" : "pointer",
                                            }}/>
                                </div>
                            </div>
                            <p>{prov.descripcion}</p>
                            <div>
                            <h4>Productos</h4>
                                {prov.productos[0].producto_nombre !== null ? (
                                    <ul className='prov-lista-productos'>
                                    {prov.productos.map((producto, index) => (
                                        <li key={index} className='prov-producto'>
                                            <p className='p-id'>ID #{producto.producto_id}</p>
                                            <hr />
                                            <p>{producto.producto_nombre}</p>
                                        </li>
                                    ))}
                                    </ul>
                                ) : (
                                    <h4 className='non-products'>No existen productos.</h4>
                                )}
                            </div>
                        </li>
                    ))}
                </ul>
            </div>
            <div className='prov-edit-container'>
                {!onEdit ? (<h2>Agregar Proveedores</h2>) : 
                (<div className='edit-title'>
                    <h2>Editar Proveedor</h2>
                    <p>Nº{proveedorID}</p>
                </div>)}
                <form className='entryes' onSubmit={agregarProv}>
                    <label htmlFor="nombre">Nombre del Proveedor</label>
                    <input 
                        type="text" 
                        placeholder='Ingrese el nombre del Proveedor'
                        value={nombre}
                        onChange={(e)=>setNombre(e.target.value)}/>
                    <label htmlFor="descripcion">Descripción del Proveedor</label>
                    <textarea 
                    name="descripcion" 
                    placeholder='Ingrese la descripción del proveedor...' 
                    value={descripcion}
                    onChange={(e)=>setDescripcion(e.target.value)}/>
                    {onEdit ? 
                    (<div className="buttons">
                        <button type="button" onClick={()=> actualizarProv()} disabled={!nombre?.trim() || !descripcion?.trim()}>Editar</button>
                        <button type="button"
                        onClick={()=> {
                            setNombre('')
                            setDescripcion('')
                            setOnEdit(false)
                            setProveedorID(null)
                        }}>Cancelar</button>
                    </div>) :
                    (<button type='submit' disabled={!nombre.trim() || !descripcion.trim()}>Agregar Proveedor</button>)}
                </form>
                <img src="/proveedor.png" alt="proveedor" />
            </div>
        </div>
    )
};

export default Proveedores;