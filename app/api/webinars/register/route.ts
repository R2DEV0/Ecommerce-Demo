import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth';
import db from '@/lib/db';

export async function POST(request: NextRequest) {
  try {
    const user = await requireAuth();
    const { webinarId } = await request.json();

    if (!webinarId) {
      return NextResponse.json(
        { error: 'Webinar ID is required' },
        { status: 400 }
      );
    }

    // Check if webinar exists
    const webinarResult = await db.execute({
      sql: 'SELECT * FROM webinars WHERE id = ?',
      args: [webinarId]
    });
    if (webinarResult.rows.length === 0) {
      return NextResponse.json(
        { error: 'Webinar not found' },
        { status: 404 }
      );
    }

    // Check if already registered
    const existingResult = await db.execute({
      sql: `SELECT id FROM webinar_registrations 
            WHERE user_id = ? AND webinar_id = ?`,
      args: [user.id, webinarId]
    });

    if (existingResult.rows.length > 0) {
      return NextResponse.json(
        { error: 'Already registered' },
        { status: 400 }
      );
    }

    // Create registration
    await db.execute({
      sql: `INSERT INTO webinar_registrations (user_id, webinar_id)
            VALUES (?, ?)`,
      args: [user.id, webinarId]
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    if (error.message === 'Unauthorized') {
      return NextResponse.json(
        { error: 'Please login to register' },
        { status: 401 }
      );
    }
    console.error('Registration error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
