import { sql } from '@/lib/db';
import ProductTable from '@/components/ProductTable';
import AddProductForm from '@/components/AddProductForm';

// Server Component: fetches data directly, no useEffect needed
async function getProducts() {
  const rows = await sql`
    SELECT
      p.id,
      p.name,
      p.price::float    AS price,
      p.stock,
      c.name            AS category_name
    FROM products p
    INNER JOIN categories c ON p.category_id = c.id
    ORDER BY c.name, p.name
  `;
  return rows;
}

async function getCategories() {
  const rows = await sql`SELECT id, name FROM categories ORDER BY name`;
  return rows;
}

export default async function Home() {
  const [products, categories] = await Promise.all([
    getProducts(),
    getCategories(),
  ]);

  return (
    <main style={{ maxWidth: 1100, margin: '0 auto', padding: '2.5rem 1.5rem' }}>
      <header style={{ marginBottom: '3rem' }}>
        <p style={{
          fontFamily: 'var(--mono)',
          fontSize: '0.75rem',
          color: 'var(--accent)',
          letterSpacing: '0.15em',
          textTransform: 'uppercase',
          marginBottom: '0.5rem',
        }}>
          PostgreSQL · Neon · Drizzle ORM
        </p>
        <h1 style={{
          fontFamily: 'var(--sans)',
          fontSize: 'clamp(2rem, 5vw, 3.2rem)',
          fontWeight: 800,
          lineHeight: 1.1,
          color: 'var(--text-1)',
        }}>
          Learning Inventory
        </h1>
        <p style={{ color: 'var(--text-2)', marginTop: '0.75rem', fontSize: '1rem' }}>
          Datos reales desde Neon Postgres — sin localStorage, sin estado volátil.
        </p>
      </header>

      {/* Stats strip */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))',
        gap: '1rem',
        marginBottom: '2.5rem',
      }}>
        <StatCard label="Productos" value={products.length} color="var(--accent)" />
        <StatCard label="Categorías" value={categories.length} color="var(--green)" />
        <StatCard
          label="Stock total"
          value={(products as any[]).reduce((s: number, p: any) => s + p.stock, 0)}
          color="var(--amber)"
        />
      </div>

      {/* Add product form */}
      <section style={{ marginBottom: '2.5rem' }}>
        <SectionTitle>Añadir producto</SectionTitle>
        <AddProductForm categories={categories as any[]} />
      </section>

      {/* Product table */}
      <section>
        <SectionTitle>Inventario completo</SectionTitle>
        <ProductTable products={products as any[]} />
      </section>
    </main>
  );
}

function StatCard({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <div style={{
      background: 'var(--surface)',
      border: '1px solid var(--border)',
      borderRadius: 'var(--radius)',
      padding: '1.25rem 1.5rem',
      borderTop: `3px solid ${color}`,
    }}>
      <p style={{ fontFamily: 'var(--mono)', fontSize: '0.7rem', color: 'var(--text-3)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '0.4rem' }}>
        {label}
      </p>
      <p style={{ fontSize: '2rem', fontWeight: 700, color }}>
        {value}
      </p>
    </div>
  );
}

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <h2 style={{
      fontSize: '0.75rem',
      fontFamily: 'var(--mono)',
      color: 'var(--text-3)',
      textTransform: 'uppercase',
      letterSpacing: '0.12em',
      marginBottom: '1rem',
      paddingBottom: '0.5rem',
      borderBottom: '1px solid var(--border)',
    }}>
      {children}
    </h2>
  );
}
