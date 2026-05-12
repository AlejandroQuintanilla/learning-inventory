# Learning Inventory

Aplicación de gestión de inventario construida con **Next.js 14**, **Neon Postgres** y **Drizzle ORM**.  
Práctica de fundamentos de bases de datos relacionales — CFGS ASIR.

## Stack tecnológico

| Capa | Tecnología |
|------|-----------|
| Frontend | Next.js 14 (App Router) + React 18 |
| API | Next.js API Routes (Route Handlers) |
| Base de datos | PostgreSQL serverless via [Neon](https://neon.tech) |
| Driver SQL | `@neondatabase/serverless` |
| ORM | Drizzle ORM |
| Validación | Zod |
| Deploy | Vercel |

---

## Estructura del proyecto

```
learning-inventory/
├── sql/
│   ├── schema.sql          # DDL: CREATE TABLE categories, products
│   └── seed.sql            # DML: INSERTs, UPDATEs, DELETEs y consultas
├── docs/
│   ├── arquitectura-datos.md   # Foreign keys, CASCADE vs RESTRICT
│   ├── analisis-sql.md         # INNER JOIN vs LEFT JOIN, GROUP BY
│   └── seguridad-db.md         # SQL injection, consultas parametrizadas
├── src/
│   ├── app/
│   │   ├── page.tsx            # Server Component — obtiene datos directamente
│   │   ├── layout.tsx
│   │   ├── globals.css
│   │   └── api/
│   │       ├── products/route.ts   # GET (JOIN) + POST (parametrizado + Zod)
│   │       └── categories/route.ts # GET (Drizzle ORM)
│   ├── components/
│   │   ├── ProductTable.tsx    # Tabla de productos con hover
│   │   └── AddProductForm.tsx  # Formulario con fetch + router.refresh()
│   ├── db/
│   │   └── schema.ts           # Esquema Drizzle tipado en TypeScript
│   └── lib/
│       └── db.ts               # Instancia de sql (raw) y db (Drizzle)
├── drizzle.config.ts
├── .env.local.example
└── .gitignore
```

---

## Instalación y ejecución local

### 1. Clonar el repositorio

```bash
git clone https://github.com/TU_USUARIO/learning-inventory.git
cd learning-inventory
```

### 2. Instalar dependencias

```bash
npm install
```

### 3. Configurar Neon

1. Regístrate en [neon.tech](https://neon.tech) y crea un proyecto llamado `learning-inventory`.
2. En el dashboard de Neon, ve a **SQL Editor** y ejecuta en orden:
   - `sql/schema.sql` — crea las tablas
   - `sql/seed.sql` — inserta datos de prueba
3. Copia el **connection string** desde el dashboard (pestaña *Connection Details*).

### 4. Variables de entorno

```bash
cp .env.local.example .env.local
```

Edita `.env.local` y pega tu connection string:

```
DATABASE_URL=postgresql://usuario:contraseña@ep-xxxx.region.aws.neon.tech/neondb?sslmode=require
```

### 5. Ejecutar en desarrollo

```bash
npm run dev
```

Abre [http://localhost:3000](http://localhost:3000).

---

## Deploy en Vercel

1. Sube el repositorio a GitHub.
2. En [vercel.com](https://vercel.com), importa el repo.
3. En **Settings → Environment Variables**, añade:
   - `DATABASE_URL` → tu connection string de Neon
4. Haz click en **Deploy**. Vercel detecta Next.js automáticamente.

> ⚠️ Nunca subas `.env.local` a GitHub. Está en `.gitignore`.

---

## API Reference

### `GET /api/products`

Devuelve todos los productos con INNER JOIN a su categoría.

```json
{
  "products": [
    {
      "id": "uuid",
      "name": "Smartphone Pro X",
      "price": 879.989,
      "stock": 47,
      "category_name": "Electrónica"
    }
  ]
}
```

### `POST /api/products`

Crea un nuevo producto. Usa consultas parametrizadas y validación Zod.

**Body:**
```json
{
  "name": "Nuevo producto",
  "price": 29.99,
  "stock": 10,
  "category_id": "uuid-de-la-categoria"
}
```

### `GET /api/categories`

Devuelve todas las categorías (usando Drizzle ORM).

---

## Drizzle ORM — ventaja sobre SQL puro

Escribir SQL puro es esencial para entender los fundamentos (y es lo que hace este
proyecto en `sql/schema.sql` y en el endpoint GET con INNER JOIN), pero en proyectos
grandes aparecen problemas:

- Una columna renombrada en la BD rompe silenciosamente todas las queries en runtime.
- No hay autocompletado ni verificación de tipos en el editor.
- Los JOINs complejos son difíciles de mantener y refactorizar.

**Drizzle ORM** resuelve esto definiendo el esquema en TypeScript:

```ts
// src/db/schema.ts
export const products = pgTable('products', {
  id:         uuid('id').primaryKey().defaultRandom(),
  name:       varchar('name', { length: 150 }).notNull(),
  price:      numeric('price', { precision: 10, scale: 2 }).notNull(),
  categoryId: uuid('category_id').notNull().references(() => categories.id),
});
```

Con esto:

1. **Seguridad de tipos en tiempo de compilación** — si accedes a `product.pricee`
   TypeScript falla en build, no en producción.
2. **Autocompletado completo** — el editor conoce todos los campos y sus tipos.
3. **Migraciones versionadas** — `drizzle-kit generate` produce archivos SQL de
   migración reproducibles, como Git pero para el esquema.
4. **Sin SQL injection estructural** — la API de Drizzle no permite concatenar
   strings en queries; los valores siempre van como parámetros preparados.
5. **Refactoring seguro** — renombrar una columna en el schema hace que TypeScript
   marque todos los usos incorrectos inmediatamente.

La combinación SQL puro (para entender qué ocurre) + ORM tipado (para producción)
es el stack que usan la mayoría de equipos profesionales hoy en día.

---

## Documentación adicional

- [`docs/arquitectura-datos.md`](docs/arquitectura-datos.md) — Modelo relacional, FK, CASCADE vs RESTRICT
- [`docs/analisis-sql.md`](docs/analisis-sql.md) — INNER JOIN vs LEFT JOIN, GROUP BY
- [`docs/seguridad-db.md`](docs/seguridad-db.md) — SQL injection y consultas parametrizadas
