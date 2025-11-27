import db from '@/lib/db';
import Navbar from '@/components/Navbar';
import { notFound } from 'next/navigation';
import { getCurrentUser } from '@/lib/auth';
import EnrollButton from '@/components/EnrollButton';

export default async function CoursePage({ params }: { params: { id: string } }) {
  const course = db.prepare('SELECT * FROM courses WHERE id = ?').get(parseInt(params.id)) as any;
  
  if (!course) {
    notFound();
  }

  const lessons = db.prepare(`
    SELECT * FROM lessons 
    WHERE course_id = ? 
    ORDER BY order_index ASC
  `).all(course.id) as any[];

  const user = await getCurrentUser();
  let enrollment = null;
  if (user) {
    enrollment = db.prepare(`
      SELECT * FROM course_enrollments 
      WHERE user_id = ? AND course_id = ?
    `).get(user.id, course.id) as any;
  }

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-gray-50">
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-4xl mx-auto">
            <div className="bg-white rounded-lg shadow-lg overflow-hidden mb-6">
              {course.image_url && (
                <div className="aspect-video bg-gray-200">
                  <img
                    src={course.image_url}
                    alt={course.title}
                    className="w-full h-full object-cover"
                  />
                </div>
              )}
              <div className="p-8">
                <h1 className="text-3xl font-bold mb-4">{course.title}</h1>
                <p className="text-gray-600 mb-6">{course.description}</p>
                <div className="flex items-center justify-between">
                  <span className="text-2xl font-bold text-indigo-600">
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

            <div className="bg-white rounded-lg shadow-lg p-6">
              <h2 className="text-2xl font-bold mb-4">Lessons</h2>
              {lessons.length === 0 ? (
                <p className="text-gray-600">No lessons available yet.</p>
              ) : (
                <div className="space-y-2">
                  {lessons.map((lesson, index) => (
                    <div
                      key={lesson.id}
                      className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors"
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="font-semibold">
                            {index + 1}. {lesson.title}
                          </h3>
                          {lesson.duration && (
                            <p className="text-sm text-gray-500">
                              Duration: {Math.floor(lesson.duration / 60)}m {lesson.duration % 60}s
                            </p>
                          )}
                        </div>
                        {enrollment && (
                          <span className="text-sm text-indigo-600">
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

