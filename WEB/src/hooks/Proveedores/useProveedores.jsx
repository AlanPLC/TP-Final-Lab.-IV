import { useState } from 'react'

export default function useProveedores(){
    const [error, setError] = useState([])

    // Get a Proveedores con sus Productos
    const getProveedor = async() =>{
        const token = localStorage.getItem('token')
        try {
            const response = await fetch("http://localhost:3000/proveedores/",{
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
        }
    }  

    // Post a Proveedores
    const postProveedor = async(proveedor) =>{
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
        }
    }

    // Eliminar proveedor
    const deleteProveedor = async(id) =>{
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
        }
    }

    // Actualizar proveedor
    const updateProveedor = async(proveedor) =>{
        try {
            const token = localStorage.getItem('token')
            const response = await fetch(`http://localhost:3000/proveedores/${proveedor.id}`,{
                method: "PUT",
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: "Bearer " + token
                },
                body: JSON.stringify(proveedor)
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
        }
    }

    return {getProveedor, postProveedor, deleteProveedor, updateProveedor, setError, error}
}