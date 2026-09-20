import passport from "passport";
import jwt from "jsonwebtoken";

// Reemite el JWT con la expiración corrida una hora más desde ahora, en vez
// de dejar que valga solo hasta 1h después del login (ver authController.js,
// que firma el primero con el mismo expiresIn). Va en un header propio (ver
// app.js, que lo expone por CORS, y el interceptor de fetch del front que lo
// relee) - así la sesión se mantiene mientras el usuario siga pidiendo cosas
// a la API, y solo expira de verdad si pasa una hora entera sin ninguna.
function renovarToken(req, res, next) {
  const payload = { id: req.user.id, user: req.user.user, rol: req.user.rol };
  const token = jwt.sign(payload, process.env.SECRET_KEY, { expiresIn: "1h" });
  res.set("X-Renewed-Token", token);
  next();
}

// Middleware combinado para toda ruta protegida - autentica con el JWT del
// header y, si es válido, lo renueva. Se usa con spread (...requireAuth) en
// vez de un passport.authenticate(...) suelto.
export const requireAuth = [passport.authenticate("jwt", { session: false }), renovarToken];
