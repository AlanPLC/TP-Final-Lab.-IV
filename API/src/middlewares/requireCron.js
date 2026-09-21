// Protege el endpoint que corre las fechas de la demo hacia adelante (ver
// demoController.js) - lo dispara el cron de Vercel, no un usuario logueado,
// así que no tiene sentido pedirle un JWT. Vercel manda automáticamente
// "Authorization: Bearer <CRON_SECRET>" en cada invocación programada (ver
// vercel.json) cuando existe esa env var - alcanza con compararla acá.
// Si CRON_SECRET no está configurada, se rechaza siempre: mejor un cron roto
// hasta cargarla que un endpoint de escritura abierto sin querer.
export function requireCron(req, res, next) {
  const secret = process.env.CRON_SECRET;
  const auth = req.headers.authorization;
  if (!secret || auth !== `Bearer ${secret}`) {
    return res.status(401).json({ errors: [{ msg: "No autorizado." }] });
  }
  next();
}
