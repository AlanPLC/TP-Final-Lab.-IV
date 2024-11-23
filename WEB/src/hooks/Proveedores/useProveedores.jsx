import { useState } from 'react'

export default function useProveedores(){
    const [error, setError] = useState([])
    const [loading, setLoading] = useState(false)

    const proveedor = async() =>{
        setLoading(true)

        try {
            const token = localStorage.getItem('token')
            const response = await fetch("http://localhost:3000/proveedores/",{
                headers: {
                    Authorization: "Bearer " + token,
                }
            })
            const data = await response.json()
            if(!response.ok){
                throw new Error(data.message || 'Error en la solicitud.');
            }
            return {data}
        } catch (error) {
            setError(error.message)
            return {success: false, message: error.message}
        }
        finally {
            setLoading(false)
        }
    }  

    return {proveedor, error, loading}
}
