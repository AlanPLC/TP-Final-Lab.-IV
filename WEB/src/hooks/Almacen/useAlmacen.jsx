import { useState } from 'react'


export default function useAlmacen(){
    const [error, setError] = useState([])
    const [loading, setLoading] = useState(false)

    const getAlmacen = async () => {
        setLoading(true);
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
            return { data };
        } catch (error) {
            setError(error.message);
            return { success: false, message: error.message };
        } finally {
            setLoading(false);
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
            finally {
                setLoading(false)
            }
        }

        const putAlmacen = async(almacen) =>{
            setLoading(true)
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
            finally {
                setLoading(false)
            }
        }

        const deleteAlmacen = async(id) =>{
            setLoading(true)  
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
            finally {
                setLoading(false)
            } 
        }
        
        return {getAlmacen, postAlmacen, putAlmacen, deleteAlmacen, setError,error, loading}
     
    }  



