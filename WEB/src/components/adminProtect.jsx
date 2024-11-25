import { Navigate } from "react-router-dom";
import { useState } from 'react'
import { jwtDecode } from "jwt-decode";

const AdminRoute = ({children}) => {
    const [rol, setRol] = useState('')
    const token = localStorage.getItem("token");
    const decoded = jwtDecode(token);
    setRol(decoded.rol)

    if(!rol === "administrador"){
        alert("Rol administrador requerido.")
        return <Navigate to="/" replace />;
    }
    return children;
}

export default AdminRoute;