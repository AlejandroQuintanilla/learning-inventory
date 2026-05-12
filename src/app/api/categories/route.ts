import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { categories } from '@/db/schema';

export const dynamic = 'force-dynamic';

// GET /api/categories
// Usa Drizzle ORM para demostrar la abstracción tipada.
export async function GET() {
  try {
    // Drizzle genera internamente: SELECT * FROM categories ORDER BY name
    // con parámetros preparados, sin SQL dinámico.
    const rows = await db.select().from(categories).orderBy(categories.name);
    return NextResponse.json({ categories: rows });
  } catch (error) {
    console.error('[GET /api/categories]', error);
    return NextResponse.json(
      { error: 'Error al obtener categorías' },
      { status: 500 }
    );
  }
}
