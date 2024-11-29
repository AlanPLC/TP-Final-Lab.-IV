import { Navigate } from "react-router-dom";
import { jwtDecode } from "jwt-decode"; 

// Protección rutas solo para administrador.
const AdminRoute = ({ children }) => {
  const token = localStorage.getItem("token");

  if (!token) {
    alert("Debes iniciar sesión.");
    return <Navigate to="/login" replace />;
  }

  try {
    const decoded = jwtDecode(token); 
    const rol = decoded?.rol;

    if (rol !== "administrador") {
      alert("Rol administrador requerido.");
      return <Navigate to="/" replace />;
    }
  } catch (error) {
    console.error("Error al decodificar el token:", error);
    alert("Token inválido. Por favor, inicia sesión nuevamente.");
    return <Navigate to="/login" replace />;
  }

  return children;
};

export default AdminRoute;