import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/auth';
import db from '@/lib/db';

export async function POST(request: NextRequest) {
  try {
    await requireAdmin();
    const { title, description, date_time, duration, meeting_url, status } = await request.json();

    if (!title || !date_time) {
      return NextResponse.json(
        { error: 'Title and date/time are required' },
        { status: 400 }
      );
    }

    const result = await db.execute({
      sql: `INSERT INTO webinars (title, description, date_time, duration, meeting_url, status)
            VALUES (?, ?, ?, ?, ?, ?)`,
      args: [
        title,
        description || null,
        date_time,
        duration || 60,
        meeting_url || null,
        status || 'scheduled'
      ]
    });

    return NextResponse.json({ success: true, webinarId: Number(result.lastInsertRowid) });
  } catch (error: any) {
    if (error.message === 'Unauthorized' || error.message === 'Forbidden') {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }
    console.error('Webinar creation error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
