import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/auth';
import db from '@/lib/db';

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await requireAdmin();
    const { title, description, date_time, duration, meeting_url, status } = await request.json();
    const webinarId = parseInt(params.id);

    if (!title || !date_time) {
      return NextResponse.json(
        { error: 'Title and date/time are required' },
        { status: 400 }
      );
    }

    db.prepare(`
      UPDATE webinars 
      SET title = ?, description = ?, date_time = ?, duration = ?, meeting_url = ?, status = ?, updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `).run(
      title,
      description || null,
      date_time,
      duration || 60,
      meeting_url || null,
      status || 'scheduled',
      webinarId
    );

    return NextResponse.json({ success: true });
  } catch (error: any) {
    if (error.message === 'Unauthorized' || error.message === 'Forbidden') {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }
    console.error('Webinar update error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

