import { db } from "../../config/db.js";

// La demo se sembró una sola vez con fechas fijas (ventas de los últimos ~30
// días, lotes con vencimientos cerca de esa fecha) - sin nada que las
// actualice, con el correr de los días "Hoy" en Inicio queda en $0 (ninguna
// venta tiene fecha >= CURRENT_DATE) y, más adelante, TODOS los lotes
// terminan marcados como vencidos (fecha_vencimiento siempre en el pasado).
//
// En vez de resembrar todo, se corren las fechas existentes hacia adelante
// la cantidad de días necesaria para que la venta más reciente vuelva a caer
// "hoy" - ventas y lotes se corren por igual, así que el espaciado relativo
// entre ellos (qué lote es más viejo, qué venta pasó antes que cuál, cuánto
// falta para cada vencimiento) queda intacto, solo se desliza la línea de
// tiempo entera para alcanzar la fecha real actual.
export const refrescarDemo = async (_req, res) => {
  try {
    const { rows } = await db.query(
      `SELECT (CURRENT_DATE - MAX(fecha)::date) AS dias FROM ventas`
    );
    const dias = rows[0]?.dias;

    // Sin ventas todavía, o la más reciente ya es de hoy (no debería pasar
    // si el cron corre una vez por día, pero no hay nada para correr igual).
    if (!dias || dias <= 0) {
      return res.status(200).json({
        message: "No había nada para correr - los datos ya están al día.",
        dias: dias ?? 0,
      });
    }

    await db.query(
      `UPDATE ventas SET fecha = fecha + ($1 || ' days')::interval`,
      [dias]
    );
    await db.query(
      `UPDATE lotes SET
         fecha_ingreso = fecha_ingreso + ($1 || ' days')::interval,
         fecha_vencimiento = fecha_vencimiento + ($1 || ' days')::interval`,
      [dias]
    );

    res.status(200).json({
      message: "Datos de demo corridos hacia adelante.",
      dias,
    });
  } catch (error) {
    res.status(500).json({
      errors: [{ msg: "Error al refrescar los datos de demo." }],
      error: error.message,
    });
  }
};
