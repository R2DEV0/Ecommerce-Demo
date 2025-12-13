import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/auth';
import db from '@/lib/db';

export async function POST(request: NextRequest) {
  try {
    const user = await requireAdmin();
    const { title, content, status } = await request.json();

    if (!title || !content) {
      return NextResponse.json(
        { error: 'Title and content are required' },
        { status: 400 }
      );
    }

    const result = await db.execute({
      sql: `INSERT INTO announcements (title, content, author_id, status)
            VALUES (?, ?, ?, ?)`,
      args: [title, content, user.id, status || 'published']
    });

    return NextResponse.json({ success: true, announcementId: Number(result.lastInsertRowid) });
  } catch (error: any) {
    if (error.message === 'Unauthorized' || error.message === 'Forbidden') {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }
    console.error('Announcement creation error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
