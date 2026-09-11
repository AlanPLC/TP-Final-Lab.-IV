import { Navigate } from "react-router-dom";
import { jwtDecode } from "jwt-decode";
import { useEffect } from "react";

// Protección de rutas solo para administrador.
// eslint-disable-next-line react/prop-types
const AdminRoute = ({ children }) => {
  const token = localStorage.getItem("token");

  let rol = null;
  let invalid = false;
  if (token) {
    try {
      rol = jwtDecode(token)?.rol;
    } catch (error) {
      console.error("Error al decodificar el token:", error);
      invalid = true;
    }
  }
  const noRole = Boolean(token) && !invalid && rol !== "administrador";

  // alert() en un efecto, no durante el render: ver ProtectedRoute.jsx para
  // el detalle de por qué (un alert() en medio de un render que se repite
  // durante una animación puede trabar toda la transición).
  useEffect(() => {
    if (!token) {
      alert("Debes iniciar sesión.");
    } else if (invalid) {
      localStorage.removeItem("token");
      alert("Token inválido. Por favor, inicia sesión nuevamente.");
    } else if (noRole) {
      alert("Rol administrador requerido.");
    }
  }, [token, invalid, noRole]);

  if (!token || invalid) {
    return <Navigate to="/login" replace />;
  }
  if (noRole) {
    return <Navigate to="/" replace />;
  }

  return children;
};

export default AdminRoute;
