import { useState } from 'react'
import { API_BASE_URL } from '../../config/api.js'

export default function useAlmacen(){
    const [error, setError] = useState([])

    const getAlmacen = async () => {
        const token = localStorage.getItem("token");
        try {
            const response = await fetch(`${API_BASE_URL}/administrador/`, {
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
            const response = await fetch(`${API_BASE_URL}/categorias`, {
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

    const postCategoria = async (categoria) => {
        const token = localStorage.getItem("token");
        try {
            const response = await fetch(`${API_BASE_URL}/categorias`, {
                method: "POST",
                headers: {
                    Authorization: "Bearer " + token,
                    'content-type': 'application/json'
                },
                body: JSON.stringify(categoria)
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
            return { success: true, data: data.categoria };
        } catch (error) {
            setError(error.message);
            return { success: false, message: error.message };
        }
    };

    const getProveedores = async () => {
        const token = localStorage.getItem("token");
        try {
            const response = await fetch(`${API_BASE_URL}/onlyproveedores`, {
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
            const token = localStorage.getItem("token")
            try {
                const response = await fetch(`${API_BASE_URL}/administrador/`,{
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
                const response = await fetch(`${API_BASE_URL}/administrador/${almacen.producto_id}`,{
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

        const getLotes = async(productoId) => {
            const token = localStorage.getItem("token");
            try {
                const response = await fetch(`${API_BASE_URL}/lotes/producto/${productoId}`, {
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
                return { success: true, data: data.lotes };
            } catch (error) {
                setError(error.message);
                return { success: false, message: error.message };
            }
        };

        const postLote = async(lote) =>{
            const token = localStorage.getItem("token")
            try {
                const response = await fetch(`${API_BASE_URL}/lotes`,{
                    method: "POST",
                    headers: {
                        Authorization: "Bearer " + token,
                        'content-type': 'application/json'
                    },
                    body: JSON.stringify(lote)
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
                const response = await fetch(`${API_BASE_URL}/administrador/${id}`,{
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
        
        return {getAlmacen, getCategorias, postCategoria, getProveedores, postAlmacen, putAlmacen, deleteAlmacen, getLotes, postLote, setError, error}
     
    }  



