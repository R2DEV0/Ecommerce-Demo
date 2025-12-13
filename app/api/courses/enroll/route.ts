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
    const courseResult = await db.execute({
      sql: 'SELECT * FROM courses WHERE id = ?',
      args: [courseId]
    });
    if (courseResult.rows.length === 0) {
      return NextResponse.json(
        { error: 'Course not found' },
        { status: 404 }
      );
    }

    // Check if already enrolled
    const existingResult = await db.execute({
      sql: `SELECT id FROM course_enrollments 
            WHERE user_id = ? AND course_id = ?`,
      args: [user.id, courseId]
    });

    if (existingResult.rows.length > 0) {
      return NextResponse.json(
        { error: 'Already enrolled' },
        { status: 400 }
      );
    }

    // Create enrollment
    await db.execute({
      sql: `INSERT INTO course_enrollments (user_id, course_id)
            VALUES (?, ?)`,
      args: [user.id, courseId]
    });

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
