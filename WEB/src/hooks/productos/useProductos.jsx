import { useState } from "react";

export default function useProductos(){
    const [error, setError] = useState([])
    const [loading, setLoading] = useState(false)

    const register = async (nombre, descripcion, categoria, proveedor, pecio, cantidad, imagen) => {
        
        setLoading(true)
        setError([])
        try {
            const response = await fetch("http://localhost:3000/administrador/",{
                method: "POST",
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ nombre, descripcion, categoria, proveedor, pecio, cantidad, imagen})
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
            return { success: true };

        } catch (error) {
            setError(error.message);
            return { success: false, message: error.message };
        } finally{
            setLoading(false)
        }
    }
    return {register, loading, error}
}