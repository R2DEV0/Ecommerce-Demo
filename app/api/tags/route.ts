import { NextRequest, NextResponse } from 'next/server';
import db from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const result = await db.execute(`
      SELECT id, name, slug 
      FROM tags 
      ORDER BY name ASC
    `);

    return NextResponse.json({ tags: result.rows });
  } catch (error) {
    console.error('Tags fetch error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
