import { NextRequest, NextResponse } from 'next/server';
import db from '@/lib/db';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const productId = parseInt(id);
    
    const productResult = await db.execute({
      sql: 'SELECT * FROM products WHERE id = ?',
      args: [productId]
    });
    const product = productResult.rows[0];
    
    if (!product) {
      return NextResponse.json(
        { error: 'Product not found' },
        { status: 404 }
      );
    }

    const versionsResult = await db.execute({
      sql: `SELECT * FROM product_versions 
            WHERE product_id = ? 
            ORDER BY variation_type, name`,
      args: [productId]
    });

    return NextResponse.json({
      product,
      versions: versionsResult.rows,
    });
  } catch (error) {
    console.error('Product fetch error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
