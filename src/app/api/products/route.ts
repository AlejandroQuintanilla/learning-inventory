import { NextResponse } from 'next/server';
import { sql } from '@/lib/db';
import { revalidatePath } from 'next/cache';

export const dynamic = 'force-dynamic';

// GET /api/products
// Devuelve todos los productos con el nombre de su categoría.
// Usa INNER JOIN con consulta parametrizada (sin inyección SQL posible).
export async function GET() {
  try {
    const rows = await sql`
      SELECT
        p.id,
        p.name,
        p.price::float    AS price,
        p.stock,
        p.created_at,
        c.name            AS category_name,
        c.id              AS category_id
      FROM products p
      INNER JOIN categories c ON p.category_id = c.id
      ORDER BY c.name, p.name
    `;

    revalidatePath('/');
    return NextResponse.json({ products: rows });
  } catch (error) {
    console.error('[GET /api/products]', error);
    return NextResponse.json(
      { error: 'Error al obtener productos' },
      { status: 500 }
    );
  }
}

// POST /api/products
// Inserta un nuevo producto usando parámetros preparados.
// Valida la entrada con Zod antes de tocar la BD.
import { z } from 'zod';

const ProductSchema = z.object({
  name:        z.string().min(1).max(150),
  price:       z.number().positive(),
  stock:       z.number().int().min(0).default(0),
  category_id: z.string().uuid(),
});

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const parsed = ProductSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Datos inválidos', details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const { name, price, stock, category_id } = parsed.data;

    // Consulta parametrizada — el driver envía name, price, stock, category_id
    // como valores, nunca como texto SQL. Inyección SQL imposible.
    const rows = await sql`
      INSERT INTO products (name, price, stock, category_id)
      VALUES (${name}, ${price}, ${stock}, ${category_id})
      RETURNING id, name, price::float, stock, category_id, created_at
    `;

    return NextResponse.json({ product: rows[0] }, { status: 201 });
  } catch (error) {
    console.error('[POST /api/products]', error);
    return NextResponse.json(
      { error: 'Error al crear producto' },
      { status: 500 }
    );
  }
}
