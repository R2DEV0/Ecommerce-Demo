import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth';
import db from '@/lib/db';

export async function POST(request: NextRequest) {
  try {
    const user = await requireAuth();
    const { courseId } = await request.json();

    if (!courseId) {
      return NextResponse.json(
        { error: 'Course ID is required' },
        { status: 400 }
      );
    }

    // Check if course exists
    const course = db.prepare('SELECT * FROM courses WHERE id = ?').get(courseId) as any;
    if (!course) {
      return NextResponse.json(
        { error: 'Course not found' },
        { status: 404 }
      );
    }

    // Check if already enrolled
    const existing = db.prepare(`
      SELECT id FROM course_enrollments 
      WHERE user_id = ? AND course_id = ?
    `).get(user.id, courseId);

    if (existing) {
      return NextResponse.json(
        { error: 'Already enrolled' },
        { status: 400 }
      );
    }

    // Create enrollment
    db.prepare(`
      INSERT INTO course_enrollments (user_id, course_id)
      VALUES (?, ?)
    `).run(user.id, courseId);

    return NextResponse.json({ success: true });
  } catch (error: any) {
    if (error.message === 'Unauthorized') {
      return NextResponse.json(
        { error: 'Please login to enroll' },
        { status: 401 }
      );
    }
    console.error('Enrollment error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

