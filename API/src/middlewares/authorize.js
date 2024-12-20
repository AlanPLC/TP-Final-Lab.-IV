export const authorizeAdmin = (req, res, next) => {
    if (req.user.rol !== 'administrador') {
      return res.status(403).json({ message: 'Acceso denegado.' });
    }
    next();
  };