import { NextResponse } from 'next/server';
import { sql } from '@/lib/db';
import { revalidatePath } from 'next/cache';

export async function DELETE(
  _req: Request,
  { params }: { params: { id: string } }
) {
  try {
    await sql`DELETE FROM products WHERE id = ${params.id}`;
    revalidatePath('/');
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error('[DELETE /api/products/[id]]', error);
    return NextResponse.json({ error: 'Error al eliminar' }, { status: 500 });
  }
}