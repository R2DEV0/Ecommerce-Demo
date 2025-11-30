import { NextRequest, NextResponse } from 'next/server';
import db from '@/lib/db';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const productId = parseInt(params.id);
    const limit = 4; // Show up to 4 similar products

    // Get tags for this product
    const productTags = db.prepare(`
      SELECT t.id, t.name
      FROM tags t
      INNER JOIN product_tags pt ON t.id = pt.tag_id
      WHERE pt.product_id = ?
    `).all(productId) as Array<{ id: number; name: string }>;

    let similarProducts: any[] = [];

    if (productTags.length > 0) {
      // Find products with matching tags
      const tagIds = productTags.map(t => t.id);
      const tagNames = productTags.map(t => t.name);

      similarProducts = db.prepare(`
        SELECT DISTINCT p.*, 
               COUNT(pv.id) as version_count,
               COUNT(DISTINCT pt.tag_id) as matching_tags
        FROM products p
        LEFT JOIN product_versions pv ON p.id = pv.product_id
        INNER JOIN product_tags pt ON p.id = pt.product_id
        WHERE p.id != ? 
          AND p.status = 'active'
          AND pt.tag_id IN (${tagIds.map(() => '?').join(',')})
        GROUP BY p.id
        ORDER BY matching_tags DESC, p.created_at DESC
        LIMIT ?
      `).all(productId, ...tagIds, limit) as any[];
    }

    // If we don't have enough similar products by tags, fill with same category
    if (similarProducts.length < limit) {
      const currentProduct = db.prepare('SELECT category FROM products WHERE id = ?').get(productId) as any;
      
      if (currentProduct?.category) {
        const excludeIds = similarProducts.map(p => p.id);
        let categoryQuery = `
          SELECT DISTINCT p.*, 
                 COUNT(pv.id) as version_count
          FROM products p
          LEFT JOIN product_versions pv ON p.id = pv.product_id
          WHERE p.id != ? 
            AND p.status = 'active'
            AND p.category = ?
        `;
        const params: any[] = [productId, currentProduct.category];
        
        if (excludeIds.length > 0) {
          categoryQuery += ` AND p.id NOT IN (${excludeIds.map(() => '?').join(',')})`;
          params.push(...excludeIds);
        }
        
        categoryQuery += ` GROUP BY p.id ORDER BY p.created_at DESC LIMIT ?`;
        params.push(limit - similarProducts.length);
        
        const categoryProducts = db.prepare(categoryQuery).all(...params) as any[];
        similarProducts = [...similarProducts, ...categoryProducts];
      }
    }

    // If still not enough, fill with any active products
    if (similarProducts.length < limit) {
      const excludeIds = similarProducts.map(p => p.id);
      let remainingQuery = `
        SELECT DISTINCT p.*, 
               COUNT(pv.id) as version_count
        FROM products p
        LEFT JOIN product_versions pv ON p.id = pv.product_id
        WHERE p.id != ?
          AND p.status = 'active'
      `;
      const params: any[] = [productId];
      
      if (excludeIds.length > 0) {
        remainingQuery += ` AND p.id NOT IN (${excludeIds.map(() => '?').join(',')})`;
        params.push(...excludeIds);
      }
      
      remainingQuery += ` GROUP BY p.id ORDER BY p.created_at DESC LIMIT ?`;
      params.push(limit - similarProducts.length);
      
      const remainingProducts = db.prepare(remainingQuery).all(...params) as any[];
      similarProducts = [...similarProducts, ...remainingProducts];
    }

    return NextResponse.json({ products: similarProducts });
  } catch (error) {
    console.error('Similar products fetch error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

