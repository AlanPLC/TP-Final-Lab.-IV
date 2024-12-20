import { useState } from 'react'

export default function useProductos() {
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState([])

    const getProductosConDetalles = async() =>{
        setLoading(true)
        const token = localStorage.getItem('token')
        try {
            const response = await fetch("http://localhost:3000/administrador/",{
                headers: {
                    Authorization: "Bearer " + token,
                }
            })
            const data = await response.json()
            if (!response.ok) {
                if (data.errors) {
                    setError(Array.isArray(data.errors) ? data.errors : [data.errors]);
                    console.error(data.errors);
                    return {success: false, errors: data.errors} 
                }
                throw new Error(data.message || 'Error en la solicitud.');
            }
            return {data}
        } catch (error) {
            setError(error.message)
            return {success: false, message: error.message}
        } finally {
            setLoading(false)
        } 
    }

    const postVentas = async(productos) =>{

        setLoading(true)
        const token = localStorage.getItem('token')
        try {
            const response = await fetch('http://localhost:3000/ventas/', {
                method: "POST",
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: "Bearer " + token,
                },
                body: JSON.stringify({ productos })
            })
            const data = await response.json()
            if (!response.ok) {
                if (data.errors) {
                    setError(Array.isArray(data.errors) ? data.errors : [data.errors]);
                    console.error(data.errors);
                    return {success: false, errors: data.errors} 
                }
                throw new Error(data.message || 'Error en la solicitud.');
            }
            return {success: true, data}
        } catch (error) {
            setError(error.message)
            return {success: false, message: error.message}
        } finally{
            setLoading(false)
        }
    }

    const controlStock = async(productos)=>{
        setLoading(true)
        const token = localStorage.getItem('token')
        try {
            const response = await fetch(`http://localhost:3000/ventas/${productos.producto_id}`,{
                method: "PUT",
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: "Bearer " + token,
                },
                body: JSON.stringify({ cantidad_disponible: productos.cantidad_disponible })
            })
            const data = await response.json()
            if (!response.ok) {
                if (data.errors) {
                    setError(Array.isArray(data.errors) ? data.errors : [data.errors]);
                    console.error(data.errors);
                    return {success: false, errors: data.errors} 
                }
                throw new Error(data.message || 'Error en la solicitud.');
            }
            return {success: true, data}
        } catch (error) {
            setError(error.message)
            return {success: false, message: error.message}
        } finally{
            setLoading(false)
        }
    }

    return {getProductosConDetalles, controlStock, postVentas, loading, error}
}
