import { useState } from "react";

export default function useLogin(){
    const [error, setError] = useState([])
    const [loading, setLoading] = useState(false)

    const login = async (user, password) => {
        setLoading(true)
        setError([])

        // Fetch tipo Post a login, exportando los estados loading
        // y error según resultado para manejo en el componente
        try {
            const response = await fetch("http://localhost:3000/login/",{
                method: "POST",
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ user, password })
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

            const token = data.token;
            localStorage.setItem('token', token);
            return { success: true };

        } catch (error) {
            setError(error.message);
            return { success: false, message: error.message };
        } finally{
            setLoading(false)
        }
    }
    return {login, loading, error}
}