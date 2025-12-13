import { NextRequest, NextResponse } from 'next/server';
import db, { initDatabase } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    await initDatabase();
    
    const { searchParams } = new URL(request.url);
    const tags = searchParams.get('tags')?.split(',').filter(Boolean) || [];
    const category = searchParams.get('category') || '';
    const minPrice = searchParams.get('minPrice');
    const maxPrice = searchParams.get('maxPrice');
    const search = searchParams.get('search') || '';

    let query = `
      SELECT DISTINCT p.*, 
             COUNT(pv.id) as version_count
      FROM products p
      LEFT JOIN product_versions pv ON p.id = pv.product_id
      WHERE p.status = 'active'
    `;
    const params: any[] = [];

    // Search filter
    if (search) {
      query += ` AND (p.name LIKE ? OR p.description LIKE ?)`;
      const searchTerm = `%${search}%`;
      params.push(searchTerm, searchTerm);
    }

    // Category filter
    if (category) {
      query += ` AND p.category = ?`;
      params.push(category);
    }

    // Price filters
    if (minPrice) {
      query += ` AND p.price >= ?`;
      params.push(parseFloat(minPrice));
    }
    if (maxPrice) {
      query += ` AND p.price <= ?`;
      params.push(parseFloat(maxPrice));
    }

    // Tags filter
    if (tags.length > 0) {
      query += ` AND p.id IN (
        SELECT DISTINCT pt.product_id
        FROM product_tags pt
        INNER JOIN tags t ON pt.tag_id = t.id
        WHERE t.name IN (${tags.map(() => '?').join(',')})
      )`;
      params.push(...tags);
    }

    query += ` GROUP BY p.id ORDER BY p.created_at DESC`;

    const productsResult = await db.execute({ sql: query, args: params });
    const products = productsResult.rows;

    // Get all available tags for filtering
    const allTagsResult = await db.execute(`
      SELECT DISTINCT t.id, t.name, COUNT(pt.product_id) as product_count
      FROM tags t
      INNER JOIN product_tags pt ON t.id = pt.tag_id
      INNER JOIN products p ON pt.product_id = p.id
      WHERE p.status = 'active'
      GROUP BY t.id, t.name
      ORDER BY t.name ASC
    `);

    // Get all categories
    const categoriesResult = await db.execute(`
      SELECT DISTINCT category, COUNT(*) as product_count
      FROM products
      WHERE status = 'active' AND category IS NOT NULL AND category != ''
      GROUP BY category
      ORDER BY category ASC
    `);

    // Get price range
    const priceRangeResult = await db.execute(`
      SELECT MIN(price) as min_price, MAX(price) as max_price
      FROM products
      WHERE status = 'active'
    `);

    return NextResponse.json({
      products,
      filters: {
        tags: allTagsResult.rows,
        categories: categoriesResult.rows,
        priceRange: priceRangeResult.rows[0] || { min_price: 0, max_price: 100 },
      },
    });
  } catch (error) {
    console.error('Shop fetch error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
