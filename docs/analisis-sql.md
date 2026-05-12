# Análisis SQL — learning-inventory

## INNER JOIN vs LEFT JOIN

### INNER JOIN

Devuelve **solo las filas que tienen correspondencia en ambas tablas**.
Si una fila de la tabla izquierda no encuentra pareja en la tabla derecha, desaparece
del resultado.

**Escenario real:** Queremos listar los productos y su categoría para mostrarlos en
una tienda online. Solo nos interesan productos que tengan categoría válida asignada;
un producto sin categoría no debería aparecer en el catálogo.

```sql
SELECT
  p.name    AS producto,
  p.price   AS precio,
  c.name    AS categoria
FROM products p
INNER JOIN categories c ON p.category_id = c.id;
```

Si existiera un producto con `category_id = NULL` o un UUID inexistente en `categories`,
ese producto no aparecería en el resultado.

---

### LEFT JOIN

Devuelve **todas las filas de la tabla izquierda**, y las columnas de la tabla derecha
con `NULL` cuando no hay coincidencia.

**Escenario real:** Queremos saber cuántos productos tiene cada categoría, incluyendo
las categorías que todavía no tienen ningún producto asignado (p. ej., una categoría
recién creada llamada "Jardín" que aún no tiene productos).

```sql
SELECT
  c.name       AS categoria,
  COUNT(p.id)  AS total_productos
FROM categories c
LEFT JOIN products p ON c.id = p.category_id
GROUP BY c.name
ORDER BY total_productos DESC;
```

Con `INNER JOIN` las categorías vacías desaparecerían del resultado.
Con `LEFT JOIN` aparecen con `total_productos = 0`, que es exactamente la información
que necesitamos para una vista de administración.

---

### Tabla comparativa

| Característica | INNER JOIN | LEFT JOIN |
|----------------|-----------|-----------|
| Filas devueltas | Solo con coincidencia en ambas tablas | Todas las de la tabla izquierda |
| Sin pareja | La fila desaparece | Columnas de la derecha = NULL |
| Uso típico | Datos relacionados obligatoriamente | Auditoría, informes, datos opcionales |

---

## GROUP BY y funciones agregadas

`GROUP BY` colapsa múltiples filas con el mismo valor en una sola fila de resumen,
sobre la que se pueden aplicar funciones como `COUNT()`, `SUM()`, `AVG()`, `MAX()`.

```sql
-- ¿Cuántos productos tiene cada categoría?
SELECT
  c.name         AS categoria,
  COUNT(p.id)    AS total_productos,
  AVG(p.price)   AS precio_medio
FROM categories c
LEFT JOIN products p ON c.id = p.category_id
GROUP BY c.name
ORDER BY total_productos DESC;
```

> **Nota:** `COUNT(p.id)` cuenta solo las filas donde `p.id` no es NULL,
> por lo que las categorías sin productos devuelven 0, no 1.
> Usar `COUNT(*)` en su lugar contaría la fila NULL como 1, que sería incorrecto.
