import { redirect } from 'next/navigation';
import { requireAdmin } from '@/lib/auth';
import db, { initDatabase } from '@/lib/db';
import { notFound } from 'next/navigation';
import CourseForm from '@/components/CourseForm';

export const dynamic = 'force-dynamic';

export default async function EditCoursePage({ params }: { params: Promise<{ id: string }> }) {
  try {
    await requireAdmin();
  } catch {
    redirect('/login');
  }

  await initDatabase();
  const { id } = await params;

  const courseResult = await db.execute({
    sql: 'SELECT * FROM courses WHERE id = ?',
    args: [parseInt(id)]
  });
  const course = courseResult.rows[0] as any;
  
  if (!course) {
    notFound();
  }

  const lessonsResult = await db.execute({
    sql: `SELECT * FROM lessons 
          WHERE course_id = ? 
          ORDER BY order_index ASC`,
    args: [course.id]
  });
  const lessons = lessonsResult.rows as any[];

  return (
    <div className="w-full max-w-full">
      <h1 className="text-xl md:text-2xl font-normal mb-3 md:mb-6 text-[#1d2327]">Edit Course</h1>
      <div className="bg-white border border-[#c3c4c7] rounded-sm p-3 sm:p-4 md:p-6 w-full max-w-full">
        <CourseForm course={course} lessons={lessons} />
      </div>
    </div>
  );
}
