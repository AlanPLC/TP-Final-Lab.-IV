import { useState } from 'react'


export default function useAlmacen(){
    const [error, setError] = useState([])

    const getAlmacen = async () => {
        const token = localStorage.getItem("token");
        try {
            const response = await fetch("http://localhost:3000/administrador/", {
                headers: {
                    Authorization: "Bearer " + token,
                }
            });
            const data = await response.json();
            if (!response.ok) {
                if (data.errors) {
                    setError(Array.isArray(data.errors) ? data.errors : [data.errors]);
                    console.error(data.errors);
                    return { success: false, errors: data.errors };
                }
                throw new Error(data.message || 'Error en la solicitud.');
            }
            return { success: true, data };
        } catch (error) {
            setError(error.message);
            return { success: false, message: error.message };
        }
    };

    const getCategorias = async () => {
        const token = localStorage.getItem("token");
        try {
            const response = await fetch("http://localhost:3000/categorias", {
                headers: {
                    Authorization: "Bearer " + token,
                }
            });
            const data = await response.json();
            if (!response.ok) {
                if (data.errors) {
                    setError(Array.isArray(data.errors) ? data.errors : [data.errors]);
                    console.error(data.errors);
                    return { success: false, errors: data.errors };
                }
                throw new Error(data.message || 'Error en la solicitud.');
            }
            return { success: true, data: data.categorias };
        } catch (error) {
            setError(error.message);
            return { success: false, message: error.message };
        }
    };

    const getProveedores = async () => {
        const token = localStorage.getItem("token");
        try {
            const response = await fetch("http://localhost:3000/onlyproveedores", {
                headers: {
                    Authorization: "Bearer " + token,
                }
            });
            const data = await response.json();
            if (!response.ok) {
                if (data.errors) {
                    setError(Array.isArray(data.errors) ? data.errors : [data.errors]);
                    console.error(data.errors);
                    return { success: false, errors: data.errors };
                }
                throw new Error(data.message || 'Error en la solicitud.');
            }
            return { success: true, data };
        } catch (error) {
            setError(error.message);
            return { success: false, message: error.message };
        }
    };

        const postAlmacen = async(almacen) =>{
            setLoading(true)
            const token = localStorage.getItem("token")
            try {
                const response = await fetch("http://localhost:3000/administrador/",{
                    method: "POST",
                    headers: {
                        Authorization: "Bearer " + token,
                        'content-type': 'application/json'
                    },
                    body: JSON.stringify(almacen)
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

        const putAlmacen = async(almacen) =>{
            const token = localStorage.getItem("token")
            try {
                const response = await fetch(`http://localhost:3000/administrador/${almacen.producto_id}`,{
                    method: "PUT",
                    headers: {
                        
                        Authorization: "Bearer " + token,
                        'content-type': 'application/json'
                    },
                    body: JSON.stringify(almacen)
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

        const deleteAlmacen = async(id) =>{
            const token = localStorage.getItem("token")
            try {
                const response = await fetch(`http://localhost:3000/administrador/${id}`,{
                    method: "DELETE",
                    headers: {
                        Authorization: "Bearer " + token
                        
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
                return {success: true, data}
            } catch (error) {
                setError(error.message)
                return {success: false, message: error.message}
            } 
        }
        
        return {getAlmacen, getCategorias, getProveedores, postAlmacen, putAlmacen, deleteAlmacen, setError, error}
     
    }  



