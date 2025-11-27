import { NextRequest, NextResponse } from 'next/server';
import db from '@/lib/db';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const productId = parseInt(params.id);
    
    const product = db.prepare('SELECT * FROM products WHERE id = ?').get(productId) as any;
    
    if (!product) {
      return NextResponse.json(
        { error: 'Product not found' },
        { status: 404 }
      );
    }

    const versions = db.prepare(`
      SELECT * FROM product_versions 
      WHERE product_id = ? 
      ORDER BY variation_type, name
    `).all(productId) as any[];

    return NextResponse.json({
      product,
      versions,
    });
  } catch (error) {
    console.error('Product fetch error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

