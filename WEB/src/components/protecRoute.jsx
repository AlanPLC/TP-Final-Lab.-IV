import { Navigate } from "react-router-dom";

// Componente con finalida de proteger las rutas 
// si no el usuario no inicia sesión.
const ProtectedRoute = ({children}) => {
  const token = localStorage.getItem("token");

  if (!token) {
    return <Navigate to="/login" replace />;
  }

  return children;
};

export default ProtectedRoute;