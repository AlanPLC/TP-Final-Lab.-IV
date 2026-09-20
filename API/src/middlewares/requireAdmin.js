// Defensa en profundidad: aunque el frontend en modo demo nunca manda estas
// peticiones de escritura para cuentas no-admin (ver apiInterceptor.js del
// front), el backend también las rechaza si alguien las manda a mano. Va
// siempre después de requireAuth (que deja req.user listo).
export function requireAdmin(req, res, next) {
    if (req.user.rol !== "admin") {
        return res.status(403).json({ errors: [{ msg: "Requiere una cuenta administradora." }] });
    }
    next();
}
