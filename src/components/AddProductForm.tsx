'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

type Category = { id: string; name: string };

export default function AddProductForm({ categories }: { categories: Category[] }) {
  const router = useRouter();
  const [form, setForm] = useState({ name: '', price: '', stock: '0', category_id: '' });
  const [status, setStatus] = useState<'idle' | 'loading' | 'ok' | 'error'>('idle');
  const [errMsg, setErrMsg] = useState('');

  const handle = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }));

  const submit = async () => {
    if (!form.name || !form.price || !form.category_id) {
      setStatus('error');
      setErrMsg('Nombre, precio y categoría son obligatorios.');
      return;
    }
    setStatus('loading');
    try {
      const res = await fetch('/api/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: form.name,
          price: parseFloat(form.price),
          stock: parseInt(form.stock, 10),
          category_id: form.category_id,
        }),
      });
      if (!res.ok) throw new Error((await res.json()).error);
      setStatus('ok');
      setForm({ name: '', price: '', stock: '0', category_id: '' });
      router.refresh(); // revalida el Server Component sin perder SPA
    } catch (e: any) {
      setStatus('error');
      setErrMsg(e.message ?? 'Error desconocido');
    }
  };

  const inputStyle: React.CSSProperties = {
    background: 'var(--bg)',
    border: '1px solid var(--border)',
    borderRadius: 6,
    color: 'var(--text-1)',
    fontFamily: 'var(--mono)',
    fontSize: '0.85rem',
    padding: '0.6rem 0.9rem',
    outline: 'none',
    width: '100%',
    transition: 'border-color 0.15s',
  };

  return (
    <div style={{
      background: 'var(--surface)',
      border: '1px solid var(--border)',
      borderRadius: 'var(--radius)',
      padding: '1.5rem',
    }}>
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
        gap: '1rem',
        marginBottom: '1rem',
      }}>
        <Field label="Nombre">
          <input name="name" value={form.name} onChange={handle} placeholder="Ej: MacBook Pro" style={inputStyle} />
        </Field>
        <Field label="Precio (€)">
          <input name="price" type="number" min="0.01" step="0.01" value={form.price} onChange={handle} placeholder="0.00" style={inputStyle} />
        </Field>
        <Field label="Stock">
          <input name="stock" type="number" min="0" value={form.stock} onChange={handle} style={inputStyle} />
        </Field>
        <Field label="Categoría">
          <select name="category_id" value={form.category_id} onChange={handle} style={inputStyle}>
            <option value="">— Selecciona —</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
        </Field>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
        <button
          onClick={submit}
          disabled={status === 'loading'}
          style={{
            background: status === 'loading' ? 'var(--border)' : 'var(--accent)',
            color: '#fff',
            border: 'none',
            borderRadius: 6,
            padding: '0.65rem 1.5rem',
            fontFamily: 'var(--sans)',
            fontWeight: 700,
            fontSize: '0.85rem',
            cursor: status === 'loading' ? 'not-allowed' : 'pointer',
            transition: 'opacity 0.15s',
          }}
        >
          {status === 'loading' ? 'Guardando…' : '+ Añadir producto'}
        </button>

        {status === 'ok' && (
          <span style={{ color: 'var(--green)', fontFamily: 'var(--mono)', fontSize: '0.8rem' }}>
            ✓ Producto añadido correctamente
          </span>
        )}
        {status === 'error' && (
          <span style={{ color: 'var(--red)', fontFamily: 'var(--mono)', fontSize: '0.8rem' }}>
            ✗ {errMsg}
          </span>
        )}
      </div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label style={{
        display: 'block',
        fontFamily: 'var(--mono)',
        fontSize: '0.68rem',
        color: 'var(--text-3)',
        textTransform: 'uppercase',
        letterSpacing: '0.1em',
        marginBottom: '0.35rem',
      }}>
        {label}
      </label>
      {children}
    </div>
  );
}
