import { db } from '../../config/db.js';

// Debajo de esta cantidad disponible, un producto se considera "poco
// stock" en el resumen de Inicio. Mismo criterio simple que MAX_PRODUCTOS
// en otros controllers: la app es para un minimarket chico, no hace falta
// que sea configurable.
const UMBRAL_STOCK_BAJO = 5;
// Lotes que vencen dentro de esta cantidad de días (o que ya vencieron) se
// listan en "por vencer/vencidos".
const DIAS_POR_VENCER = 7;

// Resumen para la pantalla de Inicio: todo lo que hace falta en una sola
// consulta desde el frontend, en vez de una por tarjeta - son todas
// lecturas independientes entre sí, así que corren en paralelo.
export const getEstadisticas = async (_req, res) => {
  try {
    const [
      ventasPorPeriodo,
      ventasUltimaSemana,
      ticketPromedio,
      ganancias,
      topProductos,
      stockBajo,
      vencimientos,
    ] = await Promise.all([
      // Ventas totales de hoy / esta semana (lunes a hoy) / este mes.
      db.query(`
        SELECT
          COALESCE(SUM(vd.cantidad_producto * vd.precio_unitario) FILTER (WHERE v.fecha >= CURRENT_DATE), 0) AS hoy,
          COALESCE(SUM(vd.cantidad_producto * vd.precio_unitario) FILTER (WHERE v.fecha >= date_trunc('week', CURRENT_DATE)), 0) AS semana,
          COALESCE(SUM(vd.cantidad_producto * vd.precio_unitario) FILTER (WHERE v.fecha >= date_trunc('month', CURRENT_DATE)), 0) AS mes
        FROM ventas v
        JOIN ventadetallada vd ON vd.ventas_id = v.id
      `),
      // Ventas día por día de los últimos 7 días, para la tabla de detalle.
      db.query(`
        SELECT
          DATE(v.fecha) AS dia,
          SUM(vd.cantidad_producto * vd.precio_unitario) AS total
        FROM ventas v
        JOIN ventadetallada vd ON vd.ventas_id = v.id
        WHERE v.fecha >= CURRENT_DATE - INTERVAL '6 days'
        GROUP BY DATE(v.fecha)
        ORDER BY dia DESC
      `),
      // Promedio de lo que deja CADA venta (no cada línea de producto).
      db.query(`
        SELECT COALESCE(AVG(total_venta), 0) AS promedio
        FROM (
          SELECT v.id, SUM(vd.cantidad_producto * vd.precio_unitario) AS total_venta
          FROM ventas v
          JOIN ventadetallada vd ON vd.ventas_id = v.id
          GROUP BY v.id
        ) por_venta
      `),
      // Bruta: ingreso total. Neta: ingreso menos el costo real de los lotes
      // consumidos (ventadetallada_lotes.precio_costo, congelado al vender).
      db.query(`
        WITH ingresos AS (
          SELECT COALESCE(SUM(vd.cantidad_producto * vd.precio_unitario), 0) AS total
          FROM ventadetallada vd
        ), costos AS (
          SELECT COALESCE(SUM(vdl.cantidad * vdl.precio_costo), 0) AS total
          FROM ventadetallada_lotes vdl
        )
        SELECT ingresos.total AS bruta, ingresos.total - costos.total AS neta
        FROM ingresos, costos
      `),
      // Top 5 productos más vendidos (por unidades), con su categoría.
      db.query(`
        SELECT
          p.nombre AS producto_nombre,
          pc.nombre AS categoria_nombre,
          SUM(vd.cantidad_producto) AS cantidad_vendida,
          SUM(vd.cantidad_producto * vd.precio_unitario) AS ingreso
        FROM ventadetallada vd
        JOIN productos p ON p.id = vd.producto_id
        LEFT JOIN productos_categorias pc ON pc.id = p.categoria_id
        GROUP BY p.id, p.nombre, pc.nombre
        ORDER BY cantidad_vendida DESC
        LIMIT 5
      `),
      // Productos con poco stock (o sin stock), sumando lotes activos.
      db.query(`
        SELECT
          p.id AS producto_id,
          p.nombre AS producto_nombre,
          pc.nombre AS categoria_nombre,
          COALESCE(stock.cantidad_disponible, 0) AS cantidad_disponible
        FROM productos p
        LEFT JOIN productos_categorias pc ON pc.id = p.categoria_id
        LEFT JOIN (
          SELECT producto_id, SUM(cantidad_restante) AS cantidad_disponible
          FROM lotes
          WHERE cantidad_restante > 0
          GROUP BY producto_id
        ) stock ON stock.producto_id = p.id
        WHERE COALESCE(stock.cantidad_disponible, 0) <= $1
        ORDER BY cantidad_disponible ASC, p.nombre ASC
        LIMIT 10
      `, [UMBRAL_STOCK_BAJO]),
      // Lotes vencidos o por vencer (con stock todavía activo - uno agotado
      // no importa aunque esté vencido).
      db.query(`
        SELECT
          l.id AS lote_id,
          p.nombre AS producto_nombre,
          prov.nombre AS proveedor_nombre,
          l.cantidad_restante,
          l.fecha_vencimiento,
          CASE WHEN l.fecha_vencimiento < CURRENT_DATE THEN 'vencido' ELSE 'por_vencer' END AS estado
        FROM lotes l
        JOIN productos p ON p.id = l.producto_id
        JOIN proveedores prov ON prov.id = l.proveedor_id
        WHERE l.cantidad_restante > 0
          AND l.fecha_vencimiento IS NOT NULL
          AND l.fecha_vencimiento <= CURRENT_DATE + $1 * INTERVAL '1 day'
        ORDER BY l.fecha_vencimiento ASC
        LIMIT 15
      `, [DIAS_POR_VENCER]),
    ]);

    res.status(200).json({
      ventas: {
        ...ventasPorPeriodo.rows[0],
        ultimaSemana: ventasUltimaSemana.rows,
      },
      ticketPromedio: ticketPromedio.rows[0].promedio,
      ganancias: ganancias.rows[0],
      topProductos: topProductos.rows,
      stockBajo: stockBajo.rows,
      vencimientos: vencimientos.rows,
    });
  } catch (error) {
    res.status(500).json({ errors: [{ msg: "Error al calcular las estadísticas." }], error: error.message });
  }
};
