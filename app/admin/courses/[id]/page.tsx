import { redirect } from 'next/navigation';
import { requireAdmin } from '@/lib/auth';
import db from '@/lib/db';
import { notFound } from 'next/navigation';
import CourseForm from '@/components/CourseForm';

export default async function EditCoursePage({ params }: { params: { id: string } }) {
  let user;
  try {
    user = await requireAdmin();
  } catch {
    redirect('/login');
  }

  const course = db.prepare('SELECT * FROM courses WHERE id = ?').get(parseInt(params.id)) as any;
  
  if (!course) {
    notFound();
  }

  const lessons = db.prepare(`
    SELECT * FROM lessons 
    WHERE course_id = ? 
    ORDER BY order_index ASC
  `).all(course.id) as any[];

  return (
    <div>
      <h1 className="text-2xl font-normal mb-6 text-[#1d2327]">Edit Course</h1>
      <div className="bg-white border border-[#c3c4c7] rounded-sm p-6">
        <CourseForm course={course} lessons={lessons} />
      </div>
    </div>
  );
}

