import { useState } from 'react'
import { API_BASE_URL } from '../../config/api.js'

export default function useEstadisticas(){
    const [error, setError] = useState([])

    const getEstadisticas = async() =>{
        const token = localStorage.getItem('token')
        try {
            const response = await fetch(`${API_BASE_URL}/estadisticas`, {
                headers: {
                    Authorization: "Bearer " + token,
                }
            })
            const data = await response.json()
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
    }

    return { getEstadisticas, error }
}
