import { Navigate } from "react-router-dom";
import { jwtDecode } from "jwt-decode";
import { useEffect } from "react";

// Componente con finalidad de proteger las rutas si el usuario no inicia sesión.
// eslint-disable-next-line react/prop-types
const ProtectedRoute = ({ children }) => {
  const token = localStorage.getItem("token");

  let expired = false;
  let invalid = false;
  if (token) {
    try {
      const decoded = jwtDecode(token);
      const currentTime = Math.floor(Date.now() / 1000);
      if (decoded.exp < currentTime) {
        expired = true;
      }
    } catch (err) {
      console.error("Error al verificar el token:", err);
      invalid = true;
    }
  }

  // El alert() se dispara en un efecto, no durante el render: mientras el
  // slide de pantalla completa está en curso (ver RootTransition.jsx), este
  // componente puede quedar montado y re-renderizarse varias veces seguidas
  // durante su propia animación de salida - un alert() bloqueante ahí
  // trababa toda la transición en vez de solo mostrar el aviso una vez.
  useEffect(() => {
    if (expired || invalid) {
      localStorage.removeItem("token");
      if (expired) {
        alert('Tu sesión ha expirado. Por favor, inicia sesión nuevamente.');
      }
    }
  }, [expired, invalid]);

  if (!token || expired || invalid) {
    return <Navigate to="/login" replace />;
  }

  return children;
};

export default ProtectedRoute;
