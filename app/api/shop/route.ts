import { NextRequest, NextResponse } from 'next/server';
import db from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
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

    const products = db.prepare(query).all(...params) as any[];

    // Get all available tags for filtering
    const allTags = db.prepare(`
      SELECT DISTINCT t.id, t.name, COUNT(pt.product_id) as product_count
      FROM tags t
      INNER JOIN product_tags pt ON t.id = pt.tag_id
      INNER JOIN products p ON pt.product_id = p.id
      WHERE p.status = 'active'
      GROUP BY t.id, t.name
      ORDER BY t.name ASC
    `).all() as Array<{ id: number; name: string; product_count: number }>;

    // Get all categories
    const categories = db.prepare(`
      SELECT DISTINCT category, COUNT(*) as product_count
      FROM products
      WHERE status = 'active' AND category IS NOT NULL AND category != ''
      GROUP BY category
      ORDER BY category ASC
    `).all() as Array<{ category: string; product_count: number }>;

    // Get price range
    const priceRange = db.prepare(`
      SELECT MIN(price) as min_price, MAX(price) as max_price
      FROM products
      WHERE status = 'active'
    `).get() as { min_price: number; max_price: number };

    return NextResponse.json({
      products,
      filters: {
        tags: allTags,
        categories,
        priceRange,
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

