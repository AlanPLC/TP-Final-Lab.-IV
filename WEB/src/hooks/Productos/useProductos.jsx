import { useState } from 'react'
import { API_BASE_URL } from '../../config/api.js'

export default function useProductos() {
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState([])

    const getProductosConDetalles = async() =>{
        setLoading(true)
        const token = localStorage.getItem('token')
        try {
            const response = await fetch(`${API_BASE_URL}/administrador/`,{
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
            const response = await fetch(`${API_BASE_URL}/ventas/`, {
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

    return {getProductosConDetalles, postVentas, loading, error}
}
