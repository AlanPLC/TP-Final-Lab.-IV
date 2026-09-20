import { useState } from 'react'
import { API_BASE_URL } from '../../config/api.js'

export default function useVentas(){
    const [error, setError] = useState([])

    const ventas = async() =>{
        try {
            const token = localStorage.getItem('token')
            const response = await fetch(`${API_BASE_URL}/ventas/`,{
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
    }  

    return {ventas, error}
}
