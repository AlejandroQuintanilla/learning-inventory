# Seguridad en base de datos — learning-inventory

## ¿Qué es una inyección SQL?

Una **SQL Injection** ocurre cuando la entrada del usuario se concatena directamente
en una sentencia SQL, permitiendo al atacante **modificar la estructura de la consulta**.

### Ejemplo vulnerable

```ts
// ❌ NUNCA hacer esto
const name = req.body.name; // el atacante envía: "x'; DROP TABLE products; --"

const query = `SELECT * FROM products WHERE name = '${name}'`;
// La consulta resultante sería:
// SELECT * FROM products WHERE name = 'x'; DROP TABLE products; --'
// → Borra toda la tabla products
```

Otro ejemplo clásico para saltarse autenticación:

```ts
// Atacante envía como email: admin'--
const query = `SELECT * FROM users WHERE email = '${email}' AND password = '${password}'`;
// Resultado: SELECT * FROM users WHERE email = 'admin'--' AND password = '...'
// El -- comenta el resto → autenticación anulada
```

---

## Consultas parametrizadas: la solución

Con **parámetros preparados**, el driver de base de datos envía la consulta y los datos
por **canales separados**. El motor recibe los valores como datos literales, nunca como
código SQL ejecutable.

### Con `@neondatabase/serverless`

```ts
import { neon } from '@neondatabase/serverless';
const sql = neon(process.env.DATABASE_URL!);

// ✅ Seguro: $1, $2 son placeholders tipados
const products = await sql`
  SELECT p.name, p.price, c.name AS category
  FROM products p
  INNER JOIN categories c ON p.category_id = c.id
  WHERE p.name = ${userInput}
`;
```

El driver de Neon usa **template literals etiquetados** que internamente generan
consultas parametrizadas (`$1`, `$2`…). El valor `userInput` nunca se interpola
como texto SQL; se transmite por separado al servidor Postgres.

### Con Drizzle ORM (abstracción superior)

```ts
// ✅ Drizzle genera SQL parametrizado automáticamente
const result = await db
  .select()
  .from(products)
  .where(eq(products.name, userInput));
```

Drizzle no permite concatenación directa; su API de consultas tipadas hace
que la inyección sea estructuralmente imposible.

---

## Variables de entorno: proteger el connection string

El connection string de Neon contiene **usuario, contraseña y host** en texto plano.
Si se sube a GitHub, cualquiera con acceso al repositorio puede acceder a la base de datos.

### Reglas de oro

1. Guardar en `.env.local` (Next.js) o `.env` (Node/Express) — **nunca commitear**.
2. Añadir al `.gitignore`:
   ```
   .env
   .env.local
   .env*.local
   ```
3. En Vercel, añadir como **variable de entorno en el dashboard**, nunca en el código.
4. Usar `process.env.DATABASE_URL` en el código, no el valor literal.

```ts
// lib/db.ts
import { neon } from '@neondatabase/serverless';

if (!process.env.DATABASE_URL) {
  throw new Error('DATABASE_URL no está definida en las variables de entorno');
}

export const sql = neon(process.env.DATABASE_URL);
```

---

## Resumen de medidas implementadas

| Medida | Implementación |
|--------|---------------|
| Consultas parametrizadas | Template literals de `@neondatabase/serverless` |
| ORM tipado | Drizzle ORM — sin SQL dinámico manual |
| Variables de entorno | `.env.local` + `.gitignore` + Vercel env vars |
| Validación de entrada | Zod en endpoints POST |
| Constraint de BD | `CHECK (price > 0)`, `NOT NULL`, `UNIQUE` en schema.sql |
