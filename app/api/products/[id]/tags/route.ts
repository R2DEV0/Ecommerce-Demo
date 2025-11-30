import { NextRequest, NextResponse } from 'next/server';
import db from '@/lib/db';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const productId = parseInt(params.id);
    
    const tags = db.prepare(`
      SELECT t.id, t.name, t.slug
      FROM tags t
      INNER JOIN product_tags pt ON t.id = pt.tag_id
      WHERE pt.product_id = ?
      ORDER BY t.name ASC
    `).all(productId) as Array<{ id: number; name: string; slug: string }>;

    return NextResponse.json({ tags });
  } catch (error) {
    console.error('Product tags fetch error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

