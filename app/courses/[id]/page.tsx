import db, { initDatabase } from '@/lib/db';
import Navbar from '@/components/Navbar';
import { notFound } from 'next/navigation';
import { getCurrentUser } from '@/lib/auth';
import EnrollButton from '@/components/EnrollButton';

export default async function CoursePage({ params }: { params: Promise<{ id: string }> }) {
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

  const user = await getCurrentUser();
  let enrollment = null;
  if (user) {
    const enrollmentResult = await db.execute({
      sql: `SELECT * FROM course_enrollments 
            WHERE user_id = ? AND course_id = ?`,
      args: [user.id, course.id]
    });
    enrollment = enrollmentResult.rows[0] as any;
  }

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-gray-50">
        <div className="container mx-auto px-4 py-4 md:py-8">
          <div className="max-w-4xl mx-auto">
            <div className="bg-white rounded-lg shadow-lg overflow-hidden mb-4 md:mb-6">
              {course.image_url && (
                <div className="aspect-video bg-gray-200">
                  <img
                    src={course.image_url}
                    alt={course.title}
                    className="w-full h-full object-cover"
                  />
                </div>
              )}
              <div className="p-4 md:p-8">
                <h1 className="text-2xl md:text-3xl font-bold mb-3 md:mb-4">{course.title}</h1>
                <p className="text-sm md:text-base text-gray-600 mb-4 md:mb-6">{course.description}</p>
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                  <span className="text-xl md:text-2xl font-bold text-indigo-600">
                    {parseFloat(course.price) === 0 ? 'Free' : `$${parseFloat(course.price).toFixed(2)}`}
                  </span>
                  {user && !enrollment && (
                    <EnrollButton courseId={course.id} price={parseFloat(course.price)} />
                  )}
                  {enrollment && (
                    <div className="text-sm text-gray-600">
                      Progress: {enrollment.progress}%
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-lg p-4 md:p-6">
              <h2 className="text-xl md:text-2xl font-bold mb-3 md:mb-4">Lessons</h2>
              {lessons.length === 0 ? (
                <p className="text-sm md:text-base text-gray-600">No lessons available yet.</p>
              ) : (
                <div className="space-y-2">
                  {lessons.map((lesson, index) => (
                    <div
                      key={lesson.id}
                      className="border border-gray-200 rounded-lg p-3 md:p-4 hover:bg-gray-50 transition-colors"
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                        <div className="flex-1">
                          <h3 className="font-semibold text-sm md:text-base">
                            {index + 1}. {lesson.title}
                          </h3>
                          {lesson.duration && (
                            <p className="text-xs md:text-sm text-gray-500">
                              Duration: {Math.floor(lesson.duration / 60)}m {lesson.duration % 60}s
                            </p>
                          )}
                        </div>
                        {enrollment && (
                          <span className="text-xs md:text-sm text-indigo-600">
                            {enrollment.completed ? '✓ Completed' : 'In Progress'}
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
