-- Schema reconstruido a partir de las queries del backend (API/src/controllers y validations),
-- ya que no existía un dump del MySQL original. Pensado para Postgres/Supabase.
--
-- Notas de migración:
-- * La columna "user" de usuarios se deja entre comillas dobles en TODAS las queries
--   porque `user` es palabra reservada en Postgres (alias de CURRENT_USER).
-- * producto_stock.producto_id es UNIQUE porque el flujo real (productosConDetallesController)
--   crea/actualiza siempre un único registro de stock por producto.

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
  precio NUMERIC(10, 2) NOT NULL CHECK (precio > 0),
  categoria_id INTEGER REFERENCES productos_categorias(id) ON DELETE SET NULL,
  proveedor_id INTEGER REFERENCES proveedores(id) ON DELETE SET NULL,
  imagen_url TEXT
);

CREATE TABLE IF NOT EXISTS producto_stock (
  id SERIAL PRIMARY KEY,
  producto_id INTEGER NOT NULL UNIQUE REFERENCES productos(id) ON DELETE CASCADE,
  cantidad_disponible INTEGER NOT NULL DEFAULT 0 CHECK (cantidad_disponible >= 0),
  fecha_ultima_actualizacion TIMESTAMP NOT NULL DEFAULT NOW()
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
  cantidad_producto INTEGER NOT NULL CHECK (cantidad_producto > 0)
);

CREATE INDEX IF NOT EXISTS idx_productos_categoria ON productos(categoria_id);
CREATE INDEX IF NOT EXISTS idx_productos_proveedor ON productos(proveedor_id);
CREATE INDEX IF NOT EXISTS idx_ventadetallada_ventas ON ventadetallada(ventas_id);
CREATE INDEX IF NOT EXISTS idx_ventadetallada_producto ON ventadetallada(producto_id);
CREATE INDEX IF NOT EXISTS idx_ventas_usuario ON ventas(usuario_id);
