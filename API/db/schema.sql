-- Schema reconstruido a partir de las queries del backend (API/src/controllers y validations),
-- ya que no existía un dump del MySQL original. Pensado para Postgres/Supabase.
--
-- Notas de migración:
-- * La columna "user" de usuarios se deja entre comillas dobles en TODAS las queries
--   porque `user` es palabra reservada en Postgres (alias de CURRENT_USER).
-- * Stock por lotes (FIFO/FEFO, ver lotes más abajo): reemplaza al viejo
--   producto_stock (un contador único por producto). El stock de un producto
--   es la suma de cantidad_restante de sus lotes activos.
-- * proveedor_id vive SOLO en lotes, no en productos: un mismo producto puede
--   tener lotes de distintos proveedores a lo largo del tiempo.
-- * lotes.producto_id y lotes.proveedor_id son RESTRICT (no CASCADE) a
--   propósito: una vez que un producto/proveedor tiene lotes cargados
--   (más aún si esos lotes ya tienen ventas encima), borrarlo rompería el
--   historial de ventas/costos - hay que bloquear el borrado antes que
--   perder esa trazabilidad.

CREATE TABLE IF NOT EXISTS usuarios (
  id SERIAL PRIMARY KEY,
  "user" VARCHAR(20) NOT NULL UNIQUE,
  password VARCHAR(100) NOT NULL,
  rol VARCHAR(20) NOT NULL DEFAULT 'vendedor' CHECK (rol = 'vendedor')
);

CREATE TABLE IF NOT EXISTS proveedores (
  id SERIAL PRIMARY KEY,
  nombre VARCHAR(50) NOT NULL UNIQUE,
  descripcion VARCHAR(255)
);

CREATE TABLE IF NOT EXISTS productos_categorias (
  id SERIAL PRIMARY KEY,
  nombre VARCHAR(50) NOT NULL UNIQUE
);

CREATE TABLE IF NOT EXISTS productos (
  id SERIAL PRIMARY KEY,
  nombre VARCHAR(100) NOT NULL,
  descripcion VARCHAR(255),
  -- Opcional a propósito: el flujo real es cargar el producto primero y el
  -- lote (con su costo) después - recién ahí se sabe cuánto costó de verdad
  -- y se puede poner un precio de venta con criterio.
  precio NUMERIC(10, 2) CHECK (precio > 0),
  categoria_id INTEGER REFERENCES productos_categorias(id) ON DELETE SET NULL,
  imagen_url TEXT
);

-- Cada carga de mercadería es un lote propio: producto + proveedor + cantidad
-- + costo de compra + vencimiento opcional. El orden FIFO/FEFO de venta es
-- por fecha_vencimiento (el que vence antes, se vende antes) y a igualdad de
-- vencimiento (o sin vencimiento), por fecha_ingreso (el que entró antes).
CREATE TABLE IF NOT EXISTS lotes (
  id SERIAL PRIMARY KEY,
  producto_id INTEGER NOT NULL REFERENCES productos(id),
  proveedor_id INTEGER NOT NULL REFERENCES proveedores(id),
  precio_costo NUMERIC(10, 2) NOT NULL CHECK (precio_costo > 0),
  cantidad_inicial INTEGER NOT NULL CHECK (cantidad_inicial > 0),
  cantidad_restante INTEGER NOT NULL CHECK (cantidad_restante >= 0),
  fecha_ingreso TIMESTAMP NOT NULL DEFAULT NOW(),
  fecha_vencimiento DATE
);

CREATE TABLE IF NOT EXISTS ventas (
  id SERIAL PRIMARY KEY,
  usuario_id INTEGER NOT NULL REFERENCES usuarios(id),
  fecha TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS ventadetallada (
  id SERIAL PRIMARY KEY,
  ventas_id INTEGER NOT NULL REFERENCES ventas(id) ON DELETE CASCADE,
  producto_id INTEGER NOT NULL REFERENCES productos(id),
  cantidad_producto INTEGER NOT NULL CHECK (cantidad_producto > 0),
  -- Precio de venta al momento de vender (no el precio actual del producto),
  -- para que el margen histórico no cambie si después se actualiza el precio.
  precio_unitario NUMERIC(10, 2)
);

-- Trazabilidad FIFO: de qué lote(s) salió cada línea de venta (una venta de
-- 5 unidades puede tomar 3 de un lote y 2 del siguiente). precio_costo queda
-- congelado acá también, por la misma razón que precio_unitario arriba.
CREATE TABLE IF NOT EXISTS ventadetallada_lotes (
  id SERIAL PRIMARY KEY,
  ventadetallada_id INTEGER NOT NULL REFERENCES ventadetallada(id) ON DELETE CASCADE,
  lote_id INTEGER NOT NULL REFERENCES lotes(id),
  cantidad INTEGER NOT NULL CHECK (cantidad > 0),
  precio_costo NUMERIC(10, 2) NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_productos_categoria ON productos(categoria_id);
CREATE INDEX IF NOT EXISTS idx_lotes_producto_fifo ON lotes(producto_id, fecha_vencimiento, fecha_ingreso);
CREATE INDEX IF NOT EXISTS idx_lotes_proveedor ON lotes(proveedor_id);
CREATE INDEX IF NOT EXISTS idx_ventadetallada_ventas ON ventadetallada(ventas_id);
CREATE INDEX IF NOT EXISTS idx_ventadetallada_producto ON ventadetallada(producto_id);
CREATE INDEX IF NOT EXISTS idx_ventadetallada_lotes_detalle ON ventadetallada_lotes(ventadetallada_id);
CREATE INDEX IF NOT EXISTS idx_ventadetallada_lotes_lote ON ventadetallada_lotes(lote_id);
CREATE INDEX IF NOT EXISTS idx_ventas_usuario ON ventas(usuario_id);
