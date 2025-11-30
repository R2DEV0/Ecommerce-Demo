import { NextRequest, NextResponse } from 'next/server';
import db from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const tags = db.prepare(`
      SELECT id, name, slug 
      FROM tags 
      ORDER BY name ASC
    `).all() as Array<{ id: number; name: string; slug: string }>;

    return NextResponse.json({ tags });
  } catch (error) {
    console.error('Tags fetch error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

