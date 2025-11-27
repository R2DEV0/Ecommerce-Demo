import { redirect } from 'next/navigation';
import { requireAdmin } from '@/lib/auth';
import db from '@/lib/db';
import Navbar from '@/components/Navbar';
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
    <>
      <Navbar />
      <div className="min-h-screen bg-gray-50">
        <div className="container mx-auto px-4 py-8">
          <h1 className="text-3xl font-bold mb-6 text-gray-900">Edit Course</h1>
          <CourseForm course={course} lessons={lessons} />
        </div>
      </div>
    </>
  );
}

