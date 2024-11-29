import { Navigate } from "react-router-dom";
import { jwtDecode } from "jwt-decode";
import { useState } from "react";

// Componente con finalida de proteger las rutas si no el usuario no inicia sesión. 
// (Deshabilito eslint en la linea inferior por falso marcado de error)
// eslint-disable-next-line react/prop-types
const ProtectedRoute = ({children}) => {
  const token = localStorage.getItem("token");
  
  
  if (!token) {
    return <Navigate to="/login" replace />;
  }
  
  
  try {
    const decoded = jwtDecode(token);
    const currentTime = Math.floor(Date.now() / 1000);

    if (decoded.exp < currentTime) {
        localStorage.removeItem("token");
        alert('Tu sesión ha expirado. Por favor, inicia sesión nuevamente.');
        return <Navigate to="/login" replace />;
      }
  } catch (err) {
      console.error("Error al verificar el token:", err);
      localStorage.removeItem("token");
      return <Navigate to="/login" replace />;
  }
  return children;
};


export default ProtectedRoute;