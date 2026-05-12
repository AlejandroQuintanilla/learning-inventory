# Arquitectura de datos — learning-inventory

## ¿Qué es una Foreign Key y qué implica?

Una **Foreign Key** (clave foránea) es una columna (o conjunto de columnas) de una tabla
que hace referencia a la **Primary Key** de otra tabla.  
En nuestro esquema, `products.category_id` es una FK que apunta a `categories.id`.

Esto tiene dos consecuencias directas:

| Propiedad | Descripción |
|-----------|-------------|
| **Integridad referencial** | La base de datos rechaza insertar un producto con un `category_id` que no exista en `categories`. |
| **Relación semántica** | Cada fila de `products` queda vinculada a exactamente una fila de `categories`, evitando datos huérfanos. |

Sin FK, nada impediría guardar `category_id = 'uuid-inventado'`, y las consultas
con JOIN devolverían resultados erróneos o incompletos.

---

## ON DELETE CASCADE vs ON DELETE RESTRICT

Cuando una categoría tiene productos asociados y ejecutamos `DELETE FROM categories WHERE id = ?`,
el motor debe decidir qué hacer con los productos que referencian esa categoría.

### ON DELETE CASCADE

> "Si se elimina la categoría, elimina automáticamente todos sus productos."

```sql
FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE CASCADE
```

- **Ventaja:** Mantenimiento automático; nunca quedan registros huérfanos.  
- **Riesgo:** Una sola sentencia `DELETE` puede borrar cientos de productos sin
  confirmación explícita. En un sistema de inventario real, esto puede ser **catastrófico**
  (pérdida accidental de datos de ventas, historial, etc.).

### ON DELETE RESTRICT (elegido en este proyecto)

> "Si la categoría tiene productos, el DELETE falla con un error."

```sql
FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE RESTRICT
```

- **Ventaja:** Protege la integridad de forma explícita. Obliga al desarrollador a
  decidir conscientemente qué hacer con los productos antes de borrar la categoría.
- **Flujo seguro:** primero reasignar o borrar los productos → después borrar la categoría.

### ¿Cuál es más seguro para un inventario?

**`ON DELETE RESTRICT`** es la opción más segura en un sistema de inventario porque:

1. Los productos tienen valor económico y no deben borrarse por accidente.
2. La eliminación de una categoría es una operación administrativa poco frecuente.
3. El error explícito del motor avisa al desarrollador de que hay dependencias pendientes,
   forzando una decisión deliberada sobre cada producto afectado.

`CASCADE` tiene sentido en entidades auxiliares sin valor propio (p. ej., tokens de sesión
vinculados a un usuario), pero no en datos de negocio como productos.

---

## Diagrama entidad-relación (simplificado)

```
┌──────────────────────┐          ┌─────────────────────────────┐
│      categories      │          │          products            │
├──────────────────────┤          ├─────────────────────────────┤
│ id          UUID  PK │◄─────────│ category_id  UUID  FK  NOT NULL│
│ name        VARCHAR  │  1 : N   │ id           UUID  PK       │
│ description TEXT     │          │ name         VARCHAR        │
│ created_at  TIMESTAMP│          │ price        NUMERIC >0     │
└──────────────────────┘          │ stock        INTEGER ≥0     │
                                  │ created_at   TIMESTAMP      │
                                  └─────────────────────────────┘
```

Una categoría puede tener **muchos** productos; un producto pertenece a **una** categoría.
