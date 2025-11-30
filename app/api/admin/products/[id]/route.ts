import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/auth';
import db from '@/lib/db';

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await requireAdmin();
    const { product, versions, tags } = await request.json();
    const productId = parseInt(params.id);

    if (!product.name || product.price === undefined) {
      return NextResponse.json(
        { error: 'Product name and price are required' },
        { status: 400 }
      );
    }

    // Update product
    db.prepare(`
      UPDATE products 
      SET name = ?, description = ?, price = ?, image_url = ?, category = ?, status = ?, featured = ?, updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `).run(
      product.name,
      product.description || null,
      product.price,
      product.image_url || null,
      product.category || null,
      product.status || 'active',
      product.featured || 0,
      productId
    );

    // Delete existing versions
    db.prepare('DELETE FROM product_versions WHERE product_id = ?').run(productId);

    // Insert new versions
    if (versions && Array.isArray(versions)) {
      const insertVersion = db.prepare(`
        INSERT INTO product_versions (product_id, name, variation_type, attribute_value, price_modifier, stock, sku)
        VALUES (?, ?, ?, ?, ?, ?, ?)
      `);

      for (const version of versions) {
        if (version.name) {
          insertVersion.run(
            productId,
            version.name,
            version.variation_type || 'general',
            version.attribute_value || null,
            version.price_modifier || 0,
            version.stock || null,
            version.sku || null
          );
        }
      }
    }

    // Handle tags - delete existing and add new
    db.prepare('DELETE FROM product_tags WHERE product_id = ?').run(productId);
    
    if (tags && Array.isArray(tags)) {
      const insertTag = db.prepare(`
        INSERT OR IGNORE INTO tags (name, slug)
        VALUES (?, LOWER(REPLACE(?, ' ', '-')))
      `);
      const insertProductTag = db.prepare(`
        INSERT OR IGNORE INTO product_tags (product_id, tag_id)
        VALUES (?, (SELECT id FROM tags WHERE name = ?))
      `);

      for (const tagName of tags) {
        if (tagName && typeof tagName === 'string' && tagName.trim()) {
          const trimmed = tagName.trim().toLowerCase();
          insertTag.run(trimmed, trimmed);
          insertProductTag.run(productId, trimmed);
        }
      }
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    if (error.message === 'Unauthorized' || error.message === 'Forbidden') {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }
    console.error('Product update error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

