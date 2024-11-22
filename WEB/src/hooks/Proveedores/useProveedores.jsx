import { useState } from 'react'

export default function useProveedores(){
    const [error, setError] = useState([])
    const [loading, setLoading] = useState(false)

    // Get a Proveedores con sus Productos
    const getProveedor = async() =>{
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

    // Post a Proveedores
    const postProveedor = async(proveedor) =>{
        setLoading(true)
        try {
            const token = localStorage.getItem('token')
            const response = await fetch("http://localhost:3000/proveedores/",{
                method: "POST",
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: "Bearer " + token
                },
                body: JSON.stringify(proveedor)
            })
            const data = await response.json()
            if(!response.ok){
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

    const deleteProveedor = async(id) =>{
        setLoading(true)
        try {
            const token = localStorage.getItem('token')
            const response = await fetch(`http://localhost:3000/proveedores/${id}`,{
                method: "DELETE",
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: "Bearer " + token
                },
            })
            const data = await response.json()
            if(!response.ok){
                throw new Error(data.message || 'Error en la solicitud.');
            }
            return {success: true, data}
        } catch (error) {
            setError(error.message)
            return {success: false, message: error.message}
        } finally {
            setLoading(false)
        }
    }

    return {getProveedor, postProveedor, deleteProveedor, error, loading}
}