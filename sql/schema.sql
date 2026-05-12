-- ============================================================
-- schema.sql — learning-inventory
-- Ejecutar en la consola SQL de Neon
-- ============================================================

-- Extensión para generar UUIDs (disponible por defecto en Neon/Postgres 14+)
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ------------------------------------------------------------
-- TABLA: categories
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS categories (
  id          UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  name        VARCHAR(100) UNIQUE NOT NULL,
  description TEXT,
  created_at  TIMESTAMP   DEFAULT CURRENT_TIMESTAMP
);

-- ------------------------------------------------------------
-- TABLA: products
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS products (
  id          UUID           PRIMARY KEY DEFAULT gen_random_uuid(),
  name        VARCHAR(150)   NOT NULL,
  price       NUMERIC(10, 2) NOT NULL CHECK (price > 0),
  stock       INTEGER        NOT NULL DEFAULT 0,
  category_id UUID           NOT NULL,
  created_at  TIMESTAMP      DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT fk_category
    FOREIGN KEY (category_id)
    REFERENCES categories(id)
    ON DELETE RESTRICT
);
