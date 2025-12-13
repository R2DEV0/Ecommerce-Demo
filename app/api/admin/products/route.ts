import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/auth';
import db from '@/lib/db';

export async function POST(request: NextRequest) {
  try {
    await requireAdmin();
    const { product, versions, tags } = await request.json();

    if (!product.name || product.price === undefined) {
      return NextResponse.json(
        { error: 'Product name and price are required' },
        { status: 400 }
      );
    }

    // Insert product
    const result = await db.execute({
      sql: `INSERT INTO products (name, description, price, image_url, category, status, featured)
            VALUES (?, ?, ?, ?, ?, ?, ?)`,
      args: [
        product.name,
        product.description || null,
        product.price,
        product.image_url || null,
        product.category || null,
        product.status || 'active',
        product.featured || 0
      ]
    });

    const productId = Number(result.lastInsertRowid);

    // Insert versions
    if (versions && Array.isArray(versions)) {
      for (const version of versions) {
        if (version.name) {
          await db.execute({
            sql: `INSERT INTO product_versions (product_id, name, variation_type, attribute_value, price_modifier, stock, sku)
                  VALUES (?, ?, ?, ?, ?, ?, ?)`,
            args: [
              productId,
              version.name,
              version.variation_type || 'general',
              version.attribute_value || null,
              version.price_modifier || 0,
              version.stock || null,
              version.sku || null
            ]
          });
        }
      }
    }

    // Handle tags
    if (tags && Array.isArray(tags)) {
      for (const tagName of tags) {
        if (tagName && typeof tagName === 'string' && tagName.trim()) {
          const trimmed = tagName.trim().toLowerCase();
          await db.execute({
            sql: `INSERT OR IGNORE INTO tags (name, slug) VALUES (?, LOWER(REPLACE(?, ' ', '-')))`,
            args: [trimmed, trimmed]
          });
          await db.execute({
            sql: `INSERT OR IGNORE INTO product_tags (product_id, tag_id)
                  VALUES (?, (SELECT id FROM tags WHERE name = ?))`,
            args: [productId, trimmed]
          });
        }
      }
    }

    return NextResponse.json({ success: true, productId });
  } catch (error: any) {
    if (error.message === 'Unauthorized' || error.message === 'Forbidden') {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }
    console.error('Product creation error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
