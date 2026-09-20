import { Navigate } from "react-router-dom";
import { jwtDecode } from "jwt-decode";
import { useEffect } from "react";
import { expirarSesion } from "../utils/sesion.js";

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

  // expirarSesion() se dispara en un efecto, no durante el render: mientras
  // el slide de pantalla completa está en curso (ver RootTransition.jsx),
  // este componente puede quedar montado y re-renderizarse varias veces
  // seguidas durante su propia animación de salida - correrlo ahí lo
  // dejaría redirigiendo/limpiando el token una y otra vez en vez de una
  // sola. expirarSesion() hace su propio window.location.href (no un
  // <Navigate> de React Router), así que expired se corta con un return
  // null en vez de sumar una segunda navegación en paralelo.
  useEffect(() => {
    if (expired) {
      expirarSesion();
    } else if (invalid) {
      localStorage.removeItem("token");
    }
  }, [expired, invalid]);

  if (expired) {
    return null;
  }

  if (!token || invalid) {
    return <Navigate to="/login" replace />;
  }

  return children;
};

export default ProtectedRoute;
