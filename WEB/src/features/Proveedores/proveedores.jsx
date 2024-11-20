import './styles/proveedores.css';
import useProveedores from '../../hooks/Proveedores/useProveedores.jsx';
import {useState, useEffect} from 'react';
const Proveedores = () => {
    const { proveedor, error, loading } = useProveedores();
    const [listaProveedores, setListaProveedores] = useState([])

    const fetchProveedores = async() =>{
        try {
            const response = await proveedor()
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

    useEffect(() => {
        fetchProveedores();
    }, []);

    useEffect(() => {
        console.log("Lista actualizada: ", listaProveedores);
    }, [listaProveedores]);

    return (
        <div>
            <div className='proveedor-main-container'>
                <h1 className='prov-titulo'>Proveedores</h1>
                <div className='prov-lista-container'>
                    <ul className='prov-lista'>
                        {listaProveedores.map((prov) => (
                            <li className='prov-li-main' key={prov.proveedor_id} >
                                <div className='proveedor'>
                                    <p className='p1'>#{prov.proveedor_id}</p>
                                    <p className='p3'>{prov.nombre}</p>
                                </div>
                                <div>
                                    <h4>Productos</h4>
                                    <ul className='prov-lista-productos'>
                                        {prov.productos.map((producto, index) => (
                                            <li key={index} className='prov-producto'>
                                                <p className='p-id'>ID #{producto.producto_id}</p>
                                                <hr />
                                                <p>{producto.producto_nombre}</p>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            </li>
                        ))}
                    </ul>
                </div>
            </div>
        </div>
    )
};

export default Proveedores;