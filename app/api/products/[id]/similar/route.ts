import { NextRequest, NextResponse } from 'next/server';
import db from '@/lib/db';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const productId = parseInt(id);
    const limit = 4; // Show up to 4 similar products

    // Get tags for this product
    const productTagsResult = await db.execute({
      sql: `SELECT t.id, t.name
            FROM tags t
            INNER JOIN product_tags pt ON t.id = pt.tag_id
            WHERE pt.product_id = ?`,
      args: [productId]
    });
    const productTags = productTagsResult.rows as Array<{ id: number; name: string }>;

    let similarProducts: any[] = [];

    if (productTags.length > 0) {
      // Find products with matching tags
      const tagIds = productTags.map(t => Number(t.id));

      const similarResult = await db.execute({
        sql: `SELECT DISTINCT p.*, 
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
        LIMIT ?`,
        args: [productId, ...tagIds, limit]
      });
      similarProducts = similarResult.rows as any[];
    }

    // If we don't have enough similar products by tags, fill with same category
    if (similarProducts.length < limit) {
      const currentProductResult = await db.execute({
        sql: 'SELECT category FROM products WHERE id = ?',
        args: [productId]
      });
      const currentProduct = currentProductResult.rows[0] as any;
      
      if (currentProduct?.category) {
        const excludeIds = similarProducts.map(p => Number(p.id));
        let categoryArgs: any[] = [productId, currentProduct.category];
        let excludeClause = '';
        
        if (excludeIds.length > 0) {
          excludeClause = ` AND p.id NOT IN (${excludeIds.map(() => '?').join(',')})`;
          categoryArgs.push(...excludeIds);
        }
        
        categoryArgs.push(limit - similarProducts.length);
        
        const categoryResult = await db.execute({
          sql: `SELECT DISTINCT p.*, 
                 COUNT(pv.id) as version_count
          FROM products p
          LEFT JOIN product_versions pv ON p.id = pv.product_id
          WHERE p.id != ? 
            AND p.status = 'active'
            AND p.category = ?
            ${excludeClause}
          GROUP BY p.id ORDER BY p.created_at DESC LIMIT ?`,
          args: categoryArgs
        });
        similarProducts = [...similarProducts, ...categoryResult.rows];
      }
    }

    // If still not enough, fill with any active products
    if (similarProducts.length < limit) {
      const excludeIds = similarProducts.map(p => Number(p.id));
      let remainingArgs: any[] = [productId];
      let excludeClause = '';
      
      if (excludeIds.length > 0) {
        excludeClause = ` AND p.id NOT IN (${excludeIds.map(() => '?').join(',')})`;
        remainingArgs.push(...excludeIds);
      }
      
      remainingArgs.push(limit - similarProducts.length);
      
      const remainingResult = await db.execute({
        sql: `SELECT DISTINCT p.*, 
               COUNT(pv.id) as version_count
        FROM products p
        LEFT JOIN product_versions pv ON p.id = pv.product_id
        WHERE p.id != ?
          AND p.status = 'active'
          ${excludeClause}
        GROUP BY p.id ORDER BY p.created_at DESC LIMIT ?`,
        args: remainingArgs
      });
      similarProducts = [...similarProducts, ...remainingResult.rows];
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
