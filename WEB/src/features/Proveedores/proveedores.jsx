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
                        nombre: prov.nombre,
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
            <h1 style={{color: "black"}}>Proveedores</h1>
        </div>
    )
};

export default Proveedores;