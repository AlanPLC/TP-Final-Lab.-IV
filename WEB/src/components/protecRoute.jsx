import { Navigate } from "react-router-dom";

// Componente con finalida de proteger las rutas si no el usuario no inicia sesión. 
// (Deshabilito eslint en la linea inferior por falso marcado de error)
// eslint-disable-next-line react/prop-types
const ProtectedRoute = ({children}) => {
  const token = localStorage.getItem("token");

  if (!token) {
    return <Navigate to="/login" replace />;
  }

  return children;
};


export default ProtectedRoute;