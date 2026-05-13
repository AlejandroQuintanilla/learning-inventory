'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';

type Product = {
  id: string;
  name: string;
  price: number;
  stock: number;
  category_name: string;
};

export default function ProductTable({ products }: { products: Product[] }) {
  const router = useRouter();
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const handleDelete = async (id: string) => {
    if (!confirm('¿Seguro que quieres eliminar este producto?')) return;
    setDeletingId(id);
    await fetch(`/api/products/${id}`, { method: 'DELETE' });
    setDeletingId(null);
    router.refresh();
  };

  if (products.length === 0) {
    return (
      <p style={{ color: 'var(--text-3)', fontFamily: 'var(--mono)', fontSize: '0.85rem' }}>
        No hay productos. Añade uno arriba.
      </p>
    );
  }

  return (
    <div style={{ overflowX: 'auto', borderRadius: 'var(--radius)', border: '1px solid var(--border)' }}>
      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead>
          <tr style={{ background: 'var(--surface)', borderBottom: '1px solid var(--border)' }}>
            {['Nombre', 'Categoría', 'Precio', 'Stock', ''].map((h, i) => (
              <th key={i} style={{
                padding: '0.75rem 1.25rem',
                textAlign: 'left',
                fontFamily: 'var(--mono)',
                fontSize: '0.68rem',
                textTransform: 'uppercase',
                letterSpacing: '0.1em',
                color: 'var(--text-3)',
                fontWeight: 500,
              }}>
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {products.map((p, i) => (
            <tr
              key={p.id}
              style={{
                background: i % 2 === 0 ? 'transparent' : 'rgba(255,255,255,0.015)',
                borderBottom: '1px solid var(--border)',
              }}
            >
              <td style={{ padding: '0.85rem 1.25rem', fontWeight: 600, color: 'var(--text-1)' }}>
                {p.name}
              </td>
              <td style={{ padding: '0.85rem 1.25rem' }}>
                <span style={{
                  background: 'var(--accent-dim)',
                  color: 'var(--accent)',
                  fontFamily: 'var(--mono)',
                  fontSize: '0.75rem',
                  padding: '0.2rem 0.6rem',
                  borderRadius: 4,
                }}>
                  {p.category_name}
                </span>
              </td>
              <td style={{
                padding: '0.85rem 1.25rem',
                fontFamily: 'var(--mono)',
                color: 'var(--green)',
                fontWeight: 500,
              }}>
                {Number(p.price).toFixed(2)} €
              </td>
              <td style={{ padding: '0.85rem 1.25rem' }}>
                <span style={{
                  color: p.stock < 20 ? 'var(--amber)' : 'var(--text-2)',
                  fontFamily: 'var(--mono)',
                  fontSize: '0.85rem',
                }}>
                  {p.stock}
                </span>
              </td>
              <td style={{ padding: '0.85rem 1.25rem' }}>
                <button
                  onClick={() => handleDelete(p.id)}
                  disabled={deletingId === p.id}
                  style={{
                    background: 'transparent',
                    border: '1px solid var(--red)',
                    color: 'var(--red)',
                    borderRadius: 5,
                    padding: '0.3rem 0.7rem',
                    fontFamily: 'var(--mono)',
                    fontSize: '0.75rem',
                    cursor: deletingId === p.id ? 'not-allowed' : 'pointer',
                    opacity: deletingId === p.id ? 0.5 : 1,
                  }}
                >
                  {deletingId === p.id ? '...' : 'Eliminar'}
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}