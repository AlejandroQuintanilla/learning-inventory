-- ============================================================
-- seed.sql — learning-inventory
-- Poblar la base de datos con datos de prueba
-- ============================================================

-- ------------------------------------------------------------
-- 1. Categorías
-- ------------------------------------------------------------
INSERT INTO categories (name, description) VALUES
  ('Electrónica',  'Dispositivos tecnológicos y accesorios'),
  ('Hogar',        'Muebles, decoración y utensilios'),
  ('Deportes',     'Material deportivo y ropa técnica'),
  ('Alimentación', 'Productos de alimentación y bebidas');

-- ------------------------------------------------------------
-- 2. Productos  (usamos subconsultas para referenciar UUIDs)
-- ------------------------------------------------------------
INSERT INTO products (name, price, stock, category_id) VALUES
  ('Smartphone Pro X',   799.99, 50, (SELECT id FROM categories WHERE name = 'Electrónica')),
  ('Auriculares BT 500',  89.99, 120, (SELECT id FROM categories WHERE name = 'Electrónica')),
  ('Teclado Mecánico',    59.99,  75, (SELECT id FROM categories WHERE name = 'Electrónica')),
  ('Monitor 27" 4K',     349.99,  30, (SELECT id FROM categories WHERE name = 'Electrónica')),
  ('Sofá Modular',       599.00,  10, (SELECT id FROM categories WHERE name = 'Hogar')),
  ('Lámpara de Pie',      49.99,  40, (SELECT id FROM categories WHERE name = 'Hogar')),
  ('Silla Ergonómica',   249.00,  25, (SELECT id FROM categories WHERE name = 'Hogar')),
  ('Zapatillas Running',  94.95,  80, (SELECT id FROM categories WHERE name = 'Deportes')),
  ('Mancuernas 10kg',     34.99,  60, (SELECT id FROM categories WHERE name = 'Deportes')),
  ('Aceite de Oliva 5L',  18.50, 200, (SELECT id FROM categories WHERE name = 'Alimentación')),
  ('Café Arábica 1kg',    12.99, 150, (SELECT id FROM categories WHERE name = 'Alimentación'));

-- ------------------------------------------------------------
-- 3. Simular una venta (restar stock)
-- ------------------------------------------------------------
UPDATE products
SET stock = stock - 3
WHERE name = 'Smartphone Pro X';

-- ------------------------------------------------------------
-- 4. Subida de precio del 10 % en Electrónica
-- ------------------------------------------------------------
UPDATE products
SET price = price * 1.10
WHERE category_id = (SELECT id FROM categories WHERE name = 'Electrónica');

-- ------------------------------------------------------------
-- 5. Eliminar un producto obsoleto
-- ------------------------------------------------------------
DELETE FROM products
WHERE name = 'Teclado Mecánico';

-- ------------------------------------------------------------
-- CONSULTA 1: INNER JOIN — producto, precio y categoría
-- Solo aparecen productos que tienen categoría asignada.
-- ------------------------------------------------------------
SELECT
  p.name        AS producto,
  p.price       AS precio,
  c.name        AS categoria
FROM products p
INNER JOIN categories c ON p.category_id = c.id
ORDER BY c.name, p.name;

-- ------------------------------------------------------------
-- CONSULTA 2: GROUP BY + COUNT — productos por categoría
-- Incluye categorías con 0 productos (LEFT JOIN).
-- ------------------------------------------------------------
SELECT
  c.name              AS categoria,
  COUNT(p.id)         AS total_productos
FROM categories c
LEFT JOIN products p ON c.id = p.category_id
GROUP BY c.name
ORDER BY total_productos DESC;
