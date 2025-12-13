import { NextRequest, NextResponse } from 'next/server';
import db from '@/lib/db';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const productId = parseInt(id);
    
    const result = await db.execute({
      sql: `SELECT t.id, t.name, t.slug
            FROM tags t
            INNER JOIN product_tags pt ON t.id = pt.tag_id
            WHERE pt.product_id = ?
            ORDER BY t.name ASC`,
      args: [productId]
    });

    return NextResponse.json({ tags: result.rows });
  } catch (error) {
    console.error('Product tags fetch error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
