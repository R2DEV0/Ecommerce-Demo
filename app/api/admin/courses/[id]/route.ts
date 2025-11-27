import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/auth';
import db from '@/lib/db';

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await requireAdmin();
    const { course, lessons } = await request.json();
    const courseId = parseInt(params.id);

    if (!course.title || course.price === undefined) {
      return NextResponse.json(
        { error: 'Course title and price are required' },
        { status: 400 }
      );
    }

    // Update course
    db.prepare(`
      UPDATE courses 
      SET title = ?, description = ?, price = ?, image_url = ?, status = ?, updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `).run(
      course.title,
      course.description || null,
      course.price,
      course.image_url || null,
      course.status || 'draft',
      courseId
    );

    // Delete existing lessons
    db.prepare('DELETE FROM lessons WHERE course_id = ?').run(courseId);

    // Insert new lessons
    if (lessons && Array.isArray(lessons)) {
      const insertLesson = db.prepare(`
        INSERT INTO lessons (course_id, title, content, order_index, duration, video_url)
        VALUES (?, ?, ?, ?, ?, ?)
      `);

      for (const lesson of lessons) {
        if (lesson.title) {
          insertLesson.run(
            courseId,
            lesson.title,
            lesson.content || null,
            lesson.order_index || 1,
            lesson.duration || 0,
            lesson.video_url || null
          );
        }
      }
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    if (error.message === 'Unauthorized' || error.message === 'Forbidden') {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }
    console.error('Course update error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

